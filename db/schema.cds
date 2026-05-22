namespace ZRfQ_newApproach.db;
using { cuid, managed } from '@sap/cds/common';

type RFQStatus : String(20) enum {
    Draft    = 'Draft';
    Sent     = 'Sent';
    Received = 'Received';
    Closed   = 'Closed';
}

entity RFQs : cuid, managed {
    RfQID      : Integer;
    Description: String(255);
    Status     : RFQStatus default 'Draft';
    ValidFrom  : Date;
    ValidTo    : Date;
    Items      : Composition of many RFQItems  on Items.RFQ      = $self;
    RFQVendors : Composition of many RFQVendors on RFQVendors.RFQ = $self;
}

entity RFQItems : cuid, managed {
    RFQ        : Association to RFQs;
    ItemNumber : Integer;
    Material   : String(100);
    Description: String(255);
    Quantity   : Decimal(13,3);
    Unit       : String(10);
    TargetPrice: Decimal(15,2);
    Currency   : String(5) default 'USD';
}

entity Vendors : cuid, managed {
    VendorID     : String(20);
    Name         : String(100);
    Email        : String(100);
    ContactPerson: String(100);
}

entity RFQVendors : cuid {
    RFQ   : Association to RFQs;
    Vendor: Association to Vendors;
}
