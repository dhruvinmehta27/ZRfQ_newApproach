'use strict';

const cds = require('@sap/cds');
const c4c = require('./lib/c4c-client');

// ── Root entity: CAP field → C4C OData V2 property name ──────────────────────

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
  // Criticality: 1=red (overdue), 0=neutral
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

// ── Generic field-map builder for child entities ──────────────────────────────
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

// ── Child entity field maps ───────────────────────────────────────────────────

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

// ── WHERE-clause helpers ──────────────────────────────────────────────────────

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

// ── Generic child-entity handler factory ─────────────────────────────────────
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

      // Collection read – may include parentObjectID filter from composition navigation
      const params = {};
      const parentOid = extractField(where, 'parentObjectID');
      if (parentOid) params.$filter = `ParentObjectID eq '${parentOid}'`;
      if (SELECT?.limit?.rows?.val   != null) params.$top     = SELECT.limit.rows.val;
      if (SELECT?.limit?.offset?.val != null) params.$skip    = SELECT.limit.offset.val;

      const results = await c4c.listChildren(c4cCollection, params);
      return results.map(from);
    } catch (e) {
      req.error(e.response?.status ?? 500, e.response?.data?.error?.message?.value ?? e.message);
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

// ── Service ───────────────────────────────────────────────────────────────────

module.exports = class RFQService extends cds.ApplicationService {

  async init() {
    const {
      RFQs, RFQStatusSummary,
      RFQItems, RFQForecasts, RFQNotes, RFQSalesTeams, RFQParties,
      RFQEquoteData, RFQGlobalEquote, RFQRelatedTxns,
      RFQAttachmentList, RFQAttachments, RFQStatusHistory
    } = this.entities;

    // ── Root entity handlers ─────────────────────────────────────────────────

    this.on('READ', RFQs, async (req) => {
      try {
        const { SELECT } = req.query;
        const id = extractField(SELECT?.where ?? [], 'ObjectID');

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

    this.on('DELETE', RFQs, async (req) => {
      try {
        const id = req.params?.[0]?.ObjectID;
        await c4c.deleteRFQ(id);
      } catch (e) {
        req.error(e.response?.status ?? 500, e.response?.data?.error?.message?.value ?? e.message);
      }
    });

    // ── Child entity handlers ────────────────────────────────────────────────
    // Collection names match the C4C $metadata EntityContainer exactly.

    mkChildHandlers(this, RFQItems,         'RFQItemCollection',                         ITEMS);
    mkChildHandlers(this, RFQForecasts,     'RFQForecastCollection',                     FORECASTS);
    mkChildHandlers(this, RFQNotes,         'RFQnotesCollection',                        NOTES);
    mkChildHandlers(this, RFQSalesTeams,    'RFQSalesTeamCollection',                    SALES_TEAM);
    mkChildHandlers(this, RFQParties,       'RFQPartyCollection',                        PARTIES);
    mkChildHandlers(this, RFQEquoteData,    'RFQEquoteDataCollection',                   EQUOTE);
    mkChildHandlers(this, RFQGlobalEquote,  'RFQGloabalEquoteDataCollection',            GLOBAL_EQUOTE); // C4C typo in coll name
    mkChildHandlers(this, RFQRelatedTxns,   'RFQListofRelatedTransactionsCollection',    RELATED_TXNS);
    mkChildHandlers(this, RFQAttachmentList,'RFQListofAttachmentsCollection',            ATT_LIST);
    mkChildHandlers(this, RFQStatusHistory, 'RFQStatusChangesTrackingCollection',        STATUS_HIST);
    // RFQAttachments: C4C does not support PATCH on this collection
    mkChildHandlers(this, RFQAttachments,   'RFQAttachmentsCollection',                  ATTACHMENTS, { noUpdate: true });

    // ── RFQ Status Summary (pipeline reporting, computed in handler) ──────────

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
