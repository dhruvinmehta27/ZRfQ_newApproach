/**
 * RFQ Service – OData V4 façade over SAP C4C /cust/v1/zrfq
 *
 * All handlers live in srv/service.js and proxy to C4C via the
 * BTP Destination Service (destination: C4C_QUA_HARDCODED).
 * CSRF tokens are fetched with GET (C4C returns 500 on HEAD).
 */

@path: '/rfq'
service RFQService {

  // ── Main CRUD entity ────────────────────────────────────────────────────────
  @Capabilities.Insertable : true
  @Capabilities.Updatable  : true
  @Capabilities.Deletable  : true
  entity RFQs {
    key ID           : String(70);      // C4C ObjectID
        rfqNumber    : String(35);      // ExternalID
        title        : String(500);     // Subject
        description  : String(1000);    // Note
        buyerID      : String(60);      // BuyerPartyID
        supplierID   : String(60);      // SupplierPartyID
        statusCode   : String(2);       // LifeCycleStatusCode
        status       : String(40);      // LifeCycleStatusCodeText
        deliveryDate : Date;            // RequestedDeliveryDate
        amount       : Decimal(15,2);   // TotalAmount
        currency     : String(3);       // CurrencyCode
        createdAt    : Timestamp @readonly;
        modifiedAt   : Timestamp @readonly;
        // Computed UI criticality: 3=success 2=warning 1=error 0=neutral
        virtual criticality : Integer;
  }

  // ── Reporting / pipeline view ───────────────────────────────────────────────
  @readonly
  entity RFQStatusSummary {
    key statusCode  : String(2);
        status      : String(40);
        count       : Integer;
        totalAmount : Decimal(15,2);
        currency    : String(3);
  }
}
