/**
 * RFQ Service – OData V4 façade over SAP C4C /cust/v1/zrfq
 * Field names match the SDK bo definition exactly.
 * Handlers in srv/service.js proxy to C4C via BTP Destination Service.
 */

@path: '/rfq'
service RFQService {

  // ── Main CRUD entity ────────────────────────────────────────────────────────
  entity RFQs {
    key ObjectID                  : String(70);      // C4C system key
        rfqID                     : String(35);      // ID – RFQ business number
        name                      : String(255);     // Name
        rfqType                   : String(30);      // RFQType
        // Status
        rfqStatus                 : String(30);      // RFQStatus (user status code)
        rfqStatusDesc             : String(100);     // RFQStatus_Desc
        externalStatus            : String(30);      // ExternalUserStatusCode
        systemStatus              : String(30);      // SystemStatus
        // Parties
        account                   : String(60);      // Account (BP ID)
        accountName               : String(255);     // AccountName
        supplier                  : String(60);      // Supplier (BP ID)
        supplierName              : String(255);     // SupplierName
        owner                     : String(60);      // Owner (BP ID)
        ownerName                 : String(255);     // OwnerName
        requestor                 : String(60);      // Requestor (BP ID)
        requestorName             : String(255);     // RequestorName
        categoryPurchaser         : String(60);      // CategoryPurchaser
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
        // Admin (readonly)
        createdByName             : String(255) @readonly; // CreatedBy
        lastChangedByName         : String(255) @readonly; // LastChangedByName
        // Computed UI criticality: 1=overdue(red) 0=neutral
        virtual criticality       : Integer;
  }

  // ── Reporting / pipeline view ───────────────────────────────────────────────
  @readonly
  entity RFQStatusSummary {
    key externalStatus  : String(30);
        statusDesc      : String(100);
        count           : Integer;
        totalTurnover   : Decimal(15,2);
        currency        : String(3);
  }
}
