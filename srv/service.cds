using { ZRfQ_newApproach.db as db } from '../db/schema';

service Rfqservice {
  @odata.draft.enabled
  @Capabilities.InsertRestrictions.Insertable : true
  @Capabilities.UpdateRestrictions.Updatable  : true
  @Capabilities.DeleteRestrictions.Deletable  : true
  entity RFQs as projection on db.RFQs;
}
