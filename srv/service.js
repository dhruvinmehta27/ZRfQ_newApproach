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
  supplier                  : 'SupplierID',           // ← was 'Supplier' (corrected)
  supplierName              : 'SupplierName',
  owner                     : 'Owner',
  ownerName                 : 'OwnerName',
  requestor                 : 'Requestor',
  requestorName             : 'RequestorName',
  categoryPurchaser         : 'CategoryPurchaserID',  // ← was 'CategoryPurchaser' (corrected)
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

function toC4C(capObj) {
  const r = {};
  for (const [capKey, c4cKey] of Object.entries(TO_C4C)) {
    if (capObj[capKey] !== undefined) r[c4cKey] = capObj[capKey];
  }
  return r;
}

// ── Generic field-map builder for child entities ────────────────────────────────────
// Returns { to, from } converter pair for a CAP→C4C property name map.

function mapFields(capToC4C) {
  const c4cToCap = Object.fromEntries(Object.entries(capToC4C).map(([k, v]) => [v, k]));
  return {
    to(capObj) {
      const r = {};
      for (const [capKey, c4cKey] of Object.entries(capToC4C)) {
        if (capObj[capKey] !== undefined) r[c4cKey] = capObj[capKey];
      }
      return r;
    },
    from(raw) {
      const r = {};
      for (const [c4cKey, capKey] of Object.entries(c4cToCap)) {
        if (raw[c4cKey] !== undefined) r[capKey] = raw[c4cKey];
      }
      return r;
    }
  };
}

// ── Child entity field maps ───────────────────────────────────────────────────────

// RFQItems – CAP field → C4C property
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

// RFQForecasts – volume forecasts per line item
const FORECASTS = mapFields({
  ObjectID        : 'ObjectID',
  parentObjectID  : 'ParentObjectID',
  fcastDate       : 'Fcast_Date',
  fcastQuantity   : 'Fcast_Quantity',
  fcastUnit       : 'unitCode',
  fcastYear       : 'Fcast_Yeart',     // C4C typo preserved
  itemID          : 'ItemID'
});

// RFQNotes – text / history notes
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

// RFQSalesTeams – sales team members
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

// RFQParties – party roles (buyer, seller, etc.)
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

// RFQEquoteData – eQuote pricing data per item
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

// RFQGlobalEquote – global/summary eQuote data
// C4C entity is "RFQGloabalEquoteData" (typo); collection: RFQGloabalEquoteDataCollection
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

// RFQRelatedTxns – linked opportunities and quotes
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

// RFQAttachmentList – attachment metadata (file name, type, mime)
const ATT_LIST = mapFields({
  ObjectID        : 'ObjectID',
  parentObjectID  : 'ParentObjectID',
  fileName        : 'fileName',
  fileType        : 'fileType',
  mimeType        : 'mimeType'
});

// RFQAttachments – binary attachment records (create + delete only in C4C)
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

// RFQStatusHistory – status change audit trail
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

// ── WHERE-clause helpers ──────────────────────────────────────────────────────────────

// Scans CQN WHERE array for: { ref: [fieldName] } = { val: 'X' }
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

// Extracts the last ObjectID from req.params (works for both direct and
// navigation access: /Entity('OID') and /Parent('POID')/children('OID'))
function lastOid(req) {
  return req.params?.[req.params.length - 1]?.ObjectID ?? null;
}

function buildOrderBy(orderBy = []) {
  return orderBy
    .map(o => `${TO_C4C[o.ref?.[0]] ?? o.ref?.[0]} ${o.sort ?? 'asc'}`)
    .join(',');
}

// ── Generic child-entity handler factory ─────────────────────────────────────────────
// Registers READ / CREATE / UPDATE / DELETE handlers for a child entity.
// opts.noUpdate = true for entities where C4C does not support PATCH.

function mkChildHandlers(srv, entityName, c4cCollection, fieldMap, opts = {}) {
  const { to, from } = fieldMap;

  srv.on('READ', entityName, async (req) => {
    try {
      const { SELECT } = req.query;
      const where = SELECT?.where ?? [];

      // Single-item read by ObjectID
      const oid = extractField(where, 'ObjectID');
      if (oid) {
        const obj = await c4c.getChild(c4cCollection, oid);
        return [from(obj)];
      }

      // Collection read – may include parentObjectID filter from composition navigation.
      // For /RFQs('OID')/items style navigation CAP puts the parent key in req.params,
      // not in the WHERE clause, so fall back to req.params[0].ObjectID.
      const parentOid = extractField(where, 'parentObjectID')
        || req.params?.[0]?.ObjectID;

      // Guard: never call C4C without a parent filter – some collections refuse
      // unfiltered reads with 400 "not supported by the processor".
      if (!parentOid) return [];

      const all = await c4c.listChildren(c4cCollection, {
        $filter: `ParentObjectID eq '${parentOid}'`
      });
      const mapped = all.map(from);

      const skip = SELECT?.limit?.offset?.val != null ? Number(SELECT.limit.offset.val) : 0;
      const top  = SELECT?.limit?.rows?.val   != null ? Number(SELECT.limit.rows.val)   : mapped.length;
      const page = mapped.slice(skip, skip + top);
      page.$count = mapped.length;
      return page;
    } catch (e) {
      const status = e.response?.status ?? 500;
      const msg    = e.response?.data?.error?.message?.value ?? e.message;
      // Some C4C collections don't support $filter on ParentObjectID.
      // Return empty rather than crashing the whole Object Page for one tab.
      if (status === 400) {
        console.warn(`[${c4cCollection}] C4C 400 – returning empty: ${msg}`);
        return [];
      }
      req.error(status, msg);
    }
  });

  srv.on('CREATE', entityName, async (req) => {
    try {
      const payload = to(req.data);
      delete payload.ObjectID;  // system-assigned by C4C
      const created = await c4c.createChild(c4cCollection, payload);
      return from(created);
    } catch (e) {
      req.error(e.response?.status ?? 500, e.response?.data?.error?.message?.value ?? e.message);
    }
  });

  if (!opts.noUpdate) {
    srv.on('UPDATE', entityName, async (req) => {
      try {
        const id = lastOid(req);
        const payload = to(req.data);
        delete payload.ObjectID;
        delete payload.ParentObjectID;  // immutable after creation in C4C
        await c4c.updateChild(c4cCollection, id, payload);
        return { ...req.data };
      } catch (e) {
        req.error(e.response?.status ?? 500, e.response?.data?.error?.message?.value ?? e.message);
      }
    });
  }

  srv.on('DELETE', entityName, async (req) => {
    try {
      const id = lastOid(req);
      await c4c.deleteChild(c4cCollection, id);
    } catch (e) {
      req.error(e.response?.status ?? 500, e.response?.data?.error?.message?.value ?? e.message);
    }
  });
}

// ── Caches ────────────────────────────────────────────────────────────────────────────
const _CACHE_TTL = 30 * 60 * 1000; // 30 minutes

const _rfqCache   = new Map();  // ObjectID → { data, expiresAt }
const _listCache  = new Map();  // orderBy string → { data: capArr, expiresAt }
const _listFetch  = new Map();  // orderBy string → Promise<capArr> (in-flight dedup)

function _rfqCacheSet(capData) {
  _rfqCache.set(capData.ObjectID, { data: capData, expiresAt: Date.now() + _CACHE_TTL });
}
function _rfqCacheGet(id) {
  const entry = _rfqCache.get(id);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) { _rfqCache.delete(id); return null; }
  return entry.data;
}

function _listCacheSet(key, all) {
  _listCache.set(key, { data: all, expiresAt: Date.now() + _CACHE_TTL });
}
function _listCacheGet(key) {
  const entry = _listCache.get(key);
  if (!entry || entry.expiresAt < Date.now()) { _listCache.delete(key); return null; }  return entry.data;
}
function _listCacheInvalidate() { _listCache.clear(); _listFetch.clear(); }

// ── Service ─────────────────────────────────────────────────────────────────────────────────

module.exports = class RFQService extends cds.ApplicationService {

  async init() {
    const {
      RFQs, RFQStatusSummary,
      RFQItems, RFQForecasts, RFQNotes, RFQSalesTeams, RFQParties,
      RFQEquoteData, RFQGlobalEquote, RFQRelatedTxns,
      RFQAttachmentList, RFQAttachments, RFQStatusHistory
    } = this.entities;

    // ── Root entity handlers ─────────────────────────────────────────────────────

    this.on('READ', RFQs, async (req) => {
      if (IS_MOCK) {
        const id = extractField(req.query.SELECT?.where ?? [], 'ObjectID');
        if (id) {
          const found = mock.RFQS.find(r => r.ObjectID === id);
          return found ? [found] : [];
        }
        const all = mock.RFQS.slice();
        const skip = req.query.SELECT?.limit?.offset?.val != null ? Number(req.query.SELECT.limit.offset.val) : 0;
        const top  = req.query.SELECT?.limit?.rows?.val  != null ? Number(req.query.SELECT.limit.rows.val)  : all.length;
        const page = all.slice(skip, skip + top);
        page.$count = all.length;
        return page;
      }

      try {
        const { SELECT } = req.query;
        // For /RFQs('OID') navigation CAP puts the key in req.params, not WHERE.
        const id = extractField(SELECT?.where ?? [], 'ObjectID')
          || req.params?.[0]?.ObjectID;

        if (id) {
          const cached = _rfqCacheGet(id);
          if (cached) return [cached];

          try {
            const obj = await c4c.getRFQ(id);
            const capData = toCAP(obj);
            _rfqCacheSet(capData);
            return [capData];
          } catch (_e) {
            return [{ ObjectID: id, criticality: 0 }];
          }
        }

        // Always use a single fixed cache key. FE may request different
        // sort orders (from annotations); satisfy those by sorting locally
        // from the cached 1000-record slice rather than re-fetching.
        const LIST_KEY = 'latest';
        let cached = _listCacheGet(LIST_KEY);
        if (!cached) {
          if (!_listFetch.has(LIST_KEY)) {
            const p = c4c.listRFQsFirstPage({ $orderby: 'ID desc' })
              .then(({ results }) => {
                const result = results.map(toCAP);
                result.forEach(_rfqCacheSet);
                _listCacheSet(LIST_KEY, result);
                _listFetch.delete(LIST_KEY);
                console.log(`[RFQService] Cache ready: ${result.length} newest RFQs`);
                return result;
              })
              .catch(e => { _listFetch.delete(LIST_KEY); throw e; });
            _listFetch.set(LIST_KEY, p);
          }
          cached = await _listFetch.get(LIST_KEY);
        }

        // Sort locally if FE requested a different order (fast on 1000 records)
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

        const skip = SELECT?.limit?.offset?.val != null ? Number(SELECT.limit.offset.val) : 0;
        const top  = SELECT?.limit?.rows?.val  != null ? Number(SELECT.limit.rows.val)  : all.length;
        const page = all.slice(skip, skip + top);
        page.$count = all.length;
        return page;
      } catch (e) {
        req.error(e.response?.status ?? 500, e.response?.data?.error?.message?.value ?? e.message);
      }
    });

    this.on('CREATE', RFQs, async (req) => {
      if (IS_MOCK) { req.error(501, 'Create not available in mock mode'); return; }
      try {
        const payload = toC4C(req.data);
        delete payload.ObjectID;
        const created = await c4c.createRFQ(payload);
        _listCacheInvalidate();
        return toCAP(created);
      } catch (e) {
        req.error(e.response?.status ?? 500, e.response?.data?.error?.message?.value ?? e.message);
      }
    });

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

    // ── Child entity handlers ─────────────────────────────────────────────────────

    // In mock mode: register simple READ-only handlers that filter by parentObjectID
    if (IS_MOCK) {
      const mockChild = (entity, dataset) => {
        this.on('READ', entity, async (req) => {
          const where = req.query.SELECT?.where ?? [];
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
    // Collection names match the C4C $metadata EntityContainer exactly.
    mkChildHandlers(this, RFQItems,         'RFQItemCollection',                         ITEMS);
    mkChildHandlers(this, RFQForecasts,     'RFQForecastCollection',                     FORECASTS);
    mkChildHandlers(this, RFQNotes,         'RFQnotesCollection',                        NOTES);
    mkChildHandlers(this, RFQSalesTeams,    'RFQSalesTeamCollection',                    SALES_TEAM);
    mkChildHandlers(this, RFQParties,       'RFQPartyCollection',                        PARTIES);
    mkChildHandlers(this, RFQEquoteData,    'RFQEquoteDataCollection',                   EQUOTE);
    mkChildHandlers(this, RFQGlobalEquote,  'RFQGloabalEquoteDataCollection',            GLOBAL_EQUOTE);
    mkChildHandlers(this, RFQRelatedTxns,   'RFQListofRelatedTransactionsCollection',    RELATED_TXNS);
    mkChildHandlers(this, RFQAttachmentList,'RFQListofAttachmentsCollection',            ATT_LIST);
    mkChildHandlers(this, RFQStatusHistory, 'RFQStatusChangesTrackingCollection',        STATUS_HIST);
    // RFQAttachmentsCollection does not support GET with $filter – attachments
    // are readable via RFQAttachmentList above. Only wire up CREATE/DELETE here.
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

    // ── RFQ Status Summary (pipeline reporting, computed in handler) ──────────────────

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

    // Warm cache at startup: fetch the first C4C page (newest 1000 RFQs).
    // Registered in _listFetch so the first user request awaits the same
    // promise instead of triggering a second parallel C4C call.
    if (!IS_MOCK) {
      const warmPromise = c4c.listRFQsFirstPage({ $orderby: 'ID desc' })
        .then(({ results }) => {
          const mapped = results.map(toCAP);
          // Also populate individual ObjectID cache so Object Page clicks
          // hit the cache instead of calling getRFQ (which C4C 500s on key reads).
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
