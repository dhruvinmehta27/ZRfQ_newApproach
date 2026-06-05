'use strict';

// ── Dependencies ──────────────────────────────────────────────────────────────
// cds   : SAP CAP framework – ApplicationService base class and query helpers
// c4c   : our HTTP client that talks to SAP C4C OData v2 (see lib/c4c-client.js)
// mock  : in-memory test data used when no real C4C connection is available
const cds  = require('@sap/cds');
const c4c  = require('./lib/c4c-client');
const mock = require('./lib/mock-data');

// ── Mock mode detection ───────────────────────────────────────────────────────
// When neither VCAP_SERVICES (BTP cloud) nor C4C_BASE_URL (local override) is
// set, we fall back to static mock data so the app can run without a C4C tenant.
const IS_MOCK = !process.env.VCAP_SERVICES && !process.env.C4C_BASE_URL;
if (IS_MOCK) {
  console.warn('[RFQService] ⚠  No C4C_BASE_URL found – running with local mock data.');
}

// ── Root-entity field map: CAP property name → C4C OData v2 property name ────
// Used to translate between the CAP model (camelCase) and the C4C API (PascalCase).
// TO_C4C  : CAP → C4C  (used when writing data TO C4C, e.g. create/update)
// FROM_C4C: C4C → CAP  (derived automatically below; used when reading FROM C4C)
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

// Reverse lookup automatically derived from TO_C4C (C4C key → CAP key)
const FROM_C4C = Object.fromEntries(Object.entries(TO_C4C).map(([k, v]) => [v, k]));

// ── toCAP(raw) ────────────────────────────────────────────────────────────────
// Converts a raw C4C OData v2 record into a CAP-shaped object.
// Also:
//   • Sets criticality = 1 (warning colour) when rfqOverDue is true, else 0.
//   • Defaults every mapped CAP field to null when C4C omits it, preventing
//     FE v4 from throwing an "invalid segment" drill-down error on $select fields
//     that are absent from the response body.
function toCAP(raw) {
  const r = {};
  for (const [c4cKey, capKey] of Object.entries(FROM_C4C)) {
    if (raw[c4cKey] !== undefined) r[capKey] = raw[c4cKey];
  }
  r.criticality = r.rfqOverDue === true ? 1 : 0;
  for (const capKey of Object.values(FROM_C4C)) {
    if (!(capKey in r)) r[capKey] = null;
  }
  return r;
}

// ── toC4C(capObj) ─────────────────────────────────────────────────────────────
// Converts a CAP-shaped object back to C4C property names for write operations
// (create / update). Only fields present on capObj are included.
function toC4C(capObj) {
  const r = {};
  for (const [capKey, c4cKey] of Object.entries(TO_C4C)) {
    if (capObj[capKey] !== undefined) r[c4cKey] = capObj[capKey];
  }
  return r;
}

// ── mapFields(capToC4C) ───────────────────────────────────────────────────────
// Generic field-map builder used by every child entity (items, notes, parties…).
// Given a CAP→C4C property map it returns { to(capObj), from(raw) } converter
// functions so each child entity gets its own strongly-typed translator pair.
function mapFields(capToC4C) {
  const c4cToCap = Object.fromEntries(Object.entries(capToC4C).map(([k, v]) => [v, k]));
  return {
    // to : translate a CAP object → C4C body (used in create/update requests)
    to(capObj) {
      const r = {};
      for (const [capKey, c4cKey] of Object.entries(capToC4C)) {
        if (capObj[capKey] !== undefined) r[c4cKey] = capObj[capKey];
      }
      return r;
    },
    // from : translate a raw C4C record → CAP object (used after fetching)
    from(raw) {
      const r = {};
      for (const [c4cKey, capKey] of Object.entries(c4cToCap)) {
        if (raw[c4cKey] !== undefined) r[capKey] = raw[c4cKey];
      }
      return r;
    }
  };
}

// ── Child-entity field maps ───────────────────────────────────────────────────
// Each constant defines the CAP→C4C property mapping for one child collection.
// C4C collection names (used in the URL) are passed separately to mkChildHandlers.

// RFQ line items – product/part details per RFQ
const ITEMS = mapFields({
  ObjectID                : 'ObjectID',
  parentObjectID          : 'ParentObjectID',
  itemID                  : 'ItemID',
  mainItemRouting         : 'MainItemRouting',
  parentOpportunityItemID : 'ParentOpportunityItemID',
  military                : 'Military',
  nato                    : 'NATO',
  productID               : 'ProductID',
  itemIDCustom            : 'ItemIDCustom',
  productDescription      : 'ProductDescription',
  productCategoryDesc     : 'ProductCategoryDescription',
  productCategoryID       : 'ProductCategoryInternalID',
  productSubCatDesc       : 'ProductSubCategoryDescription',
  productSubCatID         : 'ProductSubCategoryInternalID',
  productExternalID       : 'ProductExternalID',
  productHM               : 'ProductHM',
  productMarking          : 'ProductMarking',
  materialHM              : 'MaterialHM',
  materialType            : 'MaterialType',
  materialTypeDesc        : 'MaterialTypeDesc',
  matCode                 : 'Mat_Code',
  processHM               : 'ProcessHM',
  applicationHM           : 'ApplicationHM',
  capabilitiesHM          : 'CapabilitiesHM',
  descHM                  : 'DescHM',
  quantity                : 'Quantity',
  quantityUnit            : 'unitCode2',
  expectedAnnualQty       : 'ExpectedAnnualQuantity',
  expectedAnnualUnit      : 'unitCode3',
  sampleQty               : 'SampleQuantity',
  sampleUnit              : 'unitCode4',
  prototypeQty            : 'PrototypeQuantity',
  prototypeUnit           : 'unitCode',
  prototypeDate           : 'PrototypeDate',
  productionStartDate     : 'ProductionStartDate',
  inDiam                  : 'In_Diam',
  outDiam                 : 'Out_Diam',
  length                  : 'Length',
  width                   : 'Width',
  thickness               : 'Thickness',
  itemDimensionUnit       : 'ItemDimensionUnit',
  shore                   : 'Shore',
  productLifetime         : 'ProductLifetime_',
  productLifetimeCode     : 'ProductLifetimeCode',
  prodLifeCycle           : 'ProdLifeCycle',
  prodLifeCycleAddDesc    : 'ProdLifeCycleAdddesc',
  qualCh                  : 'QualCh',
  quoteTypeHM             : 'QuoteTypeHM',
  rdcQ                    : 'RDCQ',
  reqSupplierLevel        : 'RequestedSupplierLevel',
  toolingRequired         : 'ToolingRequired',
  toolingDesc             : 'ToolingDesc',
  safetyRelevant          : 'SafetyRelevant',
  gmpIndicator            : 'GMPIndicator',
  customerApproval        : 'CustomerApproval',
  designLocked            : 'DesignLocked',
  institutionalApproval   : 'InstitutionalApproval',
  cleanroomNeeded         : 'CleanroomNeeded',
  cleanroomManufInd       : 'CleanroomManufacturingind',
  annualRequalification   : 'AnnualRequalification',
  finalSterilReq          : 'FinalSterilizationRequired',
  fdaDeviceClass          : 'FDADeviceClass',
  fdaClassification       : 'FDAClassification',
  finishedMedDevQ         : 'FinishedMedicalDeviceQ',
  implemantableDevice     : 'ImplemantableDevice',
  bioPQ                   : 'BioPQ',
  apiRelatedQ             : 'APIRelatedQ',
  annulaVolumHMQ          : 'AnnulaVolumHMQ',
  cleanliness             : 'Cleanliness',
  cleanlinessDesc         : 'CleanlinessDesc',
  cleanroomManuf          : 'CleanroomManufacturing',
  cleanroomClass          : 'CleanroomClassification',
  initialSampling         : 'InitialSampling',
  machineComponentsQ      : 'MachineComponentsQ',
  compliance              : 'Compliance',
  consultationRequired    : 'ConsultationRequired',
  flexcoatDerivate        : 'FlexcoatDerivate',
  positionForMarking      : 'PositionForMarking',
  contentForMarking       : 'ContentForMarking',
  colorForMarking         : 'ColorForMarking',
  packagingReqmt          : 'PackagingRequirment',
  additionalInfoPkgLbl    : 'AdditionalInfoPkgLbl',
  additionalInfoSP        : 'AdditionalInfoSP',
  additionalInfoSurface   : 'AdditionalInfoSurface',
  addInfoSurface          : 'AddInfoSurface',
  additinalInfoSampling   : 'AdditinalInfoSampling',
  additinalInfoSerialQty  : 'AdditinalInfoSerialQuantity',
  itemNote                : 'ItemNote',
  leadTime                : 'Lead_Time',
  coo                     : 'Coo',
  supplierERPID           : 'SupplierERPID',
  zProductBuyerID         : 'ZProductBuyerID'
});

// Annual volume forecasts attached to an RFQ line item
const FORECASTS = mapFields({
  ObjectID        : 'ObjectID',
  parentObjectID  : 'ParentObjectID',
  fcastDate       : 'Fcast_Date',
  fcastQuantity   : 'Fcast_Quantity',
  fcastUnit       : 'unitCode',
  fcastYear       : 'Fcast_Yeart',   // C4C typo preserved intentionally
  itemID          : 'ItemID'
});

// Internal notes / history entries on the RFQ
const NOTES = mapFields({
  ObjectID        : 'ObjectID',
  parentObjectID  : 'ParentObjectID',
  histryNote      : 'HistryNote',
  noteID          : 'Noteid',
  changedByName   : 'ChangedByName',
  changedOn       : 'ChangedOn2_real',
  createdAt       : 'CreationDateTime',
  lastChangedAt   : 'LastChangeDateTime'
});

// Sales team members assigned to the RFQ
const SALES_TEAM = mapFields({
  ObjectID        : 'ObjectID',
  parentObjectID  : 'ParentObjectID',
  roleCode        : 'RoleCode',
  roleCodeText    : 'RoleCodeText',
  partyID         : 'PartyID',
  formattedName   : 'FormattedName',
  mainIndicator   : 'MainIndicator',
  createdOnDate   : 'CreatedOn_date'
});

// Party roles on the RFQ (buyer, seller, requestor, etc.)
const PARTIES = mapFields({
  ObjectID          : 'ObjectID',
  parentObjectID    : 'ParentObjectID',
  partyTypeCode     : 'PartyTypeCode',
  partyTypeCodeText : 'PartyTypeCodeText',
  partyID           : 'PartyID',
  roleCategoryCode  : 'RoleCategoryCode',
  roleCategoryText  : 'RoleCategoryCodeText',
  roleCode          : 'RoleCode',
  roleCodeText      : 'RoleCodeText',
  mainIndicator     : 'MainIndicator',
  deleteAllowed     : 'DeleteAllowed',
  accountName       : 'AccountName',
  supplierName      : 'SupplierName'
});

// eQuote pricing records per line item
const EQUOTE = mapFields({
  ObjectID        : 'ObjectID',
  parentObjectID  : 'ParentObjectID',
  itemID          : 'ItemID',
  product         : 'Product',
  supplierName    : 'SupplierName',
  baseQuantity    : 'BaseQuantity',
  baseUnit        : 'unitCode',
  priceUnit       : 'PriceUnit',
  priceUnitCode   : 'unitCode1',
  cost            : 'Cost',
  currencyCode    : 'currencyCode',
  catalogue       : 'Catalogue',
  supplierLeadTime: 'SupplierLeadTime',
  validFromDate   : 'ValidFromDate',
  validToDate     : 'ValidToDate',
  lastChangedAt   : 'LastChangedonDateTime'
});

// Global / summary eQuote data across all suppliers
// Note: C4C entity name has a typo ("Gloabal") – preserved to match $metadata
const GLOBAL_EQUOTE = mapFields({
  ObjectID        : 'ObjectID',
  parentObjectID  : 'ParentObjectID',
  itemID          : 'ItemID',
  productID       : 'ProductID',
  supplierERPID   : 'SupplierERPID',
  supplierQuoteRef: 'SupplierQuoteRef',
  quantity        : 'Quantity',
  quantityUnit    : 'unitCode9',
  priceUnit       : 'PriceUnit',
  priceUnitCode   : 'unitCode',
  leadTimeDays    : 'LeadTimeDays',
  startDate       : 'StartDate',
  endDate         : 'EndDate',
  quoteDate       : 'QuoteDate',
  minTotVa        : 'MinTotVa',
  minCalVa        : 'MinCalVa',
  additionalNotes : 'AdditionalNotes',
  srID            : 'SrID',
  infoCategory    : 'InfoCategory'
});

// Linked opportunities and quotes from the CRM
const RELATED_TXNS = mapFields({
  ObjectID                : 'ObjectID',
  parentObjectID          : 'ParentObjectID',
  parentOpportunityID     : 'ParentOpportunityID',
  opportunityCreationDate : 'OpportunityCreationDate',
  parentOpptyInqDate      : 'ParentOpportunityInquiryDate',
  quoteID                 : 'QuoteID',
  quoteInquiryDate        : 'QuoteInquiryDate',
  quoteSentDate           : 'QuoteSentDate',
  rfqConfirmedDate        : 'RfQConfirmedDate',
  isMainRelatedOppty      : 'isMainRelatedOpportunity',
  isMainRelatedQuote      : 'isMainRelatedQuote'
});

// Attachment metadata list (file name, type, MIME) – read via RFQListofAttachmentsCollection
const ATT_LIST = mapFields({
  ObjectID        : 'ObjectID',
  parentObjectID  : 'ParentObjectID',
  fileName        : 'fileName',
  fileType        : 'fileType',
  mimeType        : 'mimeType'
});

// Binary attachment records – skeleton kept for future implementation.
// RFQAttachmentsCollection does not support GET with $filter so READ is a no-op.
const ATTACHMENTS = mapFields({
  ObjectID        : 'ObjectID',
  parentObjectID  : 'ParentObjectID',
  rfqRootID       : 'RFQRootID',
  name            : 'Name',
  mimeType        : 'MimeType',
  title           : 'Title',
  typeCode        : 'TypeCode',
  categoryCode    : 'CategoryCode',
  sizeInkB        : 'SizeInkB',
  documentLink    : 'DocumentLink',
  linkWebURI      : 'LinkWebURI',
  outputRelevance : 'OutputRelevanceIndicator',
  createdOn       : 'CreatedOn',
  createdBy       : 'CreatedBy',
  lastUpdatedOn   : 'LastUpdatedOn',
  lastUpdatedBy   : 'LastUpdatedBy'
});

// Status change audit trail for the RFQ lifecycle
const STATUS_HIST = mapFields({
  ObjectID            : 'ObjectID',
  parentObjectID      : 'ParentObjectID',
  newStatus           : 'newStatus',
  newStatusText       : 'newStatusText',
  newStatusDesc       : 'newStatusDesc',
  oldStatus           : 'oldStatus',
  oldStatusText       : 'oldStatusText',
  oldStatusDesc       : 'oldstatusDesc',
  changedByName       : 'ChangedByName',
  changedOn           : 'ChangedOn',
  changedOnUTC        : 'ChangedOnUTC',
  supplierAssignedOld : 'SupplierAssignedOLD',
  supplierAssignedNew : 'SupplierAssignedNEW',
  rfqReceivedManual   : 'RFQRecievedManual_UTC'
});

// ── WHERE-clause helpers ──────────────────────────────────────────────────────
// CAP represents query filters as a CQN (CDS Query Notation) array of tokens.
// These helpers extract values from that array without having to parse it manually.

// extractField : scans the CQN WHERE array for the pattern
//   { ref: [fieldName] } '=' { val: X }
// and returns the value X as a string, or null if not found.
function extractField(where = [], fieldName) {
  for (let i = 0; i < where.length - 2; i++) {
    if (
      where[i]?.ref?.[0] === fieldName &&
      where[i + 1] === '='             &&
      where[i + 2]?.val !== undefined
    ) {
      return String(where[i + 2].val);
    }
  }
  return null;
}

// lastOid : returns the ObjectID of the last key segment in req.params.
// Works for both direct reads (/Entity('OID')) and navigation reads
// (/Parent('POID')/children('OID')) – always picks the deepest key.
function lastOid(req) {
  return req.params?.[req.params.length - 1]?.ObjectID ?? null;
}

// buildOrderBy : converts CAP's orderBy array (from SELECT.orderBy) into
// a C4C OData v2 $orderby string, translating CAP field names to C4C names.
function buildOrderBy(orderBy = []) {
  return orderBy
    .map(o => `${TO_C4C[o.ref?.[0]] ?? o.ref?.[0]} ${o.sort ?? 'asc'}`)
    .join(',');
}

// ── mkChildHandlers ───────────────────────────────────────────────────────────
// Factory function that registers READ / CREATE / UPDATE / DELETE OData handlers
// for a child entity (e.g. RFQItems, RFQNotes, RFQParties).
//
// Parameters:
//   srv           – the CAP service instance
//   entityName    – CAP entity (e.g. this.entities.RFQItems)
//   c4cCollection – exact C4C collection name from $metadata (e.g. 'RFQItemCollection')
//   fieldMap      – { to, from } converter pair from mapFields()
//   opts.noUpdate – set true for collections that C4C does not support PATCH on
//
// Key design decisions:
//   • Parent key is read from WHERE or req.params[0] (CAP v9 puts navigation keys
//     in req.params, not in the WHERE clause).
//   • Never calls C4C without a $filter – some collections return 400 "not supported"
//     on unfiltered reads.
//   • $top/$skip are NOT forwarded to C4C; we paginate locally after fetching.
//   • On HTTP 400 from C4C: logs a warning and returns [] so the rest of the
//     Object Page still loads even if one tab's collection is unsupported.
function mkChildHandlers(srv, entityName, c4cCollection, fieldMap, opts = {}) {
  const { to, from } = fieldMap;

  // READ handler – handles both single-record and collection reads
  srv.on('READ', entityName, async (req) => {
    try {
      const { SELECT } = req.query;
      const where = SELECT?.where ?? [];

      // Case 1: single item requested by its own ObjectID (e.g. clicking a row
      // inside a sub-object page tab)
      const oid = extractField(where, 'ObjectID');
      if (oid) {
        const obj = await c4c.getChild(c4cCollection, oid);
        return [from(obj)];
      }

      // Case 2: collection read filtered by parent RFQ.
      // For /RFQs('OID')/items navigation, CAP v9 puts the parent key in
      // req.params[0].ObjectID instead of the WHERE clause.
      const parentOid = extractField(where, 'parentObjectID')
        || req.params?.[0]?.ObjectID;

      // Safety guard: never send an unfiltered request to C4C – certain collections
      // reject them with 400 "not supported by the processor".
      if (!parentOid) return [];

      // Fetch all children for this parent (no $top/$skip – local pagination below)
      const all = await c4c.listChildren(c4cCollection, {
        $filter: `ParentObjectID eq '${parentOid}'`
      });
      const mapped = all.map(from);

      // Apply FE's requested page window locally
      const skip = SELECT?.limit?.offset?.val != null ? Number(SELECT.limit.offset.val) : 0;
      const top  = SELECT?.limit?.rows?.val   != null ? Number(SELECT.limit.rows.val)   : mapped.length;
      const page = mapped.slice(skip, skip + top);
      page.$count = mapped.length;   // tells FE the total row count for pagination
      return page;
    } catch (e) {
      const status = e.response?.status ?? 500;
      const msg    = e.response?.data?.error?.message?.value ?? e.message;
      // Some C4C collections don't support $filter on ParentObjectID at all.
      // Return empty array so the Object Page continues to load; log for diagnosis.
      if (status === 400) {
        console.warn(`[${c4cCollection}] C4C 400 – returning empty: ${msg}`);
        return [];
      }
      req.error(status, msg);
    }
  });

  // CREATE handler – strips ObjectID (system-assigned by C4C) before posting
  srv.on('CREATE', entityName, async (req) => {
    try {
      const payload = to(req.data);
      delete payload.ObjectID;
      const created = await c4c.createChild(c4cCollection, payload);
      return from(created);
    } catch (e) {
      req.error(e.response?.status ?? 500, e.response?.data?.error?.message?.value ?? e.message);
    }
  });

  // UPDATE handler – excluded for collections that C4C marks as non-patchable
  if (!opts.noUpdate) {
    srv.on('UPDATE', entityName, async (req) => {
      try {
        const id = lastOid(req);
        const payload = to(req.data);
        delete payload.ObjectID;
        delete payload.ParentObjectID;  // ParentObjectID is immutable after creation in C4C
        await c4c.updateChild(c4cCollection, id, payload);
        return { ...req.data };
      } catch (e) {
        req.error(e.response?.status ?? 500, e.response?.data?.error?.message?.value ?? e.message);
      }
    });
  }

  // DELETE handler
  srv.on('DELETE', entityName, async (req) => {
    try {
      const id = lastOid(req);
      await c4c.deleteChild(c4cCollection, id);
    } catch (e) {
      req.error(e.response?.status ?? 500, e.response?.data?.error?.message?.value ?? e.message);
    }
  });
}

// ── In-memory cache ───────────────────────────────────────────────────────────
// Two-level cache to avoid hammering C4C on every FE request:
//   _rfqCache  : individual RFQ records indexed by ObjectID (populated at startup
//                and on single-record reads; used by Object Page navigation)
//   _listCache : the full list result (1000 newest RFQs) stored under key 'latest'
//   _listFetch : in-flight Promise map – if a fetch is already running, all
//                concurrent requests await the same Promise instead of spawning
//                duplicate C4C calls
const _CACHE_TTL = 30 * 60 * 1000; // 30 minutes – re-fetch after this

const _rfqCache   = new Map();  // ObjectID → { data: capObj, expiresAt }
const _listCache  = new Map();  // key → { data: capArr, expiresAt }
const _listFetch  = new Map();  // key → Promise<capArr>  (deduplication map)

// Store a single RFQ in the individual cache (used after fetching by ObjectID)
function _rfqCacheSet(capData) {
  _rfqCache.set(capData.ObjectID, { data: capData, expiresAt: Date.now() + _CACHE_TTL });
}

// Retrieve a single RFQ from cache; returns null if missing or expired
function _rfqCacheGet(id) {
  const entry = _rfqCache.get(id);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) { _rfqCache.delete(id); return null; }
  return entry.data;
}

// Store the list result under a given key
function _listCacheSet(key, all) {
  _listCache.set(key, { data: all, expiresAt: Date.now() + _CACHE_TTL });
}

// Retrieve the list from cache; returns null if missing or expired
function _listCacheGet(key) {
  const entry = _listCache.get(key);
  if (!entry || entry.expiresAt < Date.now()) { _listCache.delete(key); return null; }
  return entry.data;
}

// Invalidate the list cache on any write operation so the next read re-fetches
function _listCacheInvalidate() { _listCache.clear(); _listFetch.clear(); }

// ── RFQService ────────────────────────────────────────────────────────────────
// Main CAP ApplicationService class. All OData handlers are registered in init().
module.exports = class RFQService extends cds.ApplicationService {

  async init() {
    // Destructure all entity references from the CDS model
    const {
      RFQs, RFQStatusSummary,
      RFQItems, RFQForecasts, RFQNotes, RFQSalesTeams, RFQParties,
      RFQEquoteData, RFQGlobalEquote, RFQRelatedTxns,
      RFQAttachmentList, RFQAttachments, RFQStatusHistory
    } = this.entities;

    // ── RFQs READ handler ─────────────────────────────────────────────────────
    // Handles three cases:
    //   1. Mock mode  – returns in-memory test data
    //   2. Single RFQ – /RFQs('OID') or Object Page load; served from cache when possible
    //   3. List       – returns 1000 newest RFQs from cache; sorts locally when FE
    //                   requests a different order (avoids duplicate C4C calls)
    this.on('READ', RFQs, async (req) => {
      // ── Mock mode path ──────────────────────────────────────────────────────
      if (IS_MOCK) {
        const id = extractField(req.query.SELECT?.where ?? [], 'ObjectID');
        if (id) {
          const found = mock.RFQS.find(r => r.ObjectID === id);
          return found ? [found] : [];
        }
        const all  = mock.RFQS.slice();
        const skip = req.query.SELECT?.limit?.offset?.val != null ? Number(req.query.SELECT.limit.offset.val) : 0;
        const top  = req.query.SELECT?.limit?.rows?.val  != null ? Number(req.query.SELECT.limit.rows.val)  : all.length;
        const page = all.slice(skip, skip + top);
        page.$count = all.length;
        return page;
      }

      // ── Live C4C path ───────────────────────────────────────────────────────
      try {
        const { SELECT } = req.query;

        // Extract the single-record key. For /RFQs('OID') navigation, CAP v9
        // puts the key in req.params[0], not in the WHERE clause.
        const id = extractField(SELECT?.where ?? [], 'ObjectID')
          || req.params?.[0]?.ObjectID;

        // Single-record read (Object Page load)
        if (id) {
          // Try individual cache first – populated at startup for the 1000 list records
          const cached = _rfqCacheGet(id);
          if (cached) return [cached];

          // Cache miss: fetch directly from C4C by key
          try {
            const obj = await c4c.getRFQ(id);
            const capData = toCAP(obj);
            _rfqCacheSet(capData);
            return [capData];
          } catch (_e) {
            // C4C sometimes returns 500 on key-based reads; return a minimal stub
            // so the Object Page still renders rather than showing an error.
            return [{ ObjectID: id, criticality: 0 }];
          }
        }

        // List read – use a single fixed cache key ('latest') regardless of the
        // sort order FE requests. FE may add a default sort from UI annotations;
        // using a fixed key ensures the startup warm and user requests share the
        // same in-flight promise (deduplication) and never trigger two C4C calls.
        const LIST_KEY = 'latest';
        let cached = _listCacheGet(LIST_KEY);
        if (!cached) {
          // If no in-flight fetch exists for this key, start one now
          if (!_listFetch.has(LIST_KEY)) {
            const p = c4c.listRFQsFirstPage({ $orderby: 'ID desc' })
              .then(({ results }) => {
                const result = results.map(toCAP);
                // Also cache each record individually for fast Object Page loads
                result.forEach(_rfqCacheSet);
                _listCacheSet(LIST_KEY, result);
                _listFetch.delete(LIST_KEY);
                console.log(`[RFQService] Cache ready: ${result.length} newest RFQs`);
                return result;
              })
              .catch(e => { _listFetch.delete(LIST_KEY); throw e; });
            _listFetch.set(LIST_KEY, p);
          }
          // Await the single shared promise (other concurrent requests also await this)
          cached = await _listFetch.get(LIST_KEY);
        }

        // Apply local sort if FE requested a different column order.
        // Sorting 1000 records in-process is negligible vs another C4C round-trip.
        let all = cached;
        if (SELECT?.orderBy?.length) {
          all = [...cached].sort((a, b) => {
            for (const ord of SELECT.orderBy) {
              const field = ord.ref?.[0];
              const dir   = ord.sort === 'desc' ? -1 : 1;
              const av = a[field] ?? '';
              const bv = b[field] ?? '';
              if (av < bv) return -dir;
              if (av > bv) return dir;
            }
            return 0;
          });
        }

        // Slice the requested page window and attach total count for FE pagination
        const skip = SELECT?.limit?.offset?.val != null ? Number(SELECT.limit.offset.val) : 0;
        const top  = SELECT?.limit?.rows?.val  != null ? Number(SELECT.limit.rows.val)  : all.length;
        const page = all.slice(skip, skip + top);
        page.$count = all.length;
        return page;
      } catch (e) {
        req.error(e.response?.status ?? 500, e.response?.data?.error?.message?.value ?? e.message);
      }
    });

    // ── RFQs CREATE handler ───────────────────────────────────────────────────
    // Translates the CAP payload to C4C field names, POSTs to C4C, then
    // invalidates the list cache so the new record appears on next refresh.
    this.on('CREATE', RFQs, async (req) => {
      if (IS_MOCK) { req.error(501, 'Create not available in mock mode'); return; }
      try {
        const payload = toC4C(req.data);
        delete payload.ObjectID;   // ObjectID is assigned by C4C, not the client
        const created = await c4c.createRFQ(payload);
        _listCacheInvalidate();
        return toCAP(created);
      } catch (e) {
        req.error(e.response?.status ?? 500, e.response?.data?.error?.message?.value ?? e.message);
      }
    });

    // ── RFQs UPDATE handler ───────────────────────────────────────────────────
    // PATCHes the changed fields to C4C and invalidates the list cache.
    this.on('UPDATE', RFQs, async (req) => {
      if (IS_MOCK) { req.error(501, 'Update not available in mock mode'); return; }
      try {
        const id = req.params?.[0]?.ObjectID;
        const payload = toC4C(req.data);
        delete payload.ObjectID;
        await c4c.updateRFQ(id, payload);
        _listCacheInvalidate();
        return { ...req.data };
      } catch (e) {
        req.error(e.response?.status ?? 500, e.response?.data?.error?.message?.value ?? e.message);
      }
    });

    // ── RFQs DELETE handler ───────────────────────────────────────────────────
    this.on('DELETE', RFQs, async (req) => {
      if (IS_MOCK) { req.error(501, 'Delete not available in mock mode'); return; }
      try {
        const id = req.params?.[0]?.ObjectID;
        await c4c.deleteRFQ(id);
        _listCacheInvalidate();
      } catch (e) {
        req.error(e.response?.status ?? 500, e.response?.data?.error?.message?.value ?? e.message);
      }
    });

    // ── Child entity handlers ─────────────────────────────────────────────────

    // Mock mode: simple in-memory READ handlers that filter by parentObjectID
    if (IS_MOCK) {
      const mockChild = (entity, dataset) => {
        this.on('READ', entity, async (req) => {
          const where     = req.query.SELECT?.where ?? [];
          const oid       = extractField(where, 'ObjectID');
          const parentOid = extractField(where, 'parentObjectID')
            || req.params?.[0]?.ObjectID;
          if (oid)       return dataset.filter(r => r.ObjectID === oid);
          if (parentOid) return dataset.filter(r => r.parentObjectID === parentOid);
          return dataset;
        });
      };
      mockChild(RFQItems,          mock.ITEMS);
      mockChild(RFQForecasts,      mock.FORECASTS);
      mockChild(RFQNotes,          mock.NOTES);
      mockChild(RFQSalesTeams,     mock.SALES_TEAM);
      mockChild(RFQParties,        mock.PARTIES);
      mockChild(RFQEquoteData,     mock.EQUOTE_DATA);
      mockChild(RFQGlobalEquote,   mock.GLOBAL_EQUOTE);
      mockChild(RFQRelatedTxns,    mock.RELATED_TXNS);
      mockChild(RFQAttachmentList, mock.ATTACHMENT_LIST);
      mockChild(RFQAttachments,    mock.ATTACHMENTS);
      mockChild(RFQStatusHistory,  mock.STATUS_HISTORY);
    } else {
      // Live C4C mode: wire up full CRUD via mkChildHandlers.
      // Collection names must exactly match the C4C $metadata EntityContainer.
      mkChildHandlers(this, RFQItems,         'RFQItemCollection',                      ITEMS);
      mkChildHandlers(this, RFQForecasts,     'RFQForecastCollection',                  FORECASTS);
      mkChildHandlers(this, RFQNotes,         'RFQnotesCollection',                     NOTES);
      mkChildHandlers(this, RFQSalesTeams,    'RFQSalesTeamCollection',                 SALES_TEAM);
      mkChildHandlers(this, RFQParties,       'RFQPartyCollection',                     PARTIES);
      mkChildHandlers(this, RFQEquoteData,    'RFQEquoteDataCollection',                EQUOTE);
      mkChildHandlers(this, RFQGlobalEquote,  'RFQGloabalEquoteDataCollection',         GLOBAL_EQUOTE);
      mkChildHandlers(this, RFQRelatedTxns,   'RFQListofRelatedTransactionsCollection', RELATED_TXNS);
      mkChildHandlers(this, RFQAttachmentList,'RFQListofAttachmentsCollection',         ATT_LIST);
      mkChildHandlers(this, RFQStatusHistory, 'RFQStatusChangesTrackingCollection',     STATUS_HIST);

      // RFQAttachments is a special case: RFQAttachmentsCollection does not support
      // GET with $filter, so READ returns empty. Attachment metadata is displayed via
      // RFQAttachmentList above. CREATE/DELETE are wired up ready for future use.
      this.on('READ',   RFQAttachments, () => []);
      this.on('CREATE', RFQAttachments, async (req) => {
        try {
          const payload = ATTACHMENTS.to(req.data);
          delete payload.ObjectID;
          const created = await c4c.createChild('RFQAttachmentsCollection', payload);
          return ATTACHMENTS.from(created);
        } catch (e) {
          req.error(e.response?.status ?? 500, e.response?.data?.error?.message?.value ?? e.message);
        }
      });
      this.on('DELETE', RFQAttachments, async (req) => {
        try {
          await c4c.deleteChild('RFQAttachmentsCollection', lastOid(req));
        } catch (e) {
          req.error(e.response?.status ?? 500, e.response?.data?.error?.message?.value ?? e.message);
        }
      });
    }

    // ── RFQStatusSummary READ handler ─────────────────────────────────────────
    // Groups the cached list of RFQs by externalStatus and aggregates counts and
    // total estimated turnover. This drives the pipeline/summary report page.
    // Uses the already-cached list to avoid an extra C4C round-trip.
    this.on('READ', RFQStatusSummary, async (req) => {
      const source = IS_MOCK ? mock.RFQS : (_listCacheGet('latest') ?? []);
      try {
        const groups = {};
        for (const item of source) {
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

    // ── Startup cache warm ────────────────────────────────────────────────────
    // Immediately after the server is ready, kick off a fetch of the first C4C
    // page (1000 newest RFQs ordered by ID desc). The promise is registered in
    // _listFetch so the very first user request awaits the same promise instead
    // of triggering a duplicate parallel C4C call.
    // Once resolved: list cache + individual ObjectID cache are both populated,
    // and a "[RFQService] Cache ready" message is logged to the console.
    if (!IS_MOCK) {
      const warmPromise = c4c.listRFQsFirstPage({ $orderby: 'ID desc' })
        .then(({ results }) => {
          const mapped = results.map(toCAP);
          // Populate individual cache so clicking any list row hits the cache
          // (avoids getRFQ calls which C4C returns 500 on for key reads)
          mapped.forEach(_rfqCacheSet);
          _listCacheSet('latest', mapped);
          _listFetch.delete('latest');
          console.log(`[RFQService] Cache ready: ${mapped.length} newest RFQs`);
          return mapped;
        }).catch(e => {
          _listFetch.delete('latest');
          console.warn('[RFQService] Cache warm failed:', e.message);
        });
      _listFetch.set('latest', warmPromise);
    }
  }
};
