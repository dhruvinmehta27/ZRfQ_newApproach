using { cuid,managed } from '@sap/cds/common';
namespace ZRfQ_newApproach.db;
entity RFQs : cuid,managed{
    key ID          : UUID;
        RfQID       : Integer;
        Description : String(255);
}
