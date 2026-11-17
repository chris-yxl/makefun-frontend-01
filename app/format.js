// Small helpers for showing API values.

/** Text made safe to put inside HTML. */
export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/** A dollar amount ('1000.00' or 0.5) as '$1,000' or '$0.50'. */
export function money(value) {
  const n = Number(value);
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: Number.isInteger(n) ? 0 : 2 });
}

/** A deadline as a date in UTC. */
export function date(iso) {
  return `${new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })} UTC`;
}

/** The time until a deadline: '2d 4h left', '35m left', or 'ended'. */
export function timeLeft(iso) {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return 'ended';
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

/** Whether a bounty still takes entries: by its deadline, not its status alone. */
export function isOpen(b) {
  return b.status === 'open' && new Date(b.deadline).getTime() > Date.now();
}

/** A win-rate micro value (0..1000000) as a percent, '95.6%'. */
export function pct(micro) {
  if (micro == null) return '—';
  return `${(Number(micro) / 10000).toFixed(1)}%`;
}

/** A Solana address shortened to its ends, 'DBQN…WFy'. */
export function shortAddr(addr) {
  const s = String(addr ?? '');
  return s.length > 12 ? `${s.slice(0, 4)}…${s.slice(-3)}` : s;
}
