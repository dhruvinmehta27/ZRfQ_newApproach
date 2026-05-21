/**
 * External service definition for SAP C4C custom RFQ object.
 * Endpoint : <C4C_BASE_URL>/cust/v1/zrfq
 * Collection: RFQRootCollection
 *
 * Adjust field names to match your actual C4C custom object fields
 * (check via $metadata at <dest>/cust/v1/zrfq/$metadata).
 */

@cds.external : true
@protocol     : 'odata-v2'
service C4C_ZRFQ {

  entity RFQRootCollection {
    key ObjectID                  : String(70);
        ExternalID                : String(35);
        Subject                   : String(500);
        Note                      : String(1000);
        BuyerPartyID              : String(60);
        SupplierPartyID           : String(60);
        LifeCycleStatusCode       : String(2);
        LifeCycleStatusCodeText   : String(40);
        RequestedDeliveryDate     : Date;
        TotalAmount               : Decimal(15,2);
        CurrencyCode              : String(3);
        CreatedOn                 : DateTime;
        LastUpdatedOn             : DateTime;
  }
}
