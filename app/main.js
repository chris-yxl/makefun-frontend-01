// A make.fun frontend: the board, a bounty page, its leaderboard and an
// account's public profile, on hash routes.
//
//   #/                              the board
//   #/bounty/<slug>                 one bounty
//   #/bounty/<slug>/leaderboard[/n] that bounty's leaderboard, page n
//   #/profile/<handle>              an account's public profile
//
// window.__shotReady is false while a page loads and true once its data is on
// screen, so a screenshot script knows when to capture.

import { getBounties, getBounty, getLeaderboard, getProfile } from './api.js';
import { board, bounty, leaderboard, profile } from './views.js';

const app = document.getElementById('app');
let query = '';

function fail(err) {
  app.innerHTML = `<p class="error">Could not load this page: ${err.message}. <a href="#/">Back to the board</a></p>`;
}

async function render() {
  window.__shotReady = false;
  app.innerHTML = '<p>Loading…</p>';
  const hash = location.hash || '#/';
  try {
    const lbMatch = hash.match(/^#\/bounty\/([^/]+)\/leaderboard(?:\/(\d+))?$/);
    const bountyMatch = hash.match(/^#\/bounty\/([^/]+)$/);
    const profileMatch = hash.match(/^#\/profile\/([^/]+)$/);
    if (lbMatch) {
      const slug = decodeURIComponent(lbMatch[1]);
      const lb = await getLeaderboard(slug);
      document.title = `${lb.competition.title} leaderboard | make.fun bounties`;
      app.innerHTML = leaderboard(lb, Number(lbMatch[2] ?? 1));
    } else if (bountyMatch) {
      const b = await getBounty(decodeURIComponent(bountyMatch[1]));
      document.title = `${b.title} | make.fun bounties`;
      app.innerHTML = bounty(b);
    } else if (profileMatch) {
      const p = await getProfile(decodeURIComponent(profileMatch[1]));
      document.title = `@${p.handle} | make.fun bounties`;
      app.innerHTML = profile(p);
    } else {
      document.title = 'make.fun bounties';
      app.innerHTML = board(await getBounties(), query);
    }
  } catch (err) {
    fail(err);
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

// Board search: delegated on #app so it survives re-renders. The board data
// is cached in api.js, so filtering re-renders without a new request.
app.addEventListener('input', (ev) => {
  if (ev.target.id !== 'q') return;
  query = ev.target.value;
  const pos = ev.target.selectionStart;
  const wasActive = document.activeElement === ev.target;
  getBounties().then((data) => {
    app.innerHTML = board(data, query);
    const next = document.getElementById('q');
    if (next && wasActive) {
      next.focus();
      next.setSelectionRange(pos, pos);
    }
  });
});

window.addEventListener('hashchange', render);
render();
