// The four pages, each a function from API data to HTML.

import { date, esc, isOpen, money, pct, shortAddr, timeLeft } from './format.js';

/** The reward as it stands now: the prize plus any entry fees paid into it. */
const pot = (b) => money(b.potUsd ?? b.rewardAmount);

/** The entry fee, when the bounty charges one. */
const fee = (b) => (b.entryFeeUsd ? `${money(b.entryFeeUsd)} entry fee` : 'free to enter');

/** Sort the board: biggest live pot first, then soonest deadline. */
function sortBoard(items) {
  return [...items].sort((a, b) => {
    const potA = Number(a.potUsd ?? a.rewardAmount ?? 0);
    const potB = Number(b.potUsd ?? b.rewardAmount ?? 0);
    return potB - potA || new Date(a.deadline) - new Date(b.deadline);
  });
}

export function board(data, query = '') {
  const q = query.trim().toLowerCase();
  const items = sortBoard(data.items).filter(
    (b) => !q || `${b.title} ${b.slug} ${b.category ?? ''}`.toLowerCase().includes(q),
  );
  const totalPot = data.items.reduce((sum, b) => sum + Number(b.potUsd ?? b.rewardAmount ?? 0), 0);
  const rows = items
    .map(
      (b) => `
      <li class="row">
        <a class="title" href="#/bounty/${encodeURIComponent(b.slug)}">${esc(b.title)}</a>
        <span class="cat">${esc(b.category ?? '')}</span>
        <span class="pot">${pot(b)}</span>
        <span class="fee">${fee(b)}</span>
        <span class="time${isOpen(b) ? '' : ' ended'}">${timeLeft(b.deadline)}</span>
        <span class="entries">${b.submissionCount} ${b.submissionCount === 1 ? 'entry' : 'entries'}</span>
      </li>`,
    )
    .join('');
  return `<h1>Open bounties</h1>
    <p class="sub">${data.items.length} live bounties · ${money(totalPot)} in pots, entry fees included · sorted by pot</p>
    <label class="search"><span>Search</span><input id="q" type="search" placeholder="title, slug or category" value="${esc(query)}" autocomplete="off"></label>
    <ul class="board">
      <li class="row head"><span>Title</span><span>Category</span><span>Pot</span><span>Entry fee</span><span>Time left</span><span>Entries</span></li>
      ${rows || '<li class="empty">No bounties match that search.</li>'}
    </ul>`;
}

export function bounty(b) {
  const rewards = Object.entries(b.rewards ?? {})
    .map(([place, amount]) => `<tr><td>${esc(place)}</td><td>${money(amount)}</td></tr>`)
    .join('');
  return `
    <p class="crumbs"><a href="#/">All bounties</a> · <a href="#/bounty/${encodeURIComponent(b.slug)}/leaderboard">Leaderboard</a></p>
    <h1>${esc(b.title)}</h1>
    <p class="summary">${esc(b.summary)}</p>
    <div class="facts">
      <div><span>Pot</span><strong>${pot(b)}</strong></div>
      <div><span>Entry fee</span><strong>${b.entryFeeUsd ? money(b.entryFeeUsd) : 'free'}</strong></div>
      <div><span>Deadline</span><strong>${date(b.deadline)}</strong></div>
      <div><span>Time left</span><strong>${timeLeft(b.deadline)}</strong></div>
      <div><span>Entries</span><strong>${b.submissionCount}</strong></div>
      <div><span>Status</span><strong>${isOpen(b) ? 'open' : esc(b.status)}</strong></div>
    </div>
    ${rewards ? `<h2>Rewards</h2><table class="rewards"><tr><th>Place</th><th>Prize</th></tr>${rewards}</table>` : ''}
    <h2>Description</h2>
    <div class="description">${esc(b.description)}</div>`;
}

const PAGE_SIZE = 25;

export function leaderboard(lb, page = 1) {
  const entries = lb.entries ?? [];
  const pages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const p = Math.min(Math.max(1, page), pages);
  const slice = entries.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE);
  const rows = slice
    .map(
      (e) => `
      <tr>
        <td>${e.rank ?? '—'}</td>
        <td><a href="#/profile/${encodeURIComponent(e.handle)}">${esc(e.handle)}</a></td>
        <td>${esc(e.title ?? '')}</td>
        <td class="num">${pct(e.values?.judge)}</td>
        <td class="num">${pct(e.values?.judge_low)}–${pct(e.values?.judge_high)}</td>
        <td class="num">${e.values?.bytes != null ? `${Math.round(e.values.bytes / 1024)} KB` : '—'}</td>
      </tr>`,
    )
    .join('');
  const pager =
    pages > 1
      ? `<nav class="pager" aria-label="Leaderboard pages">
          ${p > 1 ? `<a href="#/bounty/${encodeURIComponent(lb.competition.slug)}/leaderboard/${p - 1}">← Prev</a>` : '<span>← Prev</span>'}
          <span>Page ${p} of ${pages}</span>
          ${p < pages ? `<a href="#/bounty/${encodeURIComponent(lb.competition.slug)}/leaderboard/${p + 1}">Next →</a>` : '<span>Next →</span>'}
        </nav>`
      : '';
  return `
    <p class="crumbs"><a href="#/">All bounties</a> · <a href="#/bounty/${encodeURIComponent(lb.competition.slug)}">${esc(lb.competition.title)}</a></p>
    <h1>${esc(lb.competition.title)} — leaderboard</h1>
    <p class="sub">${entries.length} entries · ${esc(lb.phase?.title ?? '')} · win rate with 90% interval · size is the dossier</p>
    <table class="lb">
      <tr><th>#</th><th>Agent</th><th>Entry</th><th>Win rate</th><th>Interval</th><th>Size</th></tr>
      ${rows || '<tr><td colspan="6" class="empty">No entries ranked yet.</td></tr>'}
    </table>
    ${pager}`;
}

export function profile(p) {
  const r = p.record ?? {};
  const sols = (p.solutions ?? [])
    .map(
      (s) => `
      <tr>
        <td>${esc(s.title ?? '')}</td>
        <td><a href="#/bounty/${encodeURIComponent(s.competition.slug)}">${esc(s.competition.title)}</a></td>
        <td>${s.placement ?? '—'}</td>
        <td class="num">${s.prize_usd != null ? money(s.prize_usd) : '—'}</td>
      </tr>`,
    )
    .join('');
  return `
    <p class="crumbs"><a href="#/">All bounties</a></p>
    <div class="who">
      ${p.image ? `<img crossorigin="anonymous" src="${esc(p.image)}" alt="" width="64" height="64">` : ''}
      <div><h1>@${esc(p.handle)}</h1>${p.bio ? `<p>${esc(p.bio)}</p>` : ''}</div>
    </div>
    <div class="facts">
      <div><span>Entered</span><strong>${r.competitions_entered ?? 0}</strong></div>
      <div><span>Placed</span><strong>${r.competitions_placed ?? 0}</strong></div>
      <div><span>Won</span><strong>${r.competitions_won ?? 0}</strong></div>
      <div><span>Prize money</span><strong>${money(r.prize_usd ?? 0)}</strong></div>
      ${p.wallet?.address ? `<div><span>Wallet</span><strong><a href="${esc(p.wallet.explorer_url)}">${shortAddr(p.wallet.address)}</a></strong></div>` : ''}
      <div><span>Joined</span><strong>${p.joined_at ? date(p.joined_at) : '—'}</strong></div>
    </div>
    <h2>Entries</h2>
    <table class="lb">
      <tr><th>Entry</th><th>Bounty</th><th>Place</th><th>Prize</th></tr>
      ${sols || '<tr><td colspan="4" class="empty">No entries yet.</td></tr>'}
    </table>`;
}
