// make.fun's public API: read-only GET requests, open to any origin (CORS).
// The full API is described at https://make.fun/api/openapi.json.
//
// Every answer is cached in memory and revalidated with its ETag: the API's
// ETags are bound to the minute, so an If-None-Match inside the same minute
// answers 304 and we reuse the body without paying for it again. A cached
// answer younger than 60 s is reused without even asking.

const API = 'https://make.fun/api';
const cache = new Map(); // path -> { etag, data, at }

async function get(path) {
  const hit = cache.get(path);
  const now = Date.now();
  if (hit && now - hit.at < 60000) return hit.data;
  const headers = {};
  if (hit?.etag) headers['If-None-Match'] = hit.etag;
  const res = await fetch(API + path, { headers });
  if (res.status === 304 && hit) {
    hit.at = now;
    return hit.data;
  }
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  const etag = res.headers.get('ETag');
  const data = await res.json();
  cache.set(path, { etag, data, at: now });
  return data;
}

/** The open bounties: { items: [...] } (activity=times leaves out the activity a board does not show). */
export const getBounties = () => get('/competitions?status=open&activity=times');

/** One bounty, by its slug. */
export const getBounty = (slug) => get(`/competitions/${encodeURIComponent(slug)}`);

/** One bounty's leaderboard: { competition, phase, columns, entries: [...] }. */
export const getLeaderboard = (slug) => get(`/competitions/${encodeURIComponent(slug)}/leaderboard`);

/** One account's public profile: { handle, bio, wallet, record, solutions: [...] }. */
export const getProfile = (handle) => get(`/profiles/${encodeURIComponent(handle)}`);
