using RFQService from '../../srv/service';

// Makes rfqID render as a navigation link in the List Report table
annotate RFQService.RFQs with @Common.SemanticKey: [rfqID];

// ── LIST REPORT ───────────────────────────────────────────────────────────────

annotate RFQService.RFQs with @(

  UI.SelectionFields: [
    rfqID, externalStatus, rfqDueDate, rfqOverDue,
    supplier, account, marketSeg, busSeg, orgName
  ],

  UI.LineItem: [
    { $Type: 'UI.DataField', Value: rfqID,           Label: '{i18n>rfqID}' },
    { $Type: 'UI.DataField', Value: name,             Label: '{i18n>name}' },
    { $Type: 'UI.DataField', Value: accountName,      Label: '{i18n>account}' },
    { $Type: 'UI.DataField', Value: supplierName,     Label: '{i18n>supplier}' },
    {
      $Type                    : 'UI.DataField',
      Value                    : rfqStatusDesc,
      Label                    : '{i18n>status}',
      Criticality              : criticality,
      CriticalityRepresentation: #WithIcon
    },
    { $Type: 'UI.DataField', Value: rfqDueDate,       Label: '{i18n>rfqDueDate}' },
    { $Type: 'UI.DataField', Value: rfqRemainingDays, Label: '{i18n>rfqRemainingDays}' },
    { $Type: 'UI.DataField', Value: marketSeg,        Label: '{i18n>marketSeg}' },
    { $Type: 'UI.DataField', Value: orgName,          Label: '{i18n>orgName}' },
    { $Type: 'UI.DataField', Value: ownerName,        Label: '{i18n>owner}' }
  ]
);

// ── OBJECT PAGE – RFQs ────────────────────────────────────────────────────────

annotate RFQService.RFQs with @(

  UI.HeaderInfo: {
    TypeName       : '{i18n>rfq}',
    TypeNamePlural : '{i18n>rfqs}',
    Title          : { Value: name },
    Description    : { Value: rfqID }
  },

  UI.DataPoint #StatusDP: {
    Value       : rfqStatusDesc,
    Title       : '{i18n>status}',
    Criticality : criticality
  },

  UI.FieldGroup #HeaderQuick: {
    Data: [
      { $Type: 'UI.DataField', Value: rfqDueDate,    Label: '{i18n>rfqDueDate}' },
      { $Type: 'UI.DataField', Value: sop,            Label: '{i18n>sop}' },
      { $Type: 'UI.DataField', Value: supplierName,   Label: '{i18n>supplier}' },
      { $Type: 'UI.DataField', Value: evaluation,     Label: '{i18n>evaluation}' },
      { $Type: 'UI.DataField', Value: itemCategory,   Label: '{i18n>itemCategory}' }
    ]
  },

  UI.HeaderFacets: [
    {
      $Type : 'UI.ReferenceFacet',
      Target: '@UI.DataPoint#StatusDP'
    },
    {
      $Type : 'UI.ReferenceFacet',
      Target: '@UI.FieldGroup#HeaderQuick'
    }
  ],

  // ── Field groups for General Data tab ──────────────────────────────────────

  UI.FieldGroup #RFQDetails: {
    Label: '{i18n>secRFQDetails}',
    Data : [
      { $Type: 'UI.DataField', Value: earID,              Label: '{i18n>earID}' },
      { $Type: 'UI.DataField', Value: fromOpportunity,    Label: '{i18n>fromOpportunity}' },
      { $Type: 'UI.DataField', Value: rfqReminded,        Label: '{i18n>rfqReminded}' },
      { $Type: 'UI.DataField', Value: parentOpportunityID,Label: '{i18n>parentOpportunityID}' }
    ]
  },

  UI.FieldGroup #DatesSection: {
    Label: '{i18n>secDates}',
    Data : [
      { $Type: 'UI.DataField', Value: rfqInquiryDate,     Label: '{i18n>rfqInquiryDate}' },
      { $Type: 'UI.DataField', Value: rfqRemindedDate,    Label: '{i18n>rfqRemindedDate}' },
      { $Type: 'UI.DataField', Value: customerInquiryDate,Label: '{i18n>customerInquiryDate}' },
      { $Type: 'UI.DataField', Value: closedDate,         Label: '{i18n>closedDate}' }
    ]
  },

  UI.FieldGroup #OrgInteg: {
    Label: '{i18n>secOrgInteg}',
    Data : [
      { $Type: 'UI.DataField', Value: npdrfq,             Label: '{i18n>npdrfq}' },
      { $Type: 'UI.DataField', Value: gmpIndicator,       Label: '{i18n>gmpIndicator}' },
      { $Type: 'UI.DataField', Value: confidential,       Label: '{i18n>confidential}' },
      { $Type: 'UI.DataField', Value: frsFlag,            Label: '{i18n>frsFlag}' },
      { $Type: 'UI.DataField', Value: rdcIndicator,       Label: '{i18n>rdcIndicator}' },
      { $Type: 'UI.DataField', Value: isIndicator,        Label: '{i18n>isIndicator}' },
      { $Type: 'UI.DataField', Value: industrialRouting,  Label: '{i18n>industrialRouting}' },
      { $Type: 'UI.DataField', Value: fromQuote,          Label: '{i18n>fromQuote}' },
      { $Type: 'UI.DataField', Value: rfqReopened,        Label: '{i18n>rfqReopened}' },
      { $Type: 'UI.DataField', Value: estimatedTurnover,  Label: '{i18n>estimatedTurnover}' },
      { $Type: 'UI.DataField', Value: estimatedTurnoverCurrency, Label: '{i18n>currency}' },
      { $Type: 'UI.DataField', Value: supplierLeadTime,   Label: '{i18n>supplierLeadTime}' }
    ]
  },

  UI.FieldGroup #BizMarket: {
    Label: '{i18n>secBizMarket}',
    Data : [
      { $Type: 'UI.DataField', Value: marketSeg,          Label: '{i18n>marketSeg}' },
      { $Type: 'UI.DataField', Value: busSeg,             Label: '{i18n>busSeg}' },
      { $Type: 'UI.DataField', Value: appCode,            Label: '{i18n>appCode}' },
      { $Type: 'UI.DataField', Value: orgName,            Label: '{i18n>orgName}' },
      { $Type: 'UI.DataField', Value: accountName,        Label: '{i18n>account}' },
      { $Type: 'UI.DataField', Value: platform,           Label: '{i18n>platform}' },
      { $Type: 'UI.DataField', Value: parentOpportunityID,Label: '{i18n>parentOpportunityID}' },
      { $Type: 'UI.DataField', Value: evaluation,         Label: '{i18n>evaluation}' }
    ]
  },

  UI.FieldGroup #Admin: {
    Label: '{i18n>admin}',
    Data : [
      { $Type: 'UI.DataField', Value: createdOnDate,     Label: '{i18n>createdOnDate}' },
      { $Type: 'UI.DataField', Value: changedOnDate,     Label: '{i18n>changedOnDate}' },
      { $Type: 'UI.DataField', Value: createdByName,     Label: '{i18n>createdBy}' },
      { $Type: 'UI.DataField', Value: lastChangedByName, Label: '{i18n>lastChangedBy}' }
    ]
  },

  // ── Object Page – 7-tab layout ─────────────────────────────────────────────

  UI.Facets: [

    // Tab 1 – General Data (2×2 grid of sections + Admin)
    {
      $Type : 'UI.CollectionFacet',
      ID    : 'tabGeneralData',
      Label : '{i18n>tabGeneralData}',
      Facets: [
        { $Type: 'UI.ReferenceFacet', ID: 'secRFQDetails',  Label: '{i18n>secRFQDetails}',  Target: '@UI.FieldGroup#RFQDetails' },
        { $Type: 'UI.ReferenceFacet', ID: 'secDates',       Label: '{i18n>secDates}',       Target: '@UI.FieldGroup#DatesSection' },
        { $Type: 'UI.ReferenceFacet', ID: 'secOrgInteg',    Label: '{i18n>secOrgInteg}',    Target: '@UI.FieldGroup#OrgInteg' },
        { $Type: 'UI.ReferenceFacet', ID: 'secBizMarket',   Label: '{i18n>secBizMarket}',   Target: '@UI.FieldGroup#BizMarket' },
        { $Type: 'UI.ReferenceFacet', ID: 'secAdmin',       Label: '{i18n>admin}',           Target: '@UI.FieldGroup#Admin' }
      ]
    },

    // Tab 2 – Involved Parties & Supplier
    {
      $Type : 'UI.CollectionFacet',
      ID    : 'tabParties',
      Label : '{i18n>tabParties}',
      Facets: [
        { $Type: 'UI.ReferenceFacet', ID: 'secSalesTeam', Label: '{i18n>secSalesTeam}', Target: 'salesTeam/@UI.LineItem' },
        { $Type: 'UI.ReferenceFacet', ID: 'secParties',   Label: '{i18n>secParties}',   Target: 'parties/@UI.LineItem' }
      ]
    },

    // Tab 3 – Notes
    {
      $Type : 'UI.CollectionFacet',
      ID    : 'tabNotes',
      Label : '{i18n>tabNotes}',
      Facets: [
        { $Type: 'UI.ReferenceFacet', ID: 'secNotes', Label: '{i18n>secNotes}', Target: 'notes/@UI.LineItem' }
      ]
    },

    // Tab 4 – Products (navigates to items sub-object page)
    {
      $Type : 'UI.CollectionFacet',
      ID    : 'tabProducts',
      Label : '{i18n>tabProducts}',
      Facets: [
        { $Type: 'UI.ReferenceFacet', ID: 'secItems', Label: '{i18n>tabProducts}', Target: 'items/@UI.LineItem' }
      ]
    },

    // Tab 5 – Attachments
    {
      $Type : 'UI.CollectionFacet',
      ID    : 'tabAttachments',
      Label : '{i18n>tabAttachments}',
      Facets: [
        { $Type: 'UI.ReferenceFacet', ID: 'secAttachmentList', Label: '{i18n>secAttachmentList}', Target: 'attachmentList/@UI.LineItem' },
        { $Type: 'UI.ReferenceFacet', ID: 'secAttachments',    Label: '{i18n>secAttachments}',    Target: 'attachments/@UI.LineItem' }
      ]
    },

    // Tab 6 – eQuote
    {
      $Type : 'UI.CollectionFacet',
      ID    : 'tabEquote',
      Label : '{i18n>tabEquote}',
      Facets: [
        { $Type: 'UI.ReferenceFacet', ID: 'secEquote',       Label: '{i18n>secEquote}',       Target: 'equoteData/@UI.LineItem' },
        { $Type: 'UI.ReferenceFacet', ID: 'secGlobalEquote', Label: '{i18n>secGlobalEquote}', Target: 'globalEquote/@UI.LineItem' }
      ]
    },

    // Tab 7 – Changes
    {
      $Type : 'UI.CollectionFacet',
      ID    : 'tabChanges',
      Label : '{i18n>tabChanges}',
      Facets: [
        { $Type: 'UI.ReferenceFacet', ID: 'secStatusHistory', Label: '{i18n>secStatusHistory}', Target: 'statusHistory/@UI.LineItem' }
      ]
    }
  ]
);

// ── CHILD ENTITY: RFQSalesTeams ───────────────────────────────────────────────

annotate RFQService.RFQSalesTeams with @(

  UI.HeaderInfo: {
    TypeName       : '{i18n>salesTeamMember}',
    TypeNamePlural : '{i18n>salesTeamMembers}',
    Title          : { Value: formattedName },
    Description    : { Value: roleCodeText }
  },

  UI.LineItem: [
    { $Type: 'UI.DataField', Value: roleCodeText,  Label: '{i18n>roleCodeText}' },
    { $Type: 'UI.DataField', Value: partyID,       Label: '{i18n>partyID}' },
    { $Type: 'UI.DataField', Value: formattedName, Label: '{i18n>formattedName}' },
    { $Type: 'UI.DataField', Value: mainIndicator, Label: '{i18n>mainIndicator}' }
  ]
);

// ── CHILD ENTITY: RFQParties ──────────────────────────────────────────────────

annotate RFQService.RFQParties with @(

  UI.HeaderInfo: {
    TypeName       : '{i18n>party}',
    TypeNamePlural : '{i18n>partiesPlural}',
    Title          : { Value: roleCodeText },
    Description    : { Value: partyID }
  },

  UI.LineItem: [
    { $Type: 'UI.DataField', Value: roleCodeText,  Label: '{i18n>roleCodeText}' },
    { $Type: 'UI.DataField', Value: partyID,       Label: '{i18n>partyID}' },
    { $Type: 'UI.DataField', Value: mainIndicator, Label: '{i18n>mainIndicator}' },
    { $Type: 'UI.DataField', Value: accountName,   Label: '{i18n>account}' },
    { $Type: 'UI.DataField', Value: supplierName,  Label: '{i18n>supplier}' }
  ]
);

// ── CHILD ENTITY: RFQNotes ────────────────────────────────────────────────────

annotate RFQService.RFQNotes with @(

  UI.HeaderInfo: {
    TypeName       : '{i18n>note}',
    TypeNamePlural : '{i18n>notes}',
    Title          : { Value: noteID },
    Description    : { Value: changedByName }
  },

  UI.LineItem: [
    { $Type: 'UI.DataField', Value: histryNote,    Label: '{i18n>histryNote}' },
    { $Type: 'UI.DataField', Value: changedByName, Label: '{i18n>changedByName}' },
    { $Type: 'UI.DataField', Value: createdAt,     Label: '{i18n>createdAt}' },
    { $Type: 'UI.DataField', Value: lastChangedAt, Label: '{i18n>lastChangedAt}' }
  ]
);

// ── CHILD ENTITY: RFQItems ────────────────────────────────────────────────────

annotate RFQService.RFQItems with @(

  UI.HeaderInfo: {
    TypeName       : '{i18n>item}',
    TypeNamePlural : '{i18n>items}',
    Title          : { Value: itemID },
    Description    : { Value: productDescription }
  },

  UI.LineItem: [
    { $Type: 'UI.DataField', Value: itemID,                 Label: '{i18n>itemID}' },
    { $Type: 'UI.DataField', Value: parentOpportunityItemID,Label: '{i18n>parentOpportunityItemID}' },
    { $Type: 'UI.DataField', Value: mainItemRouting,        Label: '{i18n>mainItemRouting}' },
    { $Type: 'UI.DataField', Value: productID,              Label: '{i18n>productID}' },
    { $Type: 'UI.DataField', Value: productDescription,     Label: '{i18n>productDescription}' },
    { $Type: 'UI.DataField', Value: itemIDCustom,           Label: '{i18n>itemIDCustom}' },
    { $Type: 'UI.DataField', Value: supplierERPID,          Label: '{i18n>supplierERPID}' },
    { $Type: 'UI.DataField', Value: matCode,                Label: '{i18n>matCode}' },
    { $Type: 'UI.DataField', Value: quantity,               Label: '{i18n>quantity}' },
    { $Type: 'UI.DataField', Value: quantityUnit,           Label: '{i18n>quantityUnit}' }
  ],

  // ── Items sub-object page field groups ────────────────────────────────────

  // Tab 1 – General Details
  UI.FieldGroup #ItemProdDetails: {
    Label: '{i18n>secItemProdDetails}',
    Data : [
      { $Type: 'UI.DataField', Value: productCategoryDesc, Label: '{i18n>productCategoryDesc}' },
      { $Type: 'UI.DataField', Value: productSubCatDesc,   Label: '{i18n>productSubCatDesc}' },
      { $Type: 'UI.DataField', Value: itemDimensionUnit,   Label: '{i18n>itemDimensionUnit}' },
      { $Type: 'UI.DataField', Value: inDiam,              Label: '{i18n>inDiam}' },
      { $Type: 'UI.DataField', Value: outDiam,             Label: '{i18n>outDiam}' },
      { $Type: 'UI.DataField', Value: length,              Label: '{i18n>length}' },
      { $Type: 'UI.DataField', Value: width,               Label: '{i18n>width}' },
      { $Type: 'UI.DataField', Value: thickness,           Label: '{i18n>thickness}' }
    ]
  },

  UI.FieldGroup #ItemAttributes: {
    Label: '{i18n>secItemAttributes}',
    Data : [
      { $Type: 'UI.DataField', Value: military,        Label: '{i18n>military}' },
      { $Type: 'UI.DataField', Value: nato,            Label: '{i18n>nato}' },
      { $Type: 'UI.DataField', Value: safetyRelevant,  Label: '{i18n>safetyRelevant}' },
      { $Type: 'UI.DataField', Value: gmpIndicator,    Label: '{i18n>gmpIndicator}' },
      { $Type: 'UI.DataField', Value: toolingRequired, Label: '{i18n>toolingRequired}' },
      { $Type: 'UI.DataField', Value: toolingDesc,     Label: '{i18n>toolingDesc}' }
    ]
  },

  UI.FieldGroup #ItemIdentifiers: {
    Label: '{i18n>secItemIdentifiers}',
    Data : [
      { $Type: 'UI.DataField', Value: productID,         Label: '{i18n>productID}' },
      { $Type: 'UI.DataField', Value: itemIDCustom,      Label: '{i18n>itemIDCustom}' },
      { $Type: 'UI.DataField', Value: productExternalID, Label: '{i18n>productExternalID}' },
      { $Type: 'UI.DataField', Value: productHM,         Label: '{i18n>productHM}' },
      { $Type: 'UI.DataField', Value: productMarking,    Label: '{i18n>productMarking}' },
      { $Type: 'UI.DataField', Value: materialHM,        Label: '{i18n>materialHM}' }
    ]
  },

  // Tab 2 – Commercial & Quality
  UI.FieldGroup #ItemQuantities: {
    Label: '{i18n>secItemQuantities}',
    Data : [
      { $Type: 'UI.DataField', Value: quantity,           Label: '{i18n>quantity}' },
      { $Type: 'UI.DataField', Value: quantityUnit,       Label: '{i18n>quantityUnit}' },
      { $Type: 'UI.DataField', Value: expectedAnnualQty,  Label: '{i18n>expectedAnnualQty}' },
      { $Type: 'UI.DataField', Value: expectedAnnualUnit, Label: '{i18n>expectedAnnualUnit}' },
      { $Type: 'UI.DataField', Value: sampleQty,          Label: '{i18n>sampleQty}' },
      { $Type: 'UI.DataField', Value: sampleUnit,         Label: '{i18n>sampleUnit}' },
      { $Type: 'UI.DataField', Value: prototypeQty,       Label: '{i18n>prototypeQty}' },
      { $Type: 'UI.DataField', Value: prototypeUnit,      Label: '{i18n>prototypeUnit}' },
      { $Type: 'UI.DataField', Value: prototypeDate,      Label: '{i18n>prototypeDate}' },
      { $Type: 'UI.DataField', Value: productionStartDate,Label: '{i18n>productionStartDate}' }
    ]
  },

  UI.FieldGroup #ItemQuality: {
    Label: '{i18n>secItemQuality}',
    Data : [
      { $Type: 'UI.DataField', Value: customerApproval,      Label: '{i18n>customerApproval}' },
      { $Type: 'UI.DataField', Value: designLocked,          Label: '{i18n>designLocked}' },
      { $Type: 'UI.DataField', Value: institutionalApproval, Label: '{i18n>institutionalApproval}' },
      { $Type: 'UI.DataField', Value: annualRequalification, Label: '{i18n>annualRequalification}' },
      { $Type: 'UI.DataField', Value: finalSterilReq,        Label: '{i18n>finalSterilReq}' },
      { $Type: 'UI.DataField', Value: cleanroomNeeded,       Label: '{i18n>cleanroomNeeded}' },
      { $Type: 'UI.DataField', Value: cleanroomManufInd,     Label: '{i18n>cleanroomManufInd}' }
    ]
  },

  UI.FieldGroup #ItemRegulatory: {
    Label: '{i18n>secItemRegulatory}',
    Data : [
      { $Type: 'UI.DataField', Value: fdaDeviceClass,    Label: '{i18n>fdaDeviceClass}' },
      { $Type: 'UI.DataField', Value: fdaClassification, Label: '{i18n>fdaClassification}' },
      { $Type: 'UI.DataField', Value: bioPQ,             Label: '{i18n>bioPQ}' },
      { $Type: 'UI.DataField', Value: apiRelatedQ,       Label: '{i18n>apiRelatedQ}' },
      { $Type: 'UI.DataField', Value: finishedMedDevQ,   Label: '{i18n>finishedMedDevQ}' },
      { $Type: 'UI.DataField', Value: implemantableDevice,Label: '{i18n>implemantableDevice}' }
    ]
  },

  // Tab 4 – Technical Services
  UI.FieldGroup #ItemMaterials: {
    Label: '{i18n>secItemMaterials}',
    Data : [
      { $Type: 'UI.DataField', Value: materialType,     Label: '{i18n>materialType}' },
      { $Type: 'UI.DataField', Value: materialTypeDesc, Label: '{i18n>materialTypeDesc}' },
      { $Type: 'UI.DataField', Value: matCode,          Label: '{i18n>matCode}' },
      { $Type: 'UI.DataField', Value: processHM,        Label: '{i18n>processHM}' },
      { $Type: 'UI.DataField', Value: applicationHM,    Label: '{i18n>applicationHM}' },
      { $Type: 'UI.DataField', Value: capabilitiesHM,   Label: '{i18n>capabilitiesHM}' },
      { $Type: 'UI.DataField', Value: descHM,           Label: '{i18n>descHM}' }
    ]
  },

  UI.FieldGroup #ItemMarking: {
    Label: '{i18n>secItemMarking}',
    Data : [
      { $Type: 'UI.DataField', Value: positionForMarking, Label: '{i18n>positionForMarking}' },
      { $Type: 'UI.DataField', Value: contentForMarking,  Label: '{i18n>contentForMarking}' },
      { $Type: 'UI.DataField', Value: colorForMarking,    Label: '{i18n>colorForMarking}' }
    ]
  },

  UI.FieldGroup #ItemProperties: {
    Label: '{i18n>secItemProperties}',
    Data : [
      { $Type: 'UI.DataField', Value: shore,              Label: '{i18n>shore}' },
      { $Type: 'UI.DataField', Value: productLifetime,    Label: '{i18n>productLifetime}' },
      { $Type: 'UI.DataField', Value: productLifetimeCode,Label: '{i18n>productLifetimeCode}' },
      { $Type: 'UI.DataField', Value: prodLifeCycle,      Label: '{i18n>prodLifeCycle}' },
      { $Type: 'UI.DataField', Value: leadTime,           Label: '{i18n>leadTime}' },
      { $Type: 'UI.DataField', Value: coo,                Label: '{i18n>coo}' }
    ]
  },

  // Tab 5 – Design & Compliance
  UI.FieldGroup #ItemDesign: {
    Label: '{i18n>secItemDesign}',
    Data : [
      { $Type: 'UI.DataField', Value: rdcQ,               Label: '{i18n>rdcQ}' },
      { $Type: 'UI.DataField', Value: reqSupplierLevel,   Label: '{i18n>reqSupplierLevel}' },
      { $Type: 'UI.DataField', Value: consultationRequired,Label: '{i18n>consultationRequired}' },
      { $Type: 'UI.DataField', Value: flexcoatDerivate,   Label: '{i18n>flexcoatDerivate}' },
      { $Type: 'UI.DataField', Value: annulaVolumHMQ,     Label: '{i18n>annulaVolumHMQ}' }
    ]
  },

  UI.FieldGroup #ItemCompliance: {
    Label: '{i18n>secItemCompliance}',
    Data : [
      { $Type: 'UI.DataField', Value: compliance,          Label: '{i18n>compliance}' },
      { $Type: 'UI.DataField', Value: qualCh,              Label: '{i18n>qualCh}' },
      { $Type: 'UI.DataField', Value: machineComponentsQ,  Label: '{i18n>machineComponentsQ}' },
      { $Type: 'UI.DataField', Value: cleanliness,         Label: '{i18n>cleanliness}' },
      { $Type: 'UI.DataField', Value: cleanlinessDesc,     Label: '{i18n>cleanlinessDesc}' },
      { $Type: 'UI.DataField', Value: cleanroomManuf,      Label: '{i18n>cleanroomManuf}' },
      { $Type: 'UI.DataField', Value: cleanroomClass,      Label: '{i18n>cleanroomClass}' }
    ]
  },

  UI.FieldGroup #ItemAdditionalInfo: {
    Label: '{i18n>secItemAdditionalInfo}',
    Data : [
      { $Type: 'UI.DataField', Value: itemNote,               Label: '{i18n>itemNote}' },
      { $Type: 'UI.DataField', Value: packagingReqmt,         Label: '{i18n>packagingReqmt}' },
      { $Type: 'UI.DataField', Value: additionalInfoPkgLbl,   Label: '{i18n>additionalInfoPkgLbl}' },
      { $Type: 'UI.DataField', Value: additionalInfoSP,       Label: '{i18n>additionalInfoSP}' },
      { $Type: 'UI.DataField', Value: additionalInfoSurface,  Label: '{i18n>additionalInfoSurface}' },
      { $Type: 'UI.DataField', Value: addInfoSurface,         Label: '{i18n>addInfoSurface}' },
      { $Type: 'UI.DataField', Value: additinalInfoSampling,  Label: '{i18n>additinalInfoSampling}' },
      { $Type: 'UI.DataField', Value: additinalInfoSerialQty, Label: '{i18n>additinalInfoSerialQty}' }
    ]
  },

  // Tab 6 – ERP & Supplier
  UI.FieldGroup #ItemERP: {
    Label: '{i18n>tabItemERP}',
    Data : [
      { $Type: 'UI.DataField', Value: supplierERPID,   Label: '{i18n>supplierERPID}' },
      { $Type: 'UI.DataField', Value: zProductBuyerID, Label: '{i18n>zProductBuyerID}' },
      { $Type: 'UI.DataField', Value: coo,             Label: '{i18n>coo}' },
      { $Type: 'UI.DataField', Value: leadTime,        Label: '{i18n>leadTime}' }
    ]
  },

  // ── Items sub-object page – 6 tabs ────────────────────────────────────────

  UI.Facets: [

    // Tab 1 – General Details
    {
      $Type : 'UI.CollectionFacet',
      ID    : 'tabItemGeneral',
      Label : '{i18n>tabItemGeneral}',
      Facets: [
        { $Type: 'UI.ReferenceFacet', ID: 'secItemProdDetails',  Label: '{i18n>secItemProdDetails}',  Target: '@UI.FieldGroup#ItemProdDetails' },
        { $Type: 'UI.ReferenceFacet', ID: 'secItemAttributes',   Label: '{i18n>secItemAttributes}',   Target: '@UI.FieldGroup#ItemAttributes' },
        { $Type: 'UI.ReferenceFacet', ID: 'secItemIdentifiers',  Label: '{i18n>secItemIdentifiers}',  Target: '@UI.FieldGroup#ItemIdentifiers' }
      ]
    },

    // Tab 2 – Commercial & Quality
    {
      $Type : 'UI.CollectionFacet',
      ID    : 'tabItemCommercial',
      Label : '{i18n>tabItemCommercial}',
      Facets: [
        { $Type: 'UI.ReferenceFacet', ID: 'secItemQuantities', Label: '{i18n>secItemQuantities}', Target: '@UI.FieldGroup#ItemQuantities' },
        { $Type: 'UI.ReferenceFacet', ID: 'secItemQuality',    Label: '{i18n>secItemQuality}',    Target: '@UI.FieldGroup#ItemQuality' },
        { $Type: 'UI.ReferenceFacet', ID: 'secItemRegulatory', Label: '{i18n>secItemRegulatory}', Target: '@UI.FieldGroup#ItemRegulatory' }
      ]
    },

    // Tab 3 – Forecast Details
    {
      $Type : 'UI.CollectionFacet',
      ID    : 'tabItemForecast',
      Label : '{i18n>tabItemForecast}',
      Facets: [
        { $Type: 'UI.ReferenceFacet', ID: 'secForecasts', Label: '{i18n>tabItemForecast}', Target: 'forecasts/@UI.LineItem' }
      ]
    },

    // Tab 4 – Technical Services
    {
      $Type : 'UI.CollectionFacet',
      ID    : 'tabItemTechnical',
      Label : '{i18n>tabItemTechnical}',
      Facets: [
        { $Type: 'UI.ReferenceFacet', ID: 'secItemMaterials',  Label: '{i18n>secItemMaterials}',  Target: '@UI.FieldGroup#ItemMaterials' },
        { $Type: 'UI.ReferenceFacet', ID: 'secItemMarking',    Label: '{i18n>secItemMarking}',    Target: '@UI.FieldGroup#ItemMarking' },
        { $Type: 'UI.ReferenceFacet', ID: 'secItemProperties', Label: '{i18n>secItemProperties}', Target: '@UI.FieldGroup#ItemProperties' }
      ]
    },

    // Tab 5 – Design & Compliance
    {
      $Type : 'UI.CollectionFacet',
      ID    : 'tabItemDesign',
      Label : '{i18n>tabItemDesign}',
      Facets: [
        { $Type: 'UI.ReferenceFacet', ID: 'secItemDesign',          Label: '{i18n>secItemDesign}',          Target: '@UI.FieldGroup#ItemDesign' },
        { $Type: 'UI.ReferenceFacet', ID: 'secItemCompliance',      Label: '{i18n>secItemCompliance}',      Target: '@UI.FieldGroup#ItemCompliance' },
        { $Type: 'UI.ReferenceFacet', ID: 'secItemAdditionalInfo',  Label: '{i18n>secItemAdditionalInfo}',  Target: '@UI.FieldGroup#ItemAdditionalInfo' }
      ]
    },

    // Tab 6 – ERP & Supplier
    {
      $Type : 'UI.CollectionFacet',
      ID    : 'tabItemERP',
      Label : '{i18n>tabItemERP}',
      Facets: [
        { $Type: 'UI.ReferenceFacet', ID: 'secItemERPDetails', Label: '{i18n>tabItemERP}', Target: '@UI.FieldGroup#ItemERP' }
      ]
    }
  ]
);

// ── CHILD ENTITY: RFQForecasts ────────────────────────────────────────────────

annotate RFQService.RFQForecasts with @(

  UI.HeaderInfo: {
    TypeName       : '{i18n>forecast}',
    TypeNamePlural : '{i18n>forecasts}',
    Title          : { Value: fcastYear },
    Description    : { Value: fcastDate }
  },

  UI.LineItem: [
    { $Type: 'UI.DataField', Value: fcastYear,     Label: '{i18n>fcastYear}' },
    { $Type: 'UI.DataField', Value: fcastDate,     Label: '{i18n>fcastDate}' },
    { $Type: 'UI.DataField', Value: fcastQuantity, Label: '{i18n>fcastQuantity}' },
    { $Type: 'UI.DataField', Value: fcastUnit,     Label: '{i18n>fcastUnit}' }
  ]
);

// ── CHILD ENTITY: RFQAttachmentList ──────────────────────────────────────────

annotate RFQService.RFQAttachmentList with @(

  UI.LineItem: [
    { $Type: 'UI.DataField', Value: fileName, Label: '{i18n>fileName}' },
    { $Type: 'UI.DataField', Value: fileType, Label: '{i18n>fileType}' },
    { $Type: 'UI.DataField', Value: mimeType, Label: '{i18n>mimeType}' }
  ]
);

// ── CHILD ENTITY: RFQAttachments ─────────────────────────────────────────────

annotate RFQService.RFQAttachments with @(

  UI.LineItem: [
    { $Type: 'UI.DataField', Value: name,         Label: '{i18n>attachmentName}' },
    { $Type: 'UI.DataField', Value: title,        Label: '{i18n>attachmentTitle}' },
    { $Type: 'UI.DataField', Value: mimeType,     Label: '{i18n>mimeType}' },
    { $Type: 'UI.DataField', Value: sizeInkB,     Label: '{i18n>sizeInkB}' },
    { $Type: 'UI.DataField', Value: documentLink, Label: '{i18n>documentLink}' },
    { $Type: 'UI.DataField', Value: createdOn,    Label: '{i18n>createdAt}' },
    { $Type: 'UI.DataField', Value: createdBy,    Label: '{i18n>createdBy}' }
  ]
);

// ── CHILD ENTITY: RFQEquoteData ───────────────────────────────────────────────

annotate RFQService.RFQEquoteData with @(

  UI.LineItem: [
    { $Type: 'UI.DataField', Value: itemID,       Label: '{i18n>itemID}' },
    { $Type: 'UI.DataField', Value: product,      Label: '{i18n>productID}' },
    { $Type: 'UI.DataField', Value: supplierName, Label: '{i18n>supplier}' },
    { $Type: 'UI.DataField', Value: baseQuantity, Label: '{i18n>baseQuantity}' },
    { $Type: 'UI.DataField', Value: baseUnit,     Label: '{i18n>baseUnit}' },
    { $Type: 'UI.DataField', Value: cost,         Label: '{i18n>cost}' },
    { $Type: 'UI.DataField', Value: currencyCode, Label: '{i18n>currencyCode}' },
    { $Type: 'UI.DataField', Value: validFromDate,Label: '{i18n>validFromDate}' }
  ]
);

// ── CHILD ENTITY: RFQGlobalEquote ────────────────────────────────────────────

annotate RFQService.RFQGlobalEquote with @(

  UI.LineItem: [
    { $Type: 'UI.DataField', Value: itemID,       Label: '{i18n>itemID}' },
    { $Type: 'UI.DataField', Value: productID,    Label: '{i18n>productID}' },
    { $Type: 'UI.DataField', Value: supplierERPID,Label: '{i18n>supplierERPID}' },
    { $Type: 'UI.DataField', Value: quantity,     Label: '{i18n>quantity}' },
    { $Type: 'UI.DataField', Value: leadTimeDays, Label: '{i18n>leadTimeDays}' },
    { $Type: 'UI.DataField', Value: startDate,    Label: '{i18n>startDate}' },
    { $Type: 'UI.DataField', Value: endDate,      Label: '{i18n>endDate}' }
  ]
);

// ── CHILD ENTITY: RFQStatusHistory ───────────────────────────────────────────

annotate RFQService.RFQStatusHistory with @(

  UI.LineItem: [
    { $Type: 'UI.DataField', Value: newStatusText, Label: '{i18n>newStatusText}' },
    { $Type: 'UI.DataField', Value: oldStatusText, Label: '{i18n>oldStatusText}' },
    { $Type: 'UI.DataField', Value: changedByName, Label: '{i18n>changedByName}' },
    { $Type: 'UI.DataField', Value: changedOn,     Label: '{i18n>changedOn}' }
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
    $Type            : 'UI.ChartDefinitionType',
    ChartType        : #Bar,
    Title            : '{i18n>rfqPipeline}',
    Measures         : [ count ],
    Dimensions       : [ statusDesc ],
    MeasureAttributes: [
      { $Type: 'UI.ChartMeasureAttributeType', Measure: count, Role: #Axis1 }
    ]
  }
);
