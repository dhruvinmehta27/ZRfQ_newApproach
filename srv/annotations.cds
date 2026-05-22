using Rfqservice from './service';

// ─── Field labels ────────────────────────────────────────────────────────────

annotate Rfqservice.RFQs with {
    RfQID       @title: 'RFQ ID';
    Description @title: 'Description';
    Status      @title: 'Status'     @Common.ValueListWithFixedValues: true;
    ValidFrom   @title: 'Valid From';
    ValidTo     @title: 'Valid To';
}

annotate Rfqservice.RFQItems with {
    ItemNumber  @title: 'Item No.';
    Material    @title: 'Material';
    Description @title: 'Description';
    Quantity    @title: 'Quantity';
    Unit        @title: 'Unit';
    TargetPrice @title: 'Target Price'  @Measures.ISOCurrency: Currency;
    Currency    @title: 'Currency';
}

annotate Rfqservice.Vendors with {
    VendorID      @title: 'Vendor ID';
    Name          @title: 'Vendor Name';
    Email         @title: 'Email';
    ContactPerson @title: 'Contact Person';
}

annotate Rfqservice.RFQVendors with {
    Vendor @title: 'Vendor';
}

// ─── RFQs – List Report ───────────────────────────────────────────────────────

annotate Rfqservice.RFQs with @(
    UI.SelectionFields: [ RfQID, Status, ValidFrom, ValidTo ],
    UI.LineItem: [
        { $Type: 'UI.DataField', Value: RfQID       },
        { $Type: 'UI.DataField', Value: Description  },
        { $Type: 'UI.DataField', Value: Status       },
        { $Type: 'UI.DataField', Value: ValidFrom    },
        { $Type: 'UI.DataField', Value: ValidTo      },
        { $Type: 'UI.DataField', Value: createdAt    }
    ]
);

// ─── RFQs – Object Page ───────────────────────────────────────────────────────

annotate Rfqservice.RFQs with @(
    UI.HeaderInfo: {
        TypeName      : 'Request for Quotation',
        TypeNamePlural: 'Requests for Quotation',
        Title      : { $Type: 'UI.DataField', Value: Description },
        Description: { $Type: 'UI.DataField', Value: RfQID }
    },
    UI.FieldGroup#GeneralInfo: {
        Label: 'General Information',
        Data : [
            { $Type: 'UI.DataField', Value: RfQID       },
            { $Type: 'UI.DataField', Value: Description  },
            { $Type: 'UI.DataField', Value: Status       },
            { $Type: 'UI.DataField', Value: ValidFrom    },
            { $Type: 'UI.DataField', Value: ValidTo      }
        ]
    },
    UI.Facets: [
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'GeneralInfo',
            Label : 'General Information',
            Target: '@UI.FieldGroup#GeneralInfo'
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'Items',
            Label : 'Items',
            Target: 'Items/@UI.LineItem'
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'Vendors',
            Label : 'Assigned Vendors',
            Target: 'RFQVendors/@UI.LineItem'
        }
    ]
);

// ─── RFQItems – table inside Object Page ─────────────────────────────────────

annotate Rfqservice.RFQItems with @(
    UI.LineItem: [
        { $Type: 'UI.DataField', Value: ItemNumber   },
        { $Type: 'UI.DataField', Value: Material     },
        { $Type: 'UI.DataField', Value: Description  },
        { $Type: 'UI.DataField', Value: Quantity     },
        { $Type: 'UI.DataField', Value: Unit         },
        { $Type: 'UI.DataField', Value: TargetPrice  },
        { $Type: 'UI.DataField', Value: Currency     }
    ],
    UI.FieldGroup#ItemDetails: {
        Label: 'Item Details',
        Data: [
            { $Type: 'UI.DataField', Value: ItemNumber   },
            { $Type: 'UI.DataField', Value: Material     },
            { $Type: 'UI.DataField', Value: Description  },
            { $Type: 'UI.DataField', Value: Quantity     },
            { $Type: 'UI.DataField', Value: Unit         },
            { $Type: 'UI.DataField', Value: TargetPrice  },
            { $Type: 'UI.DataField', Value: Currency     }
        ]
    },
    UI.Facets: [
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'ItemDetails',
            Label : 'Item Details',
            Target: '@UI.FieldGroup#ItemDetails'
        }
    ]
);

// ─── RFQVendors – table inside Object Page ────────────────────────────────────

annotate Rfqservice.RFQVendors with @(
    UI.LineItem: [
        { $Type: 'UI.DataField', Value: Vendor.VendorID,       Label: 'Vendor ID'       },
        { $Type: 'UI.DataField', Value: Vendor.Name,           Label: 'Vendor Name'     },
        { $Type: 'UI.DataField', Value: Vendor.Email,          Label: 'Email'           },
        { $Type: 'UI.DataField', Value: Vendor.ContactPerson,  Label: 'Contact Person'  }
    ]
);

// ─── Vendor value help on RFQVendors ─────────────────────────────────────────

annotate Rfqservice.RFQVendors:Vendor @(
    Common.ValueList: {
        CollectionPath: 'Vendors',
        Parameters: [
            { $Type: 'Common.ValueListParameterOut',         LocalDataProperty: Vendor_ID,  ValueListProperty: 'ID'       },
            { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'VendorID'  },
            { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'Name'      }
        ]
    }
);
