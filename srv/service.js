'use strict';

const cds = require('@sap/cds');
const c4c = require('./lib/c4c-client');

// ── Field mapping: CAP service field → C4C OData V2 field ────────────────────
const TO_C4C = {
  ID          : 'ObjectID',
  rfqNumber   : 'ExternalID',
  title       : 'Subject',
  description : 'Note',
  buyerID     : 'BuyerPartyID',
  supplierID  : 'SupplierPartyID',
  statusCode  : 'LifeCycleStatusCode',
  status      : 'LifeCycleStatusCodeText',
  deliveryDate: 'RequestedDeliveryDate',
  amount      : 'TotalAmount',
  currency    : 'CurrencyCode',
  createdAt   : 'CreatedOn',
  modifiedAt  : 'LastUpdatedOn'
};

const FROM_C4C = Object.fromEntries(Object.entries(TO_C4C).map(([k, v]) => [v, k]));

// Criticality map for Fiori Elements colour coding (statusCode → UI enum)
// 3 = Positive (green), 2 = Critical (orange), 1 = Negative (red), 0 = Neutral
const STATUS_CRITICALITY = {
  '1': 3, // Open / Active
  '2': 1, // Cancelled
  '3': 2, // In Progress
  '4': 3, // Awarded
  '5': 1  // Rejected
};

function toCAP(c4cObj) {
  const r = {};
  for (const [c4cKey, capKey] of Object.entries(FROM_C4C)) {
    if (c4cObj[c4cKey] !== undefined) r[capKey] = c4cObj[c4cKey];
  }
  r.criticality = STATUS_CRITICALITY[r.statusCode] ?? 0;
  return r;
}

function toC4C(capObj) {
  const r = {};
  for (const [capKey, c4cKey] of Object.entries(TO_C4C)) {
    if (capObj[capKey] !== undefined) r[c4cKey] = capObj[capKey];
  }
  return r;
}

// Extract the key value from a CAP WHERE clause array  e.g. [{ref:['ID']},'=',{val:'abc'}]
function extractId(where = []) {
  for (let i = 0; i < where.length - 2; i++) {
    if (where[i]?.ref?.[0] === 'ID' && where[i + 1] === '=' && where[i + 2]?.val !== undefined) {
      return String(where[i + 2].val);
    }
  }
  return null;
}

// Translate a CAP SELECT orderBy clause into a C4C $orderby string
function buildOrderBy(orderBy = []) {
  return orderBy
    .map(o => `${TO_C4C[o.ref?.[0]] ?? o.ref?.[0]} ${o.sort ?? 'asc'}`)
    .join(',');
}

// ── Service implementation ────────────────────────────────────────────────────

module.exports = class RFQService extends cds.ApplicationService {

  async init() {
    const { RFQs, RFQStatusSummary } = this.entities;

    // READ ─────────────────────────────────────────────────────────────────────
    this.on('READ', RFQs, async (req) => {
      try {
        const { SELECT } = req.query;
        const id = SELECT?.where ? extractId(SELECT.where) : null;

        if (id) {
          const obj = await c4c.getRFQ(id);
          return [toCAP(obj)];
        }

        const params = {};
        if (SELECT?.limit?.rows?.val   != null) params.$top  = SELECT.limit.rows.val;
        if (SELECT?.limit?.offset?.val != null) params.$skip = SELECT.limit.offset.val;
        if (SELECT?.orderBy?.length)            params.$orderby = buildOrderBy(SELECT.orderBy);

        const results = await c4c.listRFQs(params);
        return results.map(toCAP);

      } catch (e) {
        req.error(e.response?.status ?? 500, e.response?.data?.error?.message?.value ?? e.message);
      }
    });

    // CREATE ───────────────────────────────────────────────────────────────────
    this.on('CREATE', RFQs, async (req) => {
      try {
        const payload = toC4C(req.data);
        delete payload.ObjectID; // let C4C generate the key
        const created = await c4c.createRFQ(payload);
        return toCAP(created);
      } catch (e) {
        req.error(e.response?.status ?? 500, e.response?.data?.error?.message?.value ?? e.message);
      }
    });

    // UPDATE ───────────────────────────────────────────────────────────────────
    this.on('UPDATE', RFQs, async (req) => {
      try {
        const id = req.params?.[0]?.ID;
        const payload = toC4C(req.data);
        delete payload.ObjectID; // immutable key – must not be sent in PATCH body
        await c4c.updateRFQ(id, payload);
        return { ...req.data };
      } catch (e) {
        req.error(e.response?.status ?? 500, e.response?.data?.error?.message?.value ?? e.message);
      }
    });

    // DELETE ───────────────────────────────────────────────────────────────────
    this.on('DELETE', RFQs, async (req) => {
      try {
        const id = req.params?.[0]?.ID;
        await c4c.deleteRFQ(id);
      } catch (e) {
        req.error(e.response?.status ?? 500, e.response?.data?.error?.message?.value ?? e.message);
      }
    });

    // READ – Reporting / pipeline summary ──────────────────────────────────────
    this.on('READ', RFQStatusSummary, async (req) => {
      try {
        const all = await c4c.listRFQs({
          $select: 'LifeCycleStatusCode,LifeCycleStatusCodeText,TotalAmount,CurrencyCode'
        });

        const groups = {};
        for (const item of all) {
          const key = item.LifeCycleStatusCode ?? '';
          if (!groups[key]) {
            groups[key] = {
              statusCode  : item.LifeCycleStatusCode ?? '',
              status      : item.LifeCycleStatusCodeText ?? item.LifeCycleStatusCode ?? '',
              count       : 0,
              totalAmount : 0,
              currency    : item.CurrencyCode ?? ''
            };
          }
          groups[key].count++;
          groups[key].totalAmount += parseFloat(item.TotalAmount ?? 0);
        }

        return Object.values(groups);

      } catch (e) {
        req.error(e.response?.status ?? 500, e.response?.data?.error?.message?.value ?? e.message);
      }
    });

    await super.init();
  }
};
