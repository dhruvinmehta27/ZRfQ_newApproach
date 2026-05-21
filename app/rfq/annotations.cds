using RFQService from '../../srv/service';

// ── RFQs – List Report ────────────────────────────────────────────────────────

annotate RFQService.RFQs with @(

  UI.SelectionFields: [
    rfqID, externalStatus, rfqDueDate,
    account, supplier, marketSeg, busSeg, rfqOverDue
  ],

  UI.LineItem: [
    { $Type: 'UI.DataField', Value: rfqID,             Label: '{i18n>rfqID}' },
    { $Type: 'UI.DataField', Value: name,               Label: '{i18n>name}' },
    { $Type: 'UI.DataField', Value: accountName,        Label: '{i18n>account}' },
    { $Type: 'UI.DataField', Value: supplierName,       Label: '{i18n>supplier}' },
    {
      $Type               : 'UI.DataField',
      Value               : rfqStatusDesc,
      Label               : '{i18n>status}',
      Criticality         : criticality,
      CriticalityRepresentation: #WithIcon
    },
    { $Type: 'UI.DataField', Value: rfqDueDate,         Label: '{i18n>rfqDueDate}' },
    { $Type: 'UI.DataField', Value: rfqRemainingDays,   Label: '{i18n>rfqRemainingDays}' },
    { $Type: 'UI.DataField', Value: marketSeg,          Label: '{i18n>marketSeg}' },
    { $Type: 'UI.DataField', Value: orgName,            Label: '{i18n>orgName}' },
    { $Type: 'UI.DataField', Value: ownerName,          Label: '{i18n>owner}' }
  ],

  // ── Object Page header ──────────────────────────────────────────────────────

  UI.HeaderInfo: {
    TypeName       : '{i18n>rfq}',
    TypeNamePlural : '{i18n>rfqs}',
    Title          : { Value: rfqID },
    Description    : { Value: name }
  },

  UI.HeaderFacets: [
    { $Type: 'UI.ReferenceFacet', Target: '@UI.FieldGroup#StatusHeader' },
    { $Type: 'UI.ReferenceFacet', Target: '@UI.FieldGroup#DueDateHeader' }
  ],

  UI.FieldGroup #StatusHeader: {
    Data: [
      { $Type: 'UI.DataField', Value: rfqStatusDesc,   Criticality: criticality },
      { $Type: 'UI.DataField', Value: externalStatus,  Label: '{i18n>externalStatus}' }
    ]
  },

  UI.FieldGroup #DueDateHeader: {
    Data: [
      { $Type: 'UI.DataField', Value: rfqDueDate,       Label: '{i18n>rfqDueDate}' },
      { $Type: 'UI.DataField', Value: rfqRemainingDays, Label: '{i18n>rfqRemainingDays}' }
    ]
  },

  // ── Object Page field groups ────────────────────────────────────────────────

  UI.FieldGroup #General: {
    Label: '{i18n>general}',
    Data : [
      { $Type: 'UI.DataField', Value: rfqID,          Label: '{i18n>rfqID}' },
      { $Type: 'UI.DataField', Value: name,            Label: '{i18n>name}' },
      { $Type: 'UI.DataField', Value: rfqType,         Label: '{i18n>rfqType}' },
      { $Type: 'UI.DataField', Value: rfqStatus,       Label: '{i18n>rfqStatus}' },
      { $Type: 'UI.DataField', Value: rfqStatusDesc,   Label: '{i18n>status}' },
      { $Type: 'UI.DataField', Value: externalStatus,  Label: '{i18n>externalStatus}' },
      { $Type: 'UI.DataField', Value: systemStatus,    Label: '{i18n>systemStatus}' },
      { $Type: 'UI.DataField', Value: confidential,    Label: '{i18n>confidential}' },
      { $Type: 'UI.DataField', Value: npdrfq,          Label: '{i18n>npdrfq}' },
      { $Type: 'UI.DataField', Value: evaluation,      Label: '{i18n>evaluation}' },
      { $Type: 'UI.DataField', Value: itemCategory,    Label: '{i18n>itemCategory}' }
    ]
  },

  UI.FieldGroup #Parties: {
    Label: '{i18n>parties}',
    Data : [
      { $Type: 'UI.DataField', Value: account,                Label: '{i18n>accountID}' },
      { $Type: 'UI.DataField', Value: accountName,            Label: '{i18n>account}' },
      { $Type: 'UI.DataField', Value: supplier,               Label: '{i18n>supplierID}' },
      { $Type: 'UI.DataField', Value: supplierName,           Label: '{i18n>supplier}' },
      { $Type: 'UI.DataField', Value: owner,                  Label: '{i18n>ownerID}' },
      { $Type: 'UI.DataField', Value: ownerName,              Label: '{i18n>owner}' },
      { $Type: 'UI.DataField', Value: requestor,              Label: '{i18n>requestorID}' },
      { $Type: 'UI.DataField', Value: requestorName,          Label: '{i18n>requestor}' },
      { $Type: 'UI.DataField', Value: categoryPurchaser,      Label: '{i18n>categoryPurchaserID}' },
      { $Type: 'UI.DataField', Value: categoryPurchaserName,  Label: '{i18n>categoryPurchaser}' },
      { $Type: 'UI.DataField', Value: categoryPurchaserEmail, Label: '{i18n>categoryPurchaserEmail}' }
    ]
  },

  UI.FieldGroup #Dates: {
    Label: '{i18n>dates}',
    Data : [
      { $Type: 'UI.DataField', Value: rfqInquiryDate,      Label: '{i18n>rfqInquiryDate}' },
      { $Type: 'UI.DataField', Value: customerInquiryDate, Label: '{i18n>customerInquiryDate}' },
      { $Type: 'UI.DataField', Value: rfqDueDate,          Label: '{i18n>rfqDueDate}' },
      { $Type: 'UI.DataField', Value: sop,                 Label: '{i18n>sop}' },
      { $Type: 'UI.DataField', Value: closedDate,          Label: '{i18n>closedDate}' },
      { $Type: 'UI.DataField', Value: rfqOverDue,          Label: '{i18n>rfqOverDue}' },
      { $Type: 'UI.DataField', Value: rfqRemainingDays,    Label: '{i18n>rfqRemainingDays}' },
      { $Type: 'UI.DataField', Value: rfqRemindedDate,     Label: '{i18n>rfqRemindedDate}' }
    ]
  },

  UI.FieldGroup #Commercial: {
    Label: '{i18n>commercial}',
    Data : [
      { $Type: 'UI.DataField', Value: estimatedTurnover,          Label: '{i18n>estimatedTurnover}' },
      { $Type: 'UI.DataField', Value: estimatedTurnoverCurrency,  Label: '{i18n>currency}' },
      { $Type: 'UI.DataField', Value: supplierLeadTime,           Label: '{i18n>supplierLeadTime}' }
    ]
  },

  UI.FieldGroup #Classification: {
    Label: '{i18n>classification}',
    Data : [
      { $Type: 'UI.DataField', Value: busSeg,           Label: '{i18n>busSeg}' },
      { $Type: 'UI.DataField', Value: marketSeg,        Label: '{i18n>marketSeg}' },
      { $Type: 'UI.DataField', Value: appCode,          Label: '{i18n>appCode}' },
      { $Type: 'UI.DataField', Value: platform,         Label: '{i18n>platform}' },
      { $Type: 'UI.DataField', Value: gmpIndicator,     Label: '{i18n>gmpIndicator}' },
      { $Type: 'UI.DataField', Value: rdcIndicator,     Label: '{i18n>rdcIndicator}' },
      { $Type: 'UI.DataField', Value: isIndicator,      Label: '{i18n>isIndicator}' },
      { $Type: 'UI.DataField', Value: frsFlag,          Label: '{i18n>frsFlag}' },
      { $Type: 'UI.DataField', Value: industrialRouting,Label: '{i18n>industrialRouting}' }
    ]
  },

  UI.FieldGroup #Organisation: {
    Label: '{i18n>organisation}',
    Data : [
      { $Type: 'UI.DataField', Value: orgName, Label: '{i18n>orgName}' },
      { $Type: 'UI.DataField', Value: orgID,   Label: '{i18n>orgID}' },
      { $Type: 'UI.DataField', Value: terrName,Label: '{i18n>terrName}' },
      { $Type: 'UI.DataField', Value: terrID,  Label: '{i18n>terrID}' }
    ]
  },

  UI.FieldGroup #Metrics: {
    Label: '{i18n>metrics}',
    Data : [
      { $Type: 'UI.DataField', Value: noOfProducts,   Label: '{i18n>noOfProducts}' },
      { $Type: 'UI.DataField', Value: noOfEquote,     Label: '{i18n>noOfEquote}' },
      { $Type: 'UI.DataField', Value: noOfAttachments,Label: '{i18n>noOfAttachments}' },
      { $Type: 'UI.DataField', Value: rfqReminded,    Label: '{i18n>rfqReminded}' }
    ]
  },

  UI.FieldGroup #References: {
    Label: '{i18n>references}',
    Data : [
      { $Type: 'UI.DataField', Value: parentOpportunityID, Label: '{i18n>parentOpportunityID}' },
      { $Type: 'UI.DataField', Value: earID,               Label: '{i18n>earID}' },
      { $Type: 'UI.DataField', Value: fromOpportunity,     Label: '{i18n>fromOpportunity}' },
      { $Type: 'UI.DataField', Value: fromQuote,           Label: '{i18n>fromQuote}' },
      { $Type: 'UI.DataField', Value: rfqReopened,         Label: '{i18n>rfqReopened}' }
    ]
  },

  UI.FieldGroup #Admin: {
    Label: '{i18n>admin}',
    Data : [
      { $Type: 'UI.DataField', Value: createdOnDate,    Label: '{i18n>createdOnDate}' },
      { $Type: 'UI.DataField', Value: changedOnDate,    Label: '{i18n>changedOnDate}' },
      { $Type: 'UI.DataField', Value: createdByName,    Label: '{i18n>createdBy}' },
      { $Type: 'UI.DataField', Value: lastChangedByName,Label: '{i18n>lastChangedBy}' }
    ]
  },

  // ── Object Page facets ──────────────────────────────────────────────────────

  UI.Facets: [
    { $Type: 'UI.ReferenceFacet', Label: '{i18n>general}',        Target: '@UI.FieldGroup#General' },
    { $Type: 'UI.ReferenceFacet', Label: '{i18n>parties}',        Target: '@UI.FieldGroup#Parties' },
    { $Type: 'UI.ReferenceFacet', Label: '{i18n>dates}',          Target: '@UI.FieldGroup#Dates' },
    { $Type: 'UI.ReferenceFacet', Label: '{i18n>commercial}',     Target: '@UI.FieldGroup#Commercial' },
    { $Type: 'UI.ReferenceFacet', Label: '{i18n>classification}', Target: '@UI.FieldGroup#Classification' },
    { $Type: 'UI.ReferenceFacet', Label: '{i18n>organisation}',   Target: '@UI.FieldGroup#Organisation' },
    { $Type: 'UI.ReferenceFacet', Label: '{i18n>metrics}',        Target: '@UI.FieldGroup#Metrics' },
    { $Type: 'UI.ReferenceFacet', Label: '{i18n>references}',     Target: '@UI.FieldGroup#References' },
    { $Type: 'UI.ReferenceFacet', Label: '{i18n>admin}',          Target: '@UI.FieldGroup#Admin' }
  ]
);

// ── RFQStatusSummary – Pipeline reporting view ────────────────────────────────

annotate RFQService.RFQStatusSummary with @(

  UI.LineItem: [
    { $Type: 'UI.DataField', Value: statusDesc,    Label: '{i18n>status}' },
    { $Type: 'UI.DataField', Value: externalStatus,Label: '{i18n>externalStatus}' },
    { $Type: 'UI.DataField', Value: count,          Label: '{i18n>count}' },
    { $Type: 'UI.DataField', Value: totalTurnover,  Label: '{i18n>totalTurnover}' },
    { $Type: 'UI.DataField', Value: currency,       Label: '{i18n>currency}' }
  ],

  UI.HeaderInfo: {
    TypeName       : '{i18n>rfqStatusSummary}',
    TypeNamePlural : '{i18n>rfqStatusSummaries}',
    Title          : { Value: statusDesc },
    Description    : { Value: externalStatus }
  },

  UI.Chart: {
    $Type         : 'UI.ChartDefinitionType',
    ChartType     : #Bar,
    Title         : '{i18n>rfqPipeline}',
    Measures      : [ count ],
    Dimensions    : [ statusDesc ],
    MeasureAttributes: [
      { $Type: 'UI.ChartMeasureAttributeType', Measure: count, Role: #Axis1 }
    ]
  }
);
