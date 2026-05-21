'use strict';

const cds = require('@sap/cds');
const c4c = require('./lib/c4c-client');

// ── Field mapping: CAP field → C4C OData V2 element name (from SDK bo def) ───
const TO_C4C = {
  ObjectID                  : 'ObjectID',
  rfqID                     : 'ID',
  name                      : 'Name',
  rfqType                   : 'RFQType',
  rfqStatus                 : 'RFQStatus',
  rfqStatusDesc             : 'RFQStatus_Desc',
  externalStatus            : 'ExternalUserStatusCode',
  systemStatus              : 'SystemStatus',
  account                   : 'Account',
  accountName               : 'AccountName',
  supplier                  : 'Supplier',
  supplierName              : 'SupplierName',
  owner                     : 'Owner',
  ownerName                 : 'OwnerName',
  requestor                 : 'Requestor',
  requestorName             : 'RequestorName',
  categoryPurchaser         : 'CategoryPurchaser',
  categoryPurchaserName     : 'CategoryPurchaserName',
  categoryPurchaserEmail    : 'CategoryPurchaserEmail',
  rfqDueDate                : 'RFQDueDate',
  rfqInquiryDate            : 'RFQInquiryDate',
  customerInquiryDate       : 'CustomerInquiryDate',
  sop                       : 'SOP',
  closedDate                : 'RFQConfirmedOn_ClosedDate',
  rfqRemindedDate           : 'RFQReminded_Date',
  createdOnDate             : 'CreatedOn_date',
  changedOnDate             : 'ChangedOn_date',
  estimatedTurnover         : 'EstimatedPeakTurnOver',
  estimatedTurnoverCurrency : 'EstimatedPeakTurnOverCurrencyCode',
  supplierLeadTime          : 'SupplierLeadTime',
  busSeg                    : 'BusSeg',
  marketSeg                 : 'MarketSeg',
  appCode                   : 'AppCode',
  platform                  : 'Platform',
  itemCategory              : 'ItemCategory',
  evaluation                : 'Evaluation',
  orgName                   : 'OrgName',
  orgID                     : 'OrgID',
  terrName                  : 'TerrName',
  terrID                    : 'TerrID',
  rfqOverDue                : 'RfQOverDue',
  rfqRemainingDays          : 'RfQRemainingDueDays',
  confidential              : 'Confidential',
  gmpIndicator              : 'GMPIndicator',
  npdrfq                    : 'NPDRFQ',
  rdcIndicator              : 'RDC_Indicator',
  isIndicator               : 'IS_Indicator',
  frsFlag                   : 'FRSFlag',
  industrialRouting         : 'IndustrialRouting',
  rfqReopened               : 'RFQReopened',
  fromOpportunity           : 'FromOpportunity',
  fromQuote                 : 'FromQuote',
  noOfProducts              : 'NoOfProducts',
  noOfEquote                : 'NoOfEqote',
  noOfAttachments           : 'NoOfAttachments',
  rfqReminded               : 'RFQReminded',
  parentOpportunityID       : 'ParentOpportunityID',
  earID                     : 'EARID',
  createdByName             : 'CreatedBy',
  lastChangedByName         : 'LastChangedByName'
};

const FROM_C4C = Object.fromEntries(Object.entries(TO_C4C).map(([k, v]) => [v, k]));

function toCAP(raw) {
  const r = {};
  for (const [c4cKey, capKey] of Object.entries(FROM_C4C)) {
    if (raw[c4cKey] !== undefined) r[capKey] = raw[c4cKey];
  }
  // Criticality: red when overdue, neutral otherwise.
  // Extend STATUS_CRITICALITY below once you know your ExternalUserStatusCode values.
  r.criticality = r.rfqOverDue === true ? 1 : 0;
  return r;
}

function toC4C(capObj) {
  const r = {};
  for (const [capKey, c4cKey] of Object.entries(TO_C4C)) {
    if (capObj[capKey] !== undefined) r[c4cKey] = capObj[capKey];
  }
  return r;
}

// Extracts ObjectID from a CAP WHERE clause [{ref:['ObjectID']},'=',{val:'...'}]
function extractId(where = []) {
  for (let i = 0; i < where.length - 2; i++) {
    const ref = where[i]?.ref?.[0];
    if ((ref === 'ObjectID' || ref === 'ID') && where[i + 1] === '=' && where[i + 2]?.val !== undefined) {
      return String(where[i + 2].val);
    }
  }
  return null;
}

function buildOrderBy(orderBy = []) {
  return orderBy
    .map(o => `${TO_C4C[o.ref?.[0]] ?? o.ref?.[0]} ${o.sort ?? 'asc'}`)
    .join(',');
}

// ── Service ───────────────────────────────────────────────────────────────────

module.exports = class RFQService extends cds.ApplicationService {

  async init() {
    const { RFQs, RFQStatusSummary } = this.entities;

    // READ ────────────────────────────────────────────────────────────────────
    this.on('READ', RFQs, async (req) => {
      try {
        const { SELECT } = req.query;
        const id = SELECT?.where ? extractId(SELECT.where) : null;

        if (id) {
          const obj = await c4c.getRFQ(id);
          return [toCAP(obj)];
        }

        const params = {};
        if (SELECT?.limit?.rows?.val   != null) params.$top     = SELECT.limit.rows.val;
        if (SELECT?.limit?.offset?.val != null) params.$skip    = SELECT.limit.offset.val;
        if (SELECT?.orderBy?.length)            params.$orderby = buildOrderBy(SELECT.orderBy);

        const results = await c4c.listRFQs(params);
        return results.map(toCAP);

      } catch (e) {
        req.error(e.response?.status ?? 500, e.response?.data?.error?.message?.value ?? e.message);
      }
    });

    // CREATE ──────────────────────────────────────────────────────────────────
    this.on('CREATE', RFQs, async (req) => {
      try {
        const payload = toC4C(req.data);
        delete payload.ObjectID;
        const created = await c4c.createRFQ(payload);
        return toCAP(created);
      } catch (e) {
        req.error(e.response?.status ?? 500, e.response?.data?.error?.message?.value ?? e.message);
      }
    });

    // UPDATE ──────────────────────────────────────────────────────────────────
    this.on('UPDATE', RFQs, async (req) => {
      try {
        const id = req.params?.[0]?.ObjectID;
        const payload = toC4C(req.data);
        delete payload.ObjectID;
        await c4c.updateRFQ(id, payload);
        return { ...req.data };
      } catch (e) {
        req.error(e.response?.status ?? 500, e.response?.data?.error?.message?.value ?? e.message);
      }
    });

    // DELETE ──────────────────────────────────────────────────────────────────
    this.on('DELETE', RFQs, async (req) => {
      try {
        const id = req.params?.[0]?.ObjectID;
        await c4c.deleteRFQ(id);
      } catch (e) {
        req.error(e.response?.status ?? 500, e.response?.data?.error?.message?.value ?? e.message);
      }
    });

    // READ – Status pipeline summary ──────────────────────────────────────────
    this.on('READ', RFQStatusSummary, async (req) => {
      try {
        const all = await c4c.listRFQs({});

        const groups = {};
        for (const raw of all) {
          const item = toCAP(raw);
          const key = item.externalStatus ?? 'UNKNOWN';
          if (!groups[key]) {
            groups[key] = {
              externalStatus : item.externalStatus ?? '',
              statusDesc     : item.rfqStatusDesc  ?? item.externalStatus ?? '',
              count          : 0,
              totalTurnover  : 0,
              currency       : item.estimatedTurnoverCurrency ?? ''
            };
          }
          groups[key].count++;
          groups[key].totalTurnover += parseFloat(item.estimatedTurnover ?? 0);
        }

        return Object.values(groups);

      } catch (e) {
        req.error(e.response?.status ?? 500, e.response?.data?.error?.message?.value ?? e.message);
      }
    });

    await super.init();
  }
};
