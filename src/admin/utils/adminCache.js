// Session-level in-memory cache — data persists until the browser tab is closed
// or explicitly invalidated (e.g. by the Refresh button after a mutation).
const store = {};

export function getCached(key) {
  return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
}

export function setCached(key, value) {
  store[key] = value;
}

export function invalidateCache(...keys) {
  keys.forEach((k) => delete store[k]);
}
