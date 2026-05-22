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

const axios = require('axios');
const { resolveDestination } = require('./destination');

const DEST_NAME  = 'C4C_QUA_HARDCODED';
const BASE_SVC   = '/sap/c4c/odata/cust/v1/zrfq';
const ROOT_COLL  = `${BASE_SVC}/RFQRootCollection`;
const CSRF_TTL   = 9 * 60 * 1000; // 9 minutes

let _csrf = { token: null, cookies: '', fetchedAt: 0 };

// ── Axios instance factory ────────────────────────────────────────────────────

async function _client() {
  const { baseURL, auth } = await resolveDestination(DEST_NAME);
  return axios.create({
    baseURL,
    auth,
    headers: { Accept: 'application/json' },
    timeout: 30_000
  });
}

// ── CSRF token (fetched via GET, not HEAD – C4C returns 500 on HEAD) ─────────

async function _csrf_token() {
  if (_csrf.token && Date.now() - _csrf.fetchedAt < CSRF_TTL) return _csrf;

  const client = await _client();
  const r = await client.get(ROOT_COLL, {
    params: { $top: '1', $format: 'json' },
    headers: { 'x-csrf-token': 'Fetch', 'x-requested-with': 'XMLHttpRequest' }
  });

  _csrf = {
    token     : r.headers['x-csrf-token'] || '',
    cookies   : [].concat(r.headers['set-cookie'] || []).join('; '),
    fetchedAt : Date.now()
  };
  return _csrf;
}

// ── Root entity CRUD ──────────────────────────────────────────────────────────

async function listRFQs(odataParams = {}) {
  const client = await _client();
  const r = await client.get(ROOT_COLL, {
    params: { $format: 'json', $inlinecount: 'allpages', ...odataParams }
  });
  const d = r.data?.d;
  const results = d?.results ?? r.data?.value ?? [];
  // $inlinecount=allpages returns total count in d.__count (OData V2 string)
  const count = d?.__count != null ? parseInt(d.__count, 10) : undefined;
  return { results, count };
}

async function getRFQ(id) {
  const client = await _client();
  const r = await client.get(`${ROOT_COLL}('${encodeURIComponent(id)}')`, {
    params: { $format: 'json' }
  });
  return r.data?.d ?? r.data;
  // No filter fallback — C4C can return 500 on key reads; service.js handles it.
}

async function createRFQ(payload) {
  const { token, cookies } = await _csrf_token();
  const client = await _client();
  const r = await client.post(ROOT_COLL, payload, {
    headers: { 'Content-Type': 'application/json', 'x-csrf-token': token, Cookie: cookies }
  });
  return r.data?.d ?? r.data;
}

async function updateRFQ(id, payload) {
  const { token, cookies } = await _csrf_token();
  const client = await _client();
  await client.patch(`${ROOT_COLL}('${encodeURIComponent(id)}')`, payload, {
    headers: { 'Content-Type': 'application/json', 'x-csrf-token': token, Cookie: cookies }
  });
}

async function deleteRFQ(id) {
  const { token, cookies } = await _csrf_token();
  const client = await _client();
  await client.delete(`${ROOT_COLL}('${encodeURIComponent(id)}')`, {
    headers: { 'x-csrf-token': token, Cookie: cookies }
  });
}

// ── Generic child-entity CRUD ─────────────────────────────────────────────────
// Child entities are addressed via their flat collection URL.
// ParentObjectID filtering is applied by the caller via odataParams.$filter.

async function listChildren(c4cCollection, odataParams = {}) {
  const client = await _client();
  const r = await client.get(`${BASE_SVC}/${c4cCollection}`, {
    params: { $format: 'json', ...odataParams }
  });
  return r.data?.d?.results ?? r.data?.value ?? [];
}

async function getChild(c4cCollection, objectID) {
  const client = await _client();
  const r = await client.get(
    `${BASE_SVC}/${c4cCollection}('${encodeURIComponent(objectID)}')`,
    { params: { $format: 'json' } }
  );
  return r.data?.d ?? r.data;
}

async function createChild(c4cCollection, payload) {
  const { token, cookies } = await _csrf_token();
  const client = await _client();
  const r = await client.post(`${BASE_SVC}/${c4cCollection}`, payload, {
    headers: { 'Content-Type': 'application/json', 'x-csrf-token': token, Cookie: cookies }
  });
  return r.data?.d ?? r.data;
}

async function updateChild(c4cCollection, objectID, payload) {
  const { token, cookies } = await _csrf_token();
  const client = await _client();
  await client.patch(
    `${BASE_SVC}/${c4cCollection}('${encodeURIComponent(objectID)}')`,
    payload,
    { headers: { 'Content-Type': 'application/json', 'x-csrf-token': token, Cookie: cookies } }
  );
}

async function deleteChild(c4cCollection, objectID) {
  const { token, cookies } = await _csrf_token();
  const client = await _client();
  await client.delete(
    `${BASE_SVC}/${c4cCollection}('${encodeURIComponent(objectID)}')`,
    { headers: { 'x-csrf-token': token, Cookie: cookies } }
  );
}

module.exports = {
  listRFQs, getRFQ, createRFQ, updateRFQ, deleteRFQ,
  listChildren, getChild, createChild, updateChild, deleteChild
};
