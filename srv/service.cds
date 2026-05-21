using { ZRfQ_newApproach.db as db } from '../db/schema';
service Rfqservice {

    entity RFQs as projection on db.RFQs {
        ID,
        RfQID,
        Description
    }

}