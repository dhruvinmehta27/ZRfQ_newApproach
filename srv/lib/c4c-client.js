'use strict';

/**
 * HTTP client for SAP C4C custom RFQ OData service.
 *
 * Destination : C4C_QUA_HARDCODED  (BasicAuthentication)
 * Service root: /sap/c4c/odata/cust/v1/zrfq
 *
 * CSRF note: C4C returns HTTP 500 on HEAD requests, so CSRF tokens are
 * fetched with a GET (top=1) before every mutating operation.
 * Tokens are cached for CSRF_TTL ms to limit extra round-trips.
 */

// ── External dependencies ─────────────────────────────────────────────────────
// axios: HTTP client used to call the C4C OData v2 REST API
// resolveDestination: reads the BTP Destination (C4C_QUA_HARDCODED) to get
//   the base URL and credentials so we never hardcode passwords in source
const axios = require('axios');
const { resolveDestination } = require('./destination');

// ── Constants ─────────────────────────────────────────────────────────────────
// DEST_NAME  : name of the BTP Destination that holds the C4C host + BasicAuth
// BASE_SVC   : OData v2 service root path on the C4C tenant
// ROOT_COLL  : full path to the top-level RFQ collection
// CSRF_TTL   : how long (ms) a fetched CSRF token is considered valid before
//              we re-fetch — set to 9 min (SAP sessions are ~10 min)
const DEST_NAME  = 'C4C_QUA_HARDCODED';
const BASE_SVC   = '/sap/c4c/odata/cust/v1/zrfq';
const ROOT_COLL  = `${BASE_SVC}/RFQRootCollection`;
const CSRF_TTL   = 9 * 60 * 1000; // 9 minutes

// ── In-memory CSRF token cache ────────────────────────────────────────────────
// token    : the raw token string returned by C4C in the x-csrf-token header
// cookies  : session cookies from the Set-Cookie header; must be echoed back
//            on every mutating request so C4C recognises the authenticated session
// fetchedAt: timestamp used to decide when the token has expired (see CSRF_TTL)
let _csrf = { token: null, cookies: '', fetchedAt: 0 };

// ── Axios instance factory ────────────────────────────────────────────────────
// Creates a pre-configured axios instance for every request.
// Reading the destination fresh each time ensures that rotated credentials
// or changed destination config are picked up without restarting the server.
async function _client() {
  // resolveDestination returns { baseURL, auth } from the BTP destination config
  const { baseURL, auth } = await resolveDestination(DEST_NAME);
  return axios.create({
    baseURL,
    auth,                              // Basic auth credentials from the destination
    headers: { Accept: 'application/json' }, // ask C4C to respond in JSON, not XML
    timeout: 30_000                    // 30-second ceiling so hung C4C calls don't block Node
  });
}

// ── CSRF token fetch (GET instead of HEAD) ────────────────────────────────────
// C4C returns HTTP 500 on HEAD requests, so we use a cheap GET ($top=1) to
// retrieve the CSRF token from the response headers.
// The token + session cookies are cached in _csrf for CSRF_TTL ms so that
// rapid sequences of writes (e.g., save + navigate) don't each pay an extra round-trip.
async function _csrf_token() {
  // Return cached token if it is still within its validity window
  if (_csrf.token && Date.now() - _csrf.fetchedAt < CSRF_TTL) return _csrf;

  const client = await _client();
  // Send x-csrf-token: Fetch to tell C4C to return a new token in the response header
  const r = await client.get(ROOT_COLL, {
    params: { $top: '1', $format: 'json' },
    headers: { 'x-csrf-token': 'Fetch', 'x-requested-with': 'XMLHttpRequest' }
  });

  // Store the token and any session cookies that must be echoed on subsequent calls
  _csrf = {
    token     : r.headers['x-csrf-token'] || '',
    cookies   : [].concat(r.headers['set-cookie'] || []).join('; '),
    fetchedAt : Date.now()
  };
  return _csrf;
}

// ── Root entity CRUD ──────────────────────────────────────────────────────────

// Fetches only the first C4C page (up to ~1000 rows) of the RFQ collection.
// Returns { results, nextUrl } where nextUrl is the OData __next skiptoken link.
// Used at startup to warm the in-memory cache quickly; pagination beyond page 1
// is intentionally avoided to prevent Node.js heap exhaustion (89k+ records).
async function listRFQsFirstPage(odataParams = {}) {
  const client = await _client();
  // Strip $top / $skip from the caller's params — C4C ignores them alongside
  // server-side paging and the strippage prevents accidental 400 errors
  const { $top, $skip, ...c4cParams } = odataParams;
  console.log('[c4c] listRFQs page 1 – fetching…');
  const r = await client.get(ROOT_COLL, { params: { $format: 'json', ...c4cParams } });
  // C4C OData v2 wraps the row array in d.results; v4 uses value directly
  const d = r.data?.d;
  const results = d?.results ?? r.data?.value ?? [];
  console.log(`[c4c] listRFQs page 1 – got ${results.length} rows`);
  // nextUrl holds the C4C skiptoken link for page 2 (not currently followed)
  return { results, nextUrl: d?.__next ?? null };
}

// Thin convenience wrapper kept for any remaining callers that only need rows.
// Internally calls listRFQsFirstPage and discards the nextUrl.
async function listRFQs(odataParams = {}) {
  const { results } = await listRFQsFirstPage(odataParams);
  return results;
}

// Reads a single RFQ by its ObjectID key from C4C.
// Note: C4C sometimes returns HTTP 500 for key-based reads on this collection;
// the calling code in service.js wraps this in a try/catch and falls back to
// a cached stub record rather than surfacing the 500 to the browser.
async function getRFQ(id) {
  const client = await _client();
  // OData v2 key address: Collection('key')
  const r = await client.get(`${ROOT_COLL}('${encodeURIComponent(id)}')`, {
    params: { $format: 'json' }
  });
  // C4C OData v2 wraps single-entity responses in d; v4-style responses use the root
  return r.data?.d ?? r.data;
}

// Creates a new RFQ in C4C.
// Fetches (or reuses) a CSRF token first — C4C rejects POSTs without it.
async function createRFQ(payload) {
  const { token, cookies } = await _csrf_token();
  const client = await _client();
  const r = await client.post(ROOT_COLL, payload, {
    // x-csrf-token and Cookie headers authenticate the mutating request
    headers: { 'Content-Type': 'application/json', 'x-csrf-token': token, Cookie: cookies }
  });
  return r.data?.d ?? r.data;
}

// Updates an existing RFQ using PATCH (partial update — only supplied fields change).
async function updateRFQ(id, payload) {
  const { token, cookies } = await _csrf_token();
  const client = await _client();
  // PATCH to the key address updates only the provided fields, leaving others intact
  await client.patch(`${ROOT_COLL}('${encodeURIComponent(id)}')`, payload, {
    headers: { 'Content-Type': 'application/json', 'x-csrf-token': token, Cookie: cookies }
  });
}

// Deletes an RFQ from C4C permanently by ObjectID.
async function deleteRFQ(id) {
  const { token, cookies } = await _csrf_token();
  const client = await _client();
  await client.delete(`${ROOT_COLL}('${encodeURIComponent(id)}')`, {
    headers: { 'x-csrf-token': token, Cookie: cookies }
  });
}

// ── Generic child-entity CRUD ─────────────────────────────────────────────────
// All child collections (items, parties, notes, etc.) share these helpers.
// The c4cCollection argument is the bare collection name, e.g. "RFQItemCollection".
// ParentObjectID filtering is applied by the caller via odataParams.$filter so
// the helpers remain generic across all child types.

// Lists all records in a child collection matching the caller's OData params.
// Typically called with $filter: "ParentObjectID eq 'XYZ'" to scope to one parent.
async function listChildren(c4cCollection, odataParams = {}) {
  const client = await _client();
  const r = await client.get(`${BASE_SVC}/${c4cCollection}`, {
    params: { $format: 'json', ...odataParams }
  });
  // Normalise v2 (d.results) and v4 (value) response shapes
  return r.data?.d?.results ?? r.data?.value ?? [];
}

// Reads a single child record by its ObjectID key.
async function getChild(c4cCollection, objectID) {
  const client = await _client();
  const r = await client.get(
    `${BASE_SVC}/${c4cCollection}('${encodeURIComponent(objectID)}')`,
    { params: { $format: 'json' } }
  );
  return r.data?.d ?? r.data;
}

// Creates a new child record inside a collection (e.g., adds a line item to an RFQ).
async function createChild(c4cCollection, payload) {
  const { token, cookies } = await _csrf_token();
  const client = await _client();
  const r = await client.post(`${BASE_SVC}/${c4cCollection}`, payload, {
    headers: { 'Content-Type': 'application/json', 'x-csrf-token': token, Cookie: cookies }
  });
  return r.data?.d ?? r.data;
}

// Updates an existing child record by ObjectID using PATCH (partial update).
async function updateChild(c4cCollection, objectID, payload) {
  const { token, cookies } = await _csrf_token();
  const client = await _client();
  await client.patch(
    `${BASE_SVC}/${c4cCollection}('${encodeURIComponent(objectID)}')`,
    payload,
    { headers: { 'Content-Type': 'application/json', 'x-csrf-token': token, Cookie: cookies } }
  );
}

// Deletes a child record permanently from C4C by ObjectID.
async function deleteChild(c4cCollection, objectID) {
  const { token, cookies } = await _csrf_token();
  const client = await _client();
  await client.delete(
    `${BASE_SVC}/${c4cCollection}('${encodeURIComponent(objectID)}')`,
    { headers: { 'x-csrf-token': token, Cookie: cookies } }
  );
}

// ── Public API ────────────────────────────────────────────────────────────────
// Export only the functions that service.js needs; internal helpers (_client,
// _csrf_token) stay private to this module.
module.exports = {
  listRFQs, listRFQsFirstPage,
  getRFQ, createRFQ, updateRFQ, deleteRFQ,
  listChildren, getChild, createChild, updateChild, deleteChild
};
