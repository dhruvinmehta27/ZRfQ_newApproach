'use strict';

/**
 * HTTP client for SAP C4C custom RFQ collection.
 *
 * Destination : C4C_QUA_HARDCODED  (BasicAuthentication)
 * Base path   : /cust/v1/zrfq
 * Collection  : RFQRootCollection
 *
 * CSRF note: C4C returns HTTP 500 on HEAD requests, so we fetch the CSRF
 * token with a GET request (top=1) before every write operation.
 * Tokens are cached for CSRF_TTL_MS to limit round-trips.
 */

const axios = require('axios');
const { resolveDestination } = require('./destination');

const DEST_NAME  = 'C4C_QUA_HARDCODED';
const COLL_PATH  = '/cust/v1/zrfq/RFQRootCollection';
const CSRF_TTL   = 9 * 60 * 1000; // 9 minutes

let _csrf = { token: null, cookies: '', fetchedAt: 0 };

// ── Axios instance factory ────────────────────────────────────────────────────

async function _client() {
  const { baseURL, auth } = await resolveDestination(DEST_NAME);
  return axios.create({
    baseURL,
    auth,
    headers: { Accept: 'application/json' },
    // C4C can be slow; allow 30 s before timing out
    timeout: 30_000
  });
}

// ── CSRF token (fetched via GET, not HEAD) ────────────────────────────────────

async function _csrf_token() {
  if (_csrf.token && Date.now() - _csrf.fetchedAt < CSRF_TTL) return _csrf;

  const client = await _client();
  const r = await client.get(COLL_PATH, {
    params: { $top: '1', $format: 'json' },
    headers: { 'x-csrf-token': 'Fetch', 'x-requested-with': 'XMLHttpRequest' }
  });

  _csrf = {
    token: r.headers['x-csrf-token'] || '',
    cookies: [].concat(r.headers['set-cookie'] || []).join('; '),
    fetchedAt: Date.now()
  };
  return _csrf;
}

// ── Public API ────────────────────────────────────────────────────────────────

async function listRFQs(odataParams = {}) {
  const client = await _client();
  const r = await client.get(COLL_PATH, {
    params: { $format: 'json', ...odataParams }
  });
  // C4C OData V2 wraps results in d.results; fall back to value for V4-style
  return r.data?.d?.results ?? r.data?.value ?? [];
}

async function getRFQ(id) {
  const client = await _client();
  const r = await client.get(`${COLL_PATH}('${encodeURIComponent(id)}')`, {
    params: { $format: 'json' }
  });
  return r.data?.d ?? r.data;
}

async function createRFQ(payload) {
  const { token, cookies } = await _csrf_token();
  const client = await _client();
  const r = await client.post(COLL_PATH, payload, {
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': token,
      Cookie: cookies
    }
  });
  return r.data?.d ?? r.data;
}

async function updateRFQ(id, payload) {
  const { token, cookies } = await _csrf_token();
  const client = await _client();
  await client.patch(`${COLL_PATH}('${encodeURIComponent(id)}')`, payload, {
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': token,
      Cookie: cookies
    }
  });
}

async function deleteRFQ(id) {
  const { token, cookies } = await _csrf_token();
  const client = await _client();
  await client.delete(`${COLL_PATH}('${encodeURIComponent(id)}')`, {
    headers: { 'x-csrf-token': token, Cookie: cookies }
  });
}

module.exports = { listRFQs, getRFQ, createRFQ, updateRFQ, deleteRFQ };
