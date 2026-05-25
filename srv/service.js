'use strict';

const cds = require('@sap/cds');
const c4c = require('./lib/c4c-client');
const mock = require('./lib/mock-data');

// Mock mode: active when C4C_BASE_URL is not set and VCAP_SERVICES is absent
const IS_MOCK = !process.env.VCAP_SERVICES && !process.env.C4C_BASE_URL;
if (IS_MOCK) {
  console.warn('[RFQService] ⚠  No C4C_BASE_URL found – running with local mock data.');
}

// ── Root entity: CAP field → C4C OData V2 property name ────────────────────────────────────

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
  supplier                  : 'SupplierID',
  supplierName              : 'SupplierName',
  owner                     : 'Owner',
  ownerName                 : 'OwnerName',
  requestor                 : 'Requestor',
  requestorName             : 'RequestorName',
  categoryPurchaser         : 'CategoryPurchaserID',
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
  r.criticality = r.rfqOverDue === true ? 1 : 0;
  // Ensure every mapped CAP field is present even when C4C omits it.
  // Absent fields default to null so FE shows them empty rather than
  // throwing an OData v4 "invalid segment" drill-down error.
  for (const capKey of Object.values(FROM_C4C)) {
    if (!(capKey in r)) r[capKey] = null;
  }
  return r;
}
