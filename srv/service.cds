/**
 * RFQ Service – OData V4 façade over SAP C4C /cust/v1/zrfq
 *
 * Cardinalities (from $metadata Associations):
 *   RFQs 1:N RFQItems, RFQNotes, RFQSalesTeams, RFQParties,
 *             RFQEquoteData, RFQGlobalEquote, RFQRelatedTxns,
 *             RFQAttachmentList, RFQAttachments, RFQStatusHistory
 *   RFQItems 1:N RFQForecasts
 *
 * All data lives in C4C. Handlers in srv/service.js proxy every
 * operation to C4C via BTP Destination Service.
 */

@path: '/rfq'
service RFQService {

  // ── Root entity (full CRUD) ─────────────────────────────────────────────────
  entity RFQs {
    key ObjectID                  : String(70);      // C4C system key
        rfqID                     : String(35);      // ID
        name                      : String(255);     // Name
        rfqType                   : String(30);      // RFQType
        rfqStatus                 : String(30);      // RFQStatus (code)
        rfqStatusDesc             : String(100);     // RFQStatus_Desc
        externalStatus            : String(30);      // ExternalUserStatusCode
        systemStatus              : String(30);      // SystemStatus
        // Parties
        account                   : String(10);      // Account (BP ID)
        accountName               : String(255);     // AccountName
        supplier                  : String(60);      // SupplierID (BP ID)
        supplierName              : String(255);     // SupplierName
        owner                     : String(10);      // Owner (BP ID)
        ownerName                 : String(255);     // OwnerName
        requestor                 : String(60);      // Requestor (BP ID, SDK only)
        requestorName             : String(255);     // RequestorName
        categoryPurchaser         : String(60);      // CategoryPurchaserID (BP ID)
        categoryPurchaserName     : String(255);     // CategoryPurchaserName
        categoryPurchaserEmail    : String(255);     // CategoryPurchaserEmail
        // Dates
        rfqDueDate                : Date;            // RFQDueDate
        rfqInquiryDate            : Date;            // RFQInquiryDate
        customerInquiryDate       : Date;            // CustomerInquiryDate
        sop                       : Date;            // SOP – Start of Production
        closedDate                : Date;            // RFQConfirmedOn_ClosedDate
        rfqRemindedDate           : Date;            // RFQReminded_Date
        createdOnDate             : Date;            // CreatedOn_date
        changedOnDate             : Date;            // ChangedOn_date
        // Commercial
        estimatedTurnover         : Decimal(15,2);   // EstimatedPeakTurnOver
        estimatedTurnoverCurrency : String(3);       // EstimatedPeakTurnOverCurrencyCode
        supplierLeadTime          : Decimal(10,2);   // SupplierLeadTime (weeks)
        // Classification
        busSeg                    : String(30);      // BusSeg
        marketSeg                 : String(30);      // MarketSeg
        appCode                   : String(30);      // AppCode
        platform                  : String(255);     // Platform
        itemCategory              : String(30);      // ItemCategory
        evaluation                : String(30);      // Evaluation
        // Organisation
        orgName                   : String(100);     // OrgName
        orgID                     : String(60);      // OrgID
        terrName                  : String(100);     // TerrName
        terrID                    : String(60);      // TerrID
        // Indicators / flags
        rfqOverDue                : Boolean;         // RfQOverDue
        rfqRemainingDays          : Decimal(10,2);   // RfQRemainingDueDays
        confidential              : Boolean;         // Confidential
        gmpIndicator              : Boolean;         // GMPIndicator
        npdrfq                    : Boolean;         // NPDRFQ
        rdcIndicator              : Boolean;         // RDC_Indicator
        isIndicator               : Boolean;         // IS_Indicator (Integrated Solution)
        frsFlag                   : Boolean;         // FRSFlag
        industrialRouting         : Boolean;         // IndustrialRouting
        rfqReopened               : Boolean;         // RFQReopened
        fromOpportunity           : Boolean;         // FromOpportunity
        fromQuote                 : Boolean;         // FromQuote
        // Metrics
        noOfProducts              : Decimal(10,0);   // NoOfProducts
        noOfEquote                : Decimal(10,0);   // NoOfEqote
        noOfAttachments           : Decimal(10,0);   // NoOfAttachments
        rfqReminded               : Decimal(10,0);   // RFQReminded
        // References
        parentOpportunityID       : String(35);      // ParentOpportunityID
        earID                     : String(35);      // EARID
        // Admin (read-only in C4C)
        createdByName             : String(255) @readonly;  // CreatedBy
        lastChangedByName         : String(255) @readonly;  // LastChangedByName
        // Computed UI helper (1=overdue/red, 0=neutral)
        virtual criticality       : Integer;

        // ── 1:N compositions to child nodes ──────────────────────────────────
        items         : Composition of many RFQItems          on items.parentObjectID         = ObjectID;
        notes         : Composition of many RFQNotes          on notes.parentObjectID          = ObjectID;
        salesTeam     : Composition of many RFQSalesTeams     on salesTeam.parentObjectID      = ObjectID;
        parties       : Composition of many RFQParties        on parties.parentObjectID        = ObjectID;
        equoteData    : Composition of many RFQEquoteData     on equoteData.parentObjectID     = ObjectID;
        globalEquote  : Composition of many RFQGlobalEquote   on globalEquote.parentObjectID   = ObjectID;
        relatedTxns   : Composition of many RFQRelatedTxns    on relatedTxns.parentObjectID    = ObjectID;
        attachmentList: Composition of many RFQAttachmentList on attachmentList.parentObjectID = ObjectID;
        attachments   : Composition of many RFQAttachments    on attachments.parentObjectID    = ObjectID;
        statusHistory : Composition of many RFQStatusHistory  on statusHistory.parentObjectID  = ObjectID;
  }

  // ── RFQ Line Items (1:N off RFQs) ──────────────────────────────────────────
  // C4C collection: RFQItemCollection  (creatable, updatable, deletable)
  entity RFQItems {
    key ObjectID                  : String(70);
        parentObjectID            : String(70);      // ParentObjectID → RFQs.ObjectID
        itemID                    : String(10);      // ItemID
        mainItemRouting           : Boolean;         // MainItemRouting
        parentOpportunityItemID   : String(10);      // ParentOpportunityItemID
        military                  : Boolean;         // Military
        nato                      : Boolean;         // NATO
        productID                 : String(40);      // ProductID
        itemIDCustom              : String(40);      // ItemIDCustom (customer part number)
        productDescription        : String;          // ProductDescription (unbounded)
        productCategoryDesc       : String(255);     // ProductCategoryDescription
        productCategoryID         : String(20);      // ProductCategoryInternalID
        productSubCatDesc         : String(255);     // ProductSubCategoryDescription
        productSubCatID           : String(20);      // ProductSubCategoryInternalID
        productExternalID         : String(100);     // ProductExternalID
        productHM                 : String(27);      // ProductHM (product family code)
        productMarking            : String(27);      // ProductMarking
        materialHM                : String(10);      // MaterialHM (material family code)
        materialType              : String(99);      // MaterialType
        materialTypeDesc          : String(255);     // MaterialTypeDesc
        matCode                   : String(255);     // Mat_Code
        processHM                 : String(3);       // ProcessHM
        applicationHM             : String(27);      // ApplicationHM
        capabilitiesHM            : String(3);       // CapabilitiesHM
        descHM                    : String(255);     // DescHM
        quantity                  : Decimal(15,6);   // Quantity
        quantityUnit              : String(3);       // unitCode2
        expectedAnnualQty         : Decimal(15,6);   // ExpectedAnnualQuantity
        expectedAnnualUnit        : String(3);       // unitCode3
        sampleQty                 : Decimal(15,6);   // SampleQuantity
        sampleUnit                : String(3);       // unitCode4
        prototypeQty              : Decimal(15,6);   // PrototypeQuantity
        prototypeUnit             : String(3);       // unitCode
        prototypeDate             : Date;            // PrototypeDate
        productionStartDate       : Date;            // ProductionStartDate
        inDiam                    : Decimal(15,6);   // In_Diam (inner diameter)
        outDiam                   : Decimal(15,6);   // Out_Diam (outer diameter)
        length                    : Decimal(15,6);   // Length
        width                     : Decimal(15,6);   // Width
        thickness                 : Decimal(15,6);   // Thickness
        itemDimensionUnit         : String(3);       // ItemDimensionUnit
        shore                     : String(255);     // Shore (hardness)
        productLifetime           : String(255);     // ProductLifetime_
        productLifetimeCode       : String(27);      // ProductLifetimeCode
        prodLifeCycle             : String(27);      // ProdLifeCycle
        prodLifeCycleAddDesc      : String(255);     // ProdLifeCycleAdddesc
        qualCh                    : String(99);      // QualCh (qualification channel)
        quoteTypeHM               : String(2);       // QuoteTypeHM
        rdcQ                      : String(27);      // RDCQ
        reqSupplierLevel          : String(3);       // RequestedSupplierLevel
        toolingRequired           : Boolean;         // ToolingRequired
        toolingDesc               : String(255);     // ToolingDesc
        safetyRelevant            : Boolean;         // SafetyRelevant
        gmpIndicator              : Boolean;         // GMPIndicator
        customerApproval          : Boolean;         // CustomerApproval
        designLocked              : Boolean;         // DesignLocked
        institutionalApproval     : Boolean;         // InstitutionalApproval
        cleanroomNeeded           : Boolean;         // CleanroomNeeded
        cleanroomManufInd         : Boolean;         // CleanroomManufacturingind
        annualRequalification     : Boolean;         // AnnualRequalification
        finalSterilReq            : Boolean;         // FinalSterilizationRequired
        fdaDeviceClass            : String(27);      // FDADeviceClass
        fdaClassification         : String(27);      // FDAClassification
        finishedMedDevQ           : String(27);      // FinishedMedicalDeviceQ
        implemantableDevice       : String(27);      // ImplemantableDevice (C4C typo preserved)
        bioPQ                     : String(27);      // BioPQ
        apiRelatedQ               : String(27);      // APIRelatedQ
        annulaVolumHMQ            : String(2);       // AnnulaVolumHMQ (C4C typo preserved)
        cleanliness               : String(99);      // Cleanliness
        cleanlinessDesc           : String(255);     // CleanlinessDesc
        cleanroomManuf            : String(27);      // CleanroomManufacturing
        cleanroomClass            : String(27);      // CleanroomClassification
        initialSampling           : String(99);      // InitialSampling
        machineComponentsQ        : String(27);      // MachineComponentsQ
        compliance                : String;          // Compliance (unbounded)
        consultationRequired      : String(27);      // ConsultationRequired
        flexcoatDerivate          : String(27);      // FlexcoatDerivate
        positionForMarking        : String(255);     // PositionForMarking
        contentForMarking         : String(255);     // ContentForMarking
        colorForMarking           : String(255);     // ColorForMarking
        packagingReqmt            : String(27);      // PackagingRequirment (C4C typo preserved)
        additionalInfoPkgLbl      : String;          // AdditionalInfoPkgLbl (unbounded)
        additionalInfoSP          : String;          // AdditionalInfoSP (unbounded)
        additionalInfoSurface     : String;          // AdditionalInfoSurface (unbounded)
        addInfoSurface            : String;          // AddInfoSurface (unbounded)
        additinalInfoSampling     : String;          // AdditinalInfoSampling (C4C typo preserved)
        additinalInfoSerialQty    : String;          // AdditinalInfoSerialQuantity (C4C typo preserved)
        itemNote                  : String;          // ItemNote (unbounded)
        leadTime                  : String(255);     // Lead_Time
        coo                       : String(80);      // Coo (country of origin)
        supplierERPID             : String(10);      // SupplierERPID
        zProductBuyerID           : String(60);      // ZProductBuyerID

        // 1:N child forecasts
        forecasts : Composition of many RFQForecasts on forecasts.parentObjectID = ObjectID;
  }

  // ── RFQ Volume Forecasts (1:N off RFQItems) ─────────────────────────────────
  // C4C collection: RFQForecastCollection  (creatable, updatable, deletable)
  entity RFQForecasts {
    key ObjectID        : String(70);
        parentObjectID  : String(70);      // ParentObjectID → RFQItems.ObjectID
        fcastDate       : Integer;         // Fcast_Date (year-month as Int32)
        fcastQuantity   : Decimal(15,6);   // Fcast_Quantity
        fcastUnit       : String(3);       // unitCode
        fcastYear       : String(4);       // Fcast_Yeart (C4C typo preserved)
        itemID          : String(10);      // ItemID (read-only in C4C)
  }

  // ── RFQ Notes / Text (1:N off RFQs) ─────────────────────────────────────────
  // C4C collection: RFQnotesCollection  (creatable, updatable, deletable)
  entity RFQNotes {
    key ObjectID        : String(70);
        parentObjectID  : String(70);      // ParentObjectID → RFQs.ObjectID
        histryNote      : String;          // HistryNote (note body, unbounded)
        noteID          : String(60);      // Noteid
        changedByName   : String(480);     // ChangedByName
        changedOn       : String(14);      // ChangedOn2_real (timestamp string YYYYMMDDHHMMSS)
        createdAt       : DateTime;        // CreationDateTime (read-only)
        lastChangedAt   : DateTime;        // LastChangeDateTime (read-only)
  }

  // ── RFQ Sales Team Members (1:N off RFQs) ───────────────────────────────────
  // C4C collection: RFQSalesTeamCollection  (creatable, updatable, deletable)
  entity RFQSalesTeams {
    key ObjectID          : String(70);
        parentObjectID    : String(70);    // ParentObjectID → RFQs.ObjectID
        roleCode          : String(10);    // RoleCode
        roleCodeText      : String(255) @readonly; // RoleCodeText
        partyID           : String(60);    // PartyID (employee/user ID)
        formattedName     : String(80) @readonly;  // FormattedName (read-only)
        mainIndicator     : Boolean;       // MainIndicator (primary member flag)
        createdOnDate     : Date @readonly; // CreatedOn_date (read-only)
  }

  // ── RFQ Parties (1:N off RFQs) ──────────────────────────────────────────────
  // C4C collection: RFQPartyCollection  (creatable, updatable, deletable)
  entity RFQParties {
    key ObjectID          : String(70);
        parentObjectID    : String(70);    // ParentObjectID → RFQs.ObjectID
        partyTypeCode     : String(15);    // PartyTypeCode
        partyTypeCodeText : String(255) @readonly; // PartyTypeCodeText
        partyID           : String(60);    // PartyID (BP ID)
        roleCategoryCode  : String(3);     // RoleCategoryCode
        roleCategoryText  : String(255) @readonly; // RoleCategoryCodeText
        roleCode          : String(10);    // RoleCode
        roleCodeText      : String(255) @readonly; // RoleCodeText
        mainIndicator     : Boolean;       // MainIndicator
        deleteAllowed     : Boolean;       // DeleteAllowed
        accountName       : String(255) @readonly; // AccountName
        supplierName      : String(255) @readonly; // SupplierName
  }

  // ── RFQ eQuote Data per Item (1:N off RFQs) ─────────────────────────────────
  // C4C collection: RFQEquoteDataCollection  (creatable, updatable, deletable)
  entity RFQEquoteData {
    key ObjectID        : String(70);
        parentObjectID  : String(70);     // ParentObjectID → RFQs.ObjectID
        itemID          : String(10);     // ItemID
        product         : String(40);     // Product (product ID)
        supplierName    : String(255);    // SupplierName
        baseQuantity    : Decimal(15,6);  // BaseQuantity
        baseUnit        : String(3);      // unitCode
        priceUnit       : Decimal(15,6);  // PriceUnit
        priceUnitCode   : String(3);      // unitCode1
        cost            : Decimal(28,6);  // Cost
        currencyCode    : String(3);      // currencyCode
        catalogue       : String(255);    // Catalogue
        supplierLeadTime: Decimal(15,6);  // SupplierLeadTime
        validFromDate   : Date;           // ValidFromDate
        validToDate     : Date;           // ValidToDate
        lastChangedAt   : DateTime @readonly; // LastChangedonDateTime
  }

  // ── RFQ Global eQuote Data (1:N off RFQs) ───────────────────────────────────
  // C4C collection: RFQGloabalEquoteDataCollection  (creatable, updatable, deletable)
  // Note: "Gloabal" is a typo in C4C; kept here as "Global"
  entity RFQGlobalEquote {
    key ObjectID          : String(70);
        parentObjectID    : String(70);   // ParentObjectID → RFQs.ObjectID
        itemID            : String(10);   // ItemID
        productID         : String(255);  // ProductID
        supplierERPID     : String(10);   // SupplierERPID
        supplierQuoteRef  : String(255);  // SupplierQuoteRef
        quantity          : Decimal(15,6); // Quantity
        quantityUnit      : String(3);    // unitCode9
        priceUnit         : Decimal(15,6); // PriceUnit
        priceUnitCode     : String(3);    // unitCode
        leadTimeDays      : Decimal(15,6); // LeadTimeDays
        startDate         : Date;         // StartDate
        endDate           : Date;         // EndDate
        quoteDate         : Date;         // QuoteDate
        minTotVa          : String(255);  // MinTotVa (minimum total value)
        minCalVa          : String(255);  // MinCalVa (minimum calendar value)
        additionalNotes   : String;       // AdditionalNotes (unbounded)
        srID              : String(10);   // SrID (service request ID)
        infoCategory      : Decimal(15,6); // InfoCategory
  }

  // ── RFQ Related Transactions (1:N off RFQs) ──────────────────────────────────
  // C4C collection: RFQListofRelatedTransactionsCollection  (creatable, updatable, deletable)
  entity RFQRelatedTxns {
    key ObjectID                : String(70);
        parentObjectID          : String(70);  // ParentObjectID → RFQs.ObjectID
        parentOpportunityID     : String(35);  // ParentOpportunityID
        opportunityCreationDate : Date;        // OpportunityCreationDate
        parentOpptyInqDate      : Date;        // ParentOpportunityInquiryDate
        quoteID                 : String(35);  // QuoteID
        quoteInquiryDate        : Date;        // QuoteInquiryDate
        quoteSentDate           : Date;        // QuoteSentDate
        rfqConfirmedDate        : Date;        // RfQConfirmedDate
        isMainRelatedOppty      : Boolean;     // isMainRelatedOpportunity
        isMainRelatedQuote      : Boolean;     // isMainRelatedQuote
  }

  // ── RFQ Attachment Metadata List (1:N off RFQs) ──────────────────────────────
  // C4C collection: RFQListofAttachmentsCollection  (creatable, updatable, deletable)
  entity RFQAttachmentList {
    key ObjectID        : String(70);
        parentObjectID  : String(70);   // ParentObjectID → RFQs.ObjectID
        fileName        : String;       // fileName (unbounded)
        fileType        : String(5);    // fileType
        mimeType        : String(255);  // mimeType
  }

  // ── RFQ Attachments – binary upload/download (1:N off RFQs) ─────────────────
  // C4C collection: RFQAttachmentsCollection  (creatable, NOT updatable, deletable)
  // Binary content is not surfaced via CAP; use DocumentLink/LinkWebURI for download.
  entity RFQAttachments {
    key ObjectID          : String(70);
        parentObjectID    : String(70);    // ParentObjectID → RFQs.ObjectID
        rfqRootID         : String(35);    // RFQRootID (RFQ business ID, parent key)
        name              : String;        // Name (file name, unbounded)
        mimeType          : String;        // MimeType (unbounded)
        title             : String;        // Title (unbounded)
        typeCode          : String(5);     // TypeCode
        categoryCode      : String(1);     // CategoryCode
        sizeInkB          : Decimal(15,6); // SizeInkB
        documentLink      : String;        // DocumentLink (download URL, unbounded)
        linkWebURI        : String;        // LinkWebURI (web URL, unbounded)
        outputRelevance   : Boolean;       // OutputRelevanceIndicator
        createdOn         : DateTime @readonly; // CreatedOn
        createdBy         : String(80) @readonly; // CreatedBy
        lastUpdatedOn     : DateTime @readonly; // LastUpdatedOn
        lastUpdatedBy     : String(80) @readonly; // LastUpdatedBy
  }

  // ── RFQ Status Change History (1:N off RFQs) ─────────────────────────────────
  // C4C collection: RFQStatusChangesTrackingCollection  (creatable, updatable, deletable)
  entity RFQStatusHistory {
    key ObjectID            : String(70);
        parentObjectID      : String(70);   // ParentObjectID → RFQs.ObjectID
        newStatus           : String(5);    // newStatus (code)
        newStatusText       : String(255) @readonly; // newStatusText
        newStatusDesc       : String(80);   // newStatusDesc
        oldStatus           : String(5);    // oldStatus (code)
        oldStatusText       : String(255) @readonly; // oldStatusText
        oldStatusDesc       : String(80);   // oldstatusDesc (C4C lowercase typo preserved)
        changedByName       : String(480);  // ChangedByName
        changedOn           : String(14);   // ChangedOn (YYYYMMDDHHMMSS string)
        changedOnUTC        : String(14);   // ChangedOnUTC
        supplierAssignedOld : String(10);   // SupplierAssignedOLD
        supplierAssignedNew : String(10);   // SupplierAssignedNEW
        rfqReceivedManual   : String(14);   // RFQRecievedManual_UTC (C4C typo preserved)
  }

  // ── Reporting / pipeline view (computed in handler, not proxied 1:1) ─────────
  @readonly
  entity RFQStatusSummary {
    key externalStatus : String(30);
        statusDesc     : String(100);
        count          : Integer;
        totalTurnover  : Decimal(15,2);
        currency       : String(3);
  }
}
