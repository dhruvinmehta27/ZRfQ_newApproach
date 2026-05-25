using { cuid, managed } from '@sap/cds/common';

namespace ZRfQ_newApproach.db;

entity RFQs : cuid, managed {
  key ObjectID    : String(100);
  rfqID           : String(50);
  name            : String(255);
  accountName     : String(255);
  supplierName    : String(255);
  ownerName       : String(255);
  rfqDueDate      : Date;
  rfqStatusDesc   : String(120);
  criticality     : Integer;
  marketSeg       : String(120);
  orgName         : String(255);
}
