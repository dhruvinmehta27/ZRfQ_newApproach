using { ZRfQ_newApproach.db as db } from '../db/schema';

service Rfqservice {

    @odata.draft.enabled
    entity RFQs as projection on db.RFQs;

    entity RFQItems  as projection on db.RFQItems;
    entity Vendors   as projection on db.Vendors;
    entity RFQVendors as projection on db.RFQVendors;
}
