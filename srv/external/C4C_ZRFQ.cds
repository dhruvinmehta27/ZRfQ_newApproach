/**
 * External service reference for SAP C4C custom bo RFQ.
 * Endpoint  : /sap/c4c/odata/cust/v1/zrfq
 * Collection: RFQRootCollection
 * Field names match the SDK bo element names exactly.
 */

@cds.external : true
@protocol     : 'odata-v2'
service C4C_ZRFQ {

  entity RFQRootCollection {
    key ObjectID                        : String(70);
        ID                              : String(35);
        Name                            : String(255);
        RFQType                         : String(30);
        RFQStatus                       : String(30);
        RFQStatus_Desc                  : String(100);
        ExternalUserStatusCode          : String(30);
        SystemStatus                    : String(30);
        Account                         : String(60);
        AccountName                     : String(255);
        Supplier                        : String(60);
        SupplierName                    : String(255);
        Owner                           : String(60);
        OwnerName                       : String(255);
        Requestor                       : String(60);
        RequestorName                   : String(255);
        CategoryPurchaser               : String(60);
        CategoryPurchaserName           : String(255);
        CategoryPurchaserEmail          : String(255);
        RFQDueDate                      : Date;
        RFQInquiryDate                  : Date;
        CustomerInquiryDate             : Date;
        SOP                             : Date;
        RFQConfirmedOn_ClosedDate       : Date;
        RFQReminded_Date                : Date;
        CreatedOn_date                  : Date;
        ChangedOn_date                  : Date;
        EstimatedPeakTurnOver           : Decimal(15,2);
        EstimatedPeakTurnOverCurrencyCode : String(3);
        SupplierLeadTime                : Decimal(10,2);
        BusSeg                          : String(30);
        MarketSeg                       : String(30);
        AppCode                         : String(30);
        Platform                        : String(255);
        ItemCategory                    : String(30);
        Evaluation                      : String(30);
        OrgName                         : String(100);
        OrgID                           : String(60);
        TerrName                        : String(100);
        TerrID                          : String(60);
        RfQOverDue                      : Boolean;
        RfQRemainingDueDays             : Decimal(10,2);
        Confidential                    : Boolean;
        GMPIndicator                    : Boolean;
        NPDRFQ                          : Boolean;
        RDC_Indicator                   : Boolean;
        IS_Indicator                    : Boolean;
        FRSFlag                         : Boolean;
        IndustrialRouting               : Boolean;
        RFQReopened                     : Boolean;
        FromOpportunity                 : Boolean;
        FromQuote                       : Boolean;
        NoOfProducts                    : Decimal(10,0);
        NoOfEqote                       : Decimal(10,0);
        NoOfAttachments                 : Decimal(10,0);
        RFQReminded                     : Decimal(10,0);
        ParentOpportunityID             : String(35);
        EARID                           : String(35);
        CreatedBy                       : String(255);
        LastChangedByName               : String(255);
  }
}
