'use strict';

/**
 * Resolves a BTP Destination Service destination to { baseURL, auth }.
 *
 * In production (CF): reads VCAP_SERVICES, fetches an OAuth token for the
 * Destination Service, then calls its REST API.
 *
 * In local dev: falls back to environment variables:
 *   C4C_BASE_URL   – full base URL of the C4C tenant
 *   C4C_USER       – BasicAuthentication user
 *   C4C_PASSWORD   – BasicAuthentication password
 */

const axios = require('axios');

// In-process caches to avoid redundant token / destination fetches
const _tokenCache = { value: null, expiresAt: 0 };
const _destCache = {};

async function _getServiceToken(tokenUrl, clientId, clientSecret) {
  if (_tokenCache.value && Date.now() < _tokenCache.expiresAt) {
    return _tokenCache.value;
  }
  const resp = await axios.post(
    `${tokenUrl}/oauth/token`,
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  _tokenCache.value = resp.data.access_token;
  // Subtract 60 s buffer so we refresh before actual expiry
  _tokenCache.expiresAt = Date.now() + (resp.data.expires_in - 60) * 1000;
  return _tokenCache.value;
}

async function resolveDestination(name) {
  if (_destCache[name]) return _destCache[name];

  const vcapRaw = process.env.VCAP_SERVICES;
  if (!vcapRaw) {
    // Local development fallback
    const config = {
      baseURL: process.env.C4C_BASE_URL,
      auth: {
        username: process.env.C4C_USER || '',
        password: process.env.C4C_PASSWORD || ''
      }
    };
    if (!config.baseURL) {
      throw new Error(
        'Local dev: set C4C_BASE_URL (and optionally C4C_USER / C4C_PASSWORD) in your environment.'
      );
    }
    return config;
  }

  const vcap = JSON.parse(vcapRaw);
  const destBinding = (vcap['destination'] || [])[0];
  if (!destBinding) throw new Error('Destination service (cx-destination) is not bound.');

  const creds = destBinding.credentials;
  const token = await _getServiceToken(creds.url, creds.clientid, creds.clientsecret);

  const resp = await axios.get(
    `${creds.uri}/destination-configuration/v1/destinations/${encodeURIComponent(name)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const d = resp.data.destinationConfiguration;
  const config = {
    baseURL: d.URL,
    auth: d.Authentication === 'BasicAuthentication'
      ? { username: d.User, password: d.Password }
      : undefined
  };

  // Cache for the lifetime of this process instance
  _destCache[name] = config;
  return config;
}

module.exports = { resolveDestination };
