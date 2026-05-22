/**
 * External service reference for SAP C4C custom RFQ business object.
 *
 * Endpoint   : /sap/c4c/odata/cust/v1/zrfq
 * Protocol   : OData V2
 *
 * Property names match the C4C $metadata exactly (including typos).
 * Only fields actually used in the CAP service mapping are listed.
 */

@cds.external : true
@protocol     : 'odata-v2'
service C4C_ZRFQ {

  // ── Root entity ─────────────────────────────────────────────────────────────
  // Collection: RFQRootCollection  (creatable, updatable, deletable)
  entity RFQRootCollection {
    key ObjectID                          : String(70);
        ID                                : String(35);
        Name                              : String(255);
        RFQType                           : String(30);
        RFQStatus                         : String(30);
        RFQStatus_Desc                    : String(100);
        ExternalUserStatusCode            : String(30);
        SystemStatus                      : String(30);
        Account                           : String(10);
        AccountName                       : String(255);
        SupplierID                        : String(60);   // ← BP ID (not 'Supplier')
        SupplierName                      : String(255);
        Owner                             : String(10);
        OwnerName                         : String(255);
        Requestor                         : String(60);
        RequestorName                     : String(255);
        CategoryPurchaserID               : String(60);   // ← BP ID (not 'CategoryPurchaser')
        CategoryPurchaserName             : String(255);
        CategoryPurchaserEmail            : String(255);
        RFQDueDate                        : Date;
        RFQInquiryDate                    : Date;
        CustomerInquiryDate               : Date;
        SOP                               : Date;
        RFQConfirmedOn_ClosedDate         : Date;
        RFQReminded_Date                  : Date;
        CreatedOn_date                    : Date;
        ChangedOn_date                    : Date;
        EstimatedPeakTurnOver             : Decimal(15,2);
        EstimatedPeakTurnOverCurrencyCode : String(3);
        SupplierLeadTime                  : Decimal(10,2);
        BusSeg                            : String(30);
        MarketSeg                         : String(30);
        AppCode                           : String(30);
        Platform                          : String(255);
        ItemCategory                      : String(30);
        Evaluation                        : String(30);
        OrgName                           : String(100);
        OrgID                             : String(60);
        TerrName                          : String(100);
        TerrID                            : String(60);
        RfQOverDue                        : Boolean;
        RfQRemainingDueDays               : Decimal(10,2);
        Confidential                      : Boolean;
        GMPIndicator                      : Boolean;
        NPDRFQ                            : Boolean;
        RDC_Indicator                     : Boolean;
        IS_Indicator                      : Boolean;
        FRSFlag                           : Boolean;
        IndustrialRouting                 : Boolean;
        RFQReopened                       : Boolean;
        FromOpportunity                   : Boolean;
        FromQuote                         : Boolean;
        NoOfProducts                      : Decimal(10,0);
        NoOfEqote                         : Decimal(10,0);
        NoOfAttachments                   : Decimal(10,0);
        RFQReminded                       : Decimal(10,0);
        ParentOpportunityID               : String(35);
        EARID                             : String(35);
        CreatedBy                         : String(255);
        LastChangedByName                 : String(255);
  }

  // ── Line Items ──────────────────────────────────────────────────────────────
  // Collection: RFQItemCollection  (creatable, updatable, deletable)
  entity RFQItemCollection {
    key ObjectID                : String(70);
        ParentObjectID          : String(70);
        ItemID                  : String(10);
        MainItemRouting         : Boolean;
        ParentOpportunityItemID : String(10);
        Military                : Boolean;
        NATO                    : Boolean;
        ProductID               : String(40);
        ItemIDCustom            : String(40);
        ProductDescription      : String;
        ProductCategoryDescription    : String(255);
        ProductCategoryInternalID     : String(20);
        ProductSubCategoryDescription : String(255);
        ProductSubCategoryInternalID  : String(20);
        ProductExternalID       : String(100);
        ProductHM               : String(27);
        ProductMarking          : String(27);
        MaterialHM              : String(10);
        MaterialType            : String(99);
        MaterialTypeDesc        : String(255);
        Mat_Code                : String(255);
        ProcessHM               : String(3);
        ApplicationHM           : String(27);
        CapabilitiesHM          : String(3);
        DescHM                  : String(255);
        Quantity                : Decimal(15,6);
        unitCode2               : String(3);
        ExpectedAnnualQuantity  : Decimal(15,6);
        unitCode3               : String(3);
        SampleQuantity          : Decimal(15,6);
        unitCode4               : String(3);
        PrototypeQuantity       : Decimal(15,6);
        unitCode                : String(3);
        PrototypeDate           : Date;
        ProductionStartDate     : Date;
        In_Diam                 : Decimal(15,6);
        Out_Diam                : Decimal(15,6);
        Length                  : Decimal(15,6);
        Width                   : Decimal(15,6);
        Thickness               : Decimal(15,6);
        ItemDimensionUnit       : String(3);
        Shore                   : String(255);
        ProductLifetime_        : String(255);
        ProductLifetimeCode     : String(27);
        ProdLifeCycle           : String(27);
        ProdLifeCycleAdddesc    : String(255);
        QualCh                  : String(99);
        QuoteTypeHM             : String(2);
        RDCQ                    : String(27);
        RequestedSupplierLevel  : String(3);
        ToolingRequired         : Boolean;
        ToolingDesc             : String(255);
        SafetyRelevant          : Boolean;
        GMPIndicator            : Boolean;
        CustomerApproval        : Boolean;
        DesignLocked            : Boolean;
        InstitutionalApproval   : Boolean;
        CleanroomNeeded         : Boolean;
        CleanroomManufacturingind : Boolean;
        AnnualRequalification   : Boolean;
        FinalSterilizationRequired : Boolean;
        FDADeviceClass          : String(27);
        FDAClassification       : String(27);
        FinishedMedicalDeviceQ  : String(27);
        ImplemantableDevice     : String(27);
        BioPQ                   : String(27);
        APIRelatedQ             : String(27);
        AnnulaVolumHMQ          : String(2);
        Cleanliness             : String(99);
        CleanlinessDesc         : String(255);
        CleanroomManufacturing  : String(27);
        CleanroomClassification : String(27);
        InitialSampling         : String(99);
        MachineComponentsQ      : String(27);
        Compliance              : String;
        ConsultationRequired    : String(27);
        FlexcoatDerivate        : String(27);
        PositionForMarking      : String(255);
        ContentForMarking       : String(255);
        ColorForMarking         : String(255);
        PackagingRequirment     : String(27);
        AdditionalInfoPkgLbl    : String;
        AdditionalInfoSP        : String;
        AdditionalInfoSurface   : String;
        AddInfoSurface          : String;
        AdditinalInfoSampling   : String;
        AdditinalInfoSerialQuantity : String;
        ItemNote                : String;
        Lead_Time               : String(255);
        Coo                     : String(80);
        SupplierERPID           : String(10);
        ZProductBuyerID         : String(60);
  }

  // ── Volume Forecasts (child of RFQItem) ─────────────────────────────────────
  // Collection: RFQForecastCollection  (creatable, updatable, deletable)
  entity RFQForecastCollection {
    key ObjectID        : String(70);
        ParentObjectID  : String(70);
        Fcast_Date      : Integer;
        Fcast_Quantity  : Decimal(15,6);
        unitCode        : String(3);
        Fcast_Yeart     : String(4);   // C4C typo preserved
        ItemID          : String(10);
  }

  // ── Notes ───────────────────────────────────────────────────────────────────
  // Collection: RFQnotesCollection  (creatable, updatable, deletable)
  entity RFQnotesCollection {
    key ObjectID            : String(70);
        ParentObjectID      : String(70);
        HistryNote          : String;
        Noteid              : String(60);
        ChangedByName       : String(480);
        ChangedOn2_real     : String(14);
        CreationDateTime    : DateTime;
        LastChangeDateTime  : DateTime;
  }

  // ── Sales Team Members ──────────────────────────────────────────────────────
  // Collection: RFQSalesTeamCollection  (creatable, updatable, deletable)
  entity RFQSalesTeamCollection {
    key ObjectID        : String(70);
        ParentObjectID  : String(70);
        RoleCode        : String(10);
        RoleCodeText    : String(255);
        PartyID         : String(60);
        FormattedName   : String(80);
        MainIndicator   : Boolean;
        CreatedOn_date  : Date;
  }

  // ── Parties ─────────────────────────────────────────────────────────────────
  // Collection: RFQPartyCollection  (creatable, updatable, deletable)
  entity RFQPartyCollection {
    key ObjectID              : String(70);
        ParentObjectID        : String(70);
        PartyTypeCode         : String(15);
        PartyTypeCodeText     : String(255);
        PartyID               : String(60);
        RoleCategoryCode      : String(3);
        RoleCategoryCodeText  : String(255);
        RoleCode              : String(10);
        RoleCodeText          : String(255);
        MainIndicator         : Boolean;
        DeleteAllowed         : Boolean;
        AccountName           : String(255);
        SupplierName          : String(255);
  }

  // ── eQuote Data per Item ─────────────────────────────────────────────────────
  // Collection: RFQEquoteDataCollection  (creatable, updatable, deletable)
  entity RFQEquoteDataCollection {
    key ObjectID                : String(70);
        ParentObjectID          : String(70);
        ItemID                  : String(10);
        Product                 : String(40);
        SupplierName            : String(255);
        BaseQuantity            : Decimal(15,6);
        unitCode                : String(3);
        PriceUnit               : Decimal(15,6);
        unitCode1               : String(3);
        Cost                    : Decimal(28,6);
        currencyCode            : String(3);
        Catalogue               : String(255);
        SupplierLeadTime        : Decimal(15,6);
        ValidFromDate           : Date;
        ValidToDate             : Date;
        LastChangedonDateTime   : DateTime;
  }

  // ── Global eQuote Data ───────────────────────────────────────────────────────
  // Collection: RFQGloabalEquoteDataCollection  (creatable, updatable, deletable)
  // Note: "Gloabal" is a typo in the C4C SDK; preserved here verbatim.
  entity RFQGloabalEquoteDataCollection {
    key ObjectID        : String(70);
        ParentObjectID  : String(70);
        ItemID          : String(10);
        ProductID       : String(255);
        SupplierERPID   : String(10);
        SupplierQuoteRef: String(255);
        Quantity        : Decimal(15,6);
        unitCode9       : String(3);
        PriceUnit       : Decimal(15,6);
        unitCode        : String(3);
        LeadTimeDays    : Decimal(15,6);
        StartDate       : Date;
        EndDate         : Date;
        QuoteDate       : Date;
        MinTotVa        : String(255);
        MinCalVa        : String(255);
        AdditionalNotes : String;
        SrID            : String(10);
        InfoCategory    : Decimal(15,6);
  }

  // ── Related Transactions ─────────────────────────────────────────────────────
  // Collection: RFQListofRelatedTransactionsCollection  (creatable, updatable, deletable)
  entity RFQListofRelatedTransactionsCollection {
    key ObjectID                    : String(70);
        ParentObjectID              : String(70);
        ParentOpportunityID         : String(35);
        OpportunityCreationDate     : Date;
        ParentOpportunityInquiryDate: Date;
        QuoteID                     : String(35);
        QuoteInquiryDate            : Date;
        QuoteSentDate               : Date;
        RfQConfirmedDate            : Date;
        isMainRelatedOpportunity    : Boolean;
        isMainRelatedQuote          : Boolean;
  }

  // ── Attachment Metadata List ─────────────────────────────────────────────────
  // Collection: RFQListofAttachmentsCollection  (creatable, updatable, deletable)
  entity RFQListofAttachmentsCollection {
    key ObjectID        : String(70);
        ParentObjectID  : String(70);
        fileName        : String;
        fileType        : String(5);
        mimeType        : String(255);
  }

  // ── Binary Attachments ───────────────────────────────────────────────────────
  // Collection: RFQAttachmentsCollection  (creatable, NOT updatable, deletable)
  // Binary field excluded; use DocumentLink / LinkWebURI for downloads.
  entity RFQAttachmentsCollection {
    key ObjectID                : String(70);
        ParentObjectID          : String(70);
        RFQRootID               : String(35);
        Name                    : String;
        MimeType                : String;
        Title                   : String;
        TypeCode                : String(5);
        CategoryCode            : String(1);
        SizeInkB                : Decimal(15,6);
        DocumentLink            : String;
        LinkWebURI              : String;
        OutputRelevanceIndicator: Boolean;
        CreatedOn               : DateTime;
        CreatedBy               : String(80);
        LastUpdatedOn           : DateTime;
        LastUpdatedBy           : String(80);
  }

  // ── Status Change Tracking ───────────────────────────────────────────────────
  // Collection: RFQStatusChangesTrackingCollection  (creatable, updatable, deletable)
  entity RFQStatusChangesTrackingCollection {
    key ObjectID            : String(70);
        ParentObjectID      : String(70);
        newStatus           : String(5);
        newStatusText       : String(255);
        newStatusDesc       : String(80);
        oldStatus           : String(5);
        oldStatusText       : String(255);
        oldstatusDesc       : String(80);   // C4C lowercase typo preserved
        ChangedByName       : String(480);
        ChangedOn           : String(14);
        ChangedOnUTC        : String(14);
        SupplierAssignedOLD : String(10);
        SupplierAssignedNEW : String(10);
        RFQRecievedManual_UTC : String(14); // C4C typo preserved
  }
}
