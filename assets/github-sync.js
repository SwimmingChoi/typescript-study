/*
 * github-sync.js — 브라우저에서 GitHub 저장소에 진행 상태를 직접 커밋한다.
 *
 * 서버가 없으므로 쓰기에는 fine-grained PAT 이 필요하다. 토큰은 이 브라우저의
 * localStorage 에만 저장되고 GitHub 이외의 어디로도 전송되지 않는다.
 * 읽기는 공개 저장소라면 토큰 없이 raw.githubusercontent.com 으로 처리한다.
 */
(function () {
  'use strict';

  var CFG_KEY = 'ts-study-gh-config-v1';
  var API = 'https://api.github.com';

  /* ---------- 인코딩 ---------- */

  function b64encode(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = '';
    for (var i = 0; i < bytes.length; i += 0x8000) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return btoa(bin);
  }

  function b64decode(s) {
    var bin = atob(String(s).replace(/\s/g, ''));
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  /* ---------- 설정 ---------- */

  function getConfig() {
    try {
      var c = JSON.parse(localStorage.getItem(CFG_KEY) || 'null');
      return c && c.owner && c.repo && c.token ? c : null;
    } catch (e) {
      return null;
    }
  }

  function setConfig(c) {
    localStorage.setItem(CFG_KEY, JSON.stringify(c));
  }

  function clearConfig() {
    try { localStorage.removeItem(CFG_KEY); } catch (e) {}
  }

  /*
   * GitHub Pages 에서 열렸다면 URL 로 owner/repo 를 추론한다.
   *   owner.github.io/repo/      → { owner, repo }
   *   owner.github.io/           → { owner, repo: owner + '.github.io' }
   * 그 외(로컬 파일, 커스텀 도메인)에서는 null.
   */
  function inferRepo() {
    var host = location.hostname || '';
    var m = /^([a-z0-9-]+)\.github\.io$/i.exec(host);
    if (!m) return null;
    var owner = m[1];
    var seg = location.pathname.split('/').filter(Boolean);
    return { owner: owner, repo: seg.length ? seg[0] : owner + '.github.io' };
  }

  /* ---------- 저수준 API ---------- */

  function api(cfg, path, opts) {
    opts = opts || {};
    var headers = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
    if (cfg && cfg.token) headers.Authorization = 'Bearer ' + cfg.token;
    if (opts.body) headers['Content-Type'] = 'application/json';

    return fetch(API + path, {
      method: opts.method || 'GET',
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      cache: 'no-store'
    }).then(function (res) {
      if (res.status === 404 && opts.allow404) return null;
      if (res.status === 204) return null;
      if (!res.ok) {
        return res.text().then(function (t) {
          var msg = res.statusText;
          try { msg = JSON.parse(t).message || msg; } catch (e) {}
          var err = new Error(msg);
          err.status = res.status;
          throw err;
        });
      }
      return res.json();
    });
  }

  /* ---------- 공개 동작 ---------- */

  /* 토큰과 저장소를 검증한다. 쓰기 권한이 없으면 거부한다. */
  function verify(cfg) {
    return api(cfg, '/repos/' + cfg.owner + '/' + cfg.repo).then(function (repo) {
      var perms = repo.permissions || {};
      if (!perms.push) {
        throw new Error('이 토큰에는 ' + cfg.owner + '/' + cfg.repo +
          ' 의 쓰기(Contents: Read and write) 권한이 없습니다.');
      }
      return { defaultBranch: repo.default_branch, private: repo.private };
    });
  }

  /* progress.json 을 읽는다. 없으면 null. */
  function pull(cfg, path) {
    path = path || 'progress.json';
    var branch = (cfg && cfg.branch) || 'main';

    if (cfg && cfg.token) {
      var url = '/repos/' + cfg.owner + '/' + cfg.repo + '/contents/' +
        encodeURIComponent(path) + '?ref=' + encodeURIComponent(branch) +
        '&nocache=' + Date.now();
      return api(cfg, url, { allow404: true }).then(function (file) {
        if (!file || !file.content) return null;
        return { state: JSON.parse(b64decode(file.content)), sha: file.sha };
      });
    }

    // 토큰 없이 읽기 — 공개 저장소 전용. CDN 캐시 때문에 최대 몇 분 지연될 수 있다.
    var raw = 'https://raw.githubusercontent.com/' + cfg.owner + '/' + cfg.repo +
      '/' + branch + '/' + path + '?t=' + Date.now();
    return fetch(raw, { cache: 'no-store' }).then(function (res) {
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('progress.json 읽기 실패 (' + res.status + ')');
      return res.json();
    }).then(function (state) {
      return state ? { state: state, sha: null } : null;
    });
  }

  /*
   * 여러 파일을 하나의 커밋으로 푸시한다. files = [{ path, content }]
   * Git Data API 를 쓰기 때문에 progress.json 과 마크다운이 항상 같은 커밋에 묶인다.
   */
  function push(cfg, files, message) {
    var base = '/repos/' + cfg.owner + '/' + cfg.repo;
    var branch = cfg.branch || 'main';
    var headSha, baseTree;

    return api(cfg, base + '/git/ref/heads/' + branch)
      .then(function (ref) {
        headSha = ref.object.sha;
        return api(cfg, base + '/git/commits/' + headSha);
      })
      .then(function (commit) {
        baseTree = commit.tree.sha;
        return Promise.all(files.map(function (f) {
          return api(cfg, base + '/git/blobs', {
            method: 'POST',
            body: { content: b64encode(f.content), encoding: 'base64' }
          }).then(function (blob) {
            return { path: f.path, mode: '100644', type: 'blob', sha: blob.sha };
          });
        }));
      })
      .then(function (entries) {
        return api(cfg, base + '/git/trees', {
          method: 'POST',
          body: { base_tree: baseTree, tree: entries }
        });
      })
      .then(function (tree) {
        if (tree.sha === baseTree) return null; // 내용이 같으면 빈 커밋을 만들지 않는다
        return api(cfg, base + '/git/commits', {
          method: 'POST',
          body: { message: message, tree: tree.sha, parents: [headSha] }
        });
      })
      .then(function (commit) {
        if (!commit) return { commitSha: headSha, unchanged: true };
        return api(cfg, base + '/git/refs/heads/' + branch, {
          method: 'PATCH',
          body: { sha: commit.sha }
        }).then(function () {
          return { commitSha: commit.sha, unchanged: false };
        });
      });
  }

  window.GHSync = {
    getConfig: getConfig,
    setConfig: setConfig,
    clearConfig: clearConfig,
    inferRepo: inferRepo,
    verify: verify,
    pull: pull,
    push: push
  };
})();
