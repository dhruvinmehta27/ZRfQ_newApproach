using RFQService from '../../srv/service';

// ── RFQs – List Report ────────────────────────────────────────────────────────

annotate RFQService.RFQs with @(

  UI.SelectionFields: [ rfqNumber, statusCode, buyerID, supplierID ],

  UI.LineItem: [
    { $Type: 'UI.DataField', Value: rfqNumber,    Label: '{i18n>rfqNumber}' },
    { $Type: 'UI.DataField', Value: title,         Label: '{i18n>title}' },
    { $Type: 'UI.DataField', Value: buyerID,       Label: '{i18n>buyerID}' },
    { $Type: 'UI.DataField', Value: supplierID,    Label: '{i18n>supplierID}' },
    {
      $Type        : 'UI.DataField',
      Value        : statusCode,
      Label        : '{i18n>status}',
      Criticality  : criticality,
      CriticalityRepresentation: #WithIcon
    },
    { $Type: 'UI.DataField', Value: amount,        Label: '{i18n>amount}' },
    { $Type: 'UI.DataField', Value: currency,      Label: '{i18n>currency}' },
    { $Type: 'UI.DataField', Value: deliveryDate,  Label: '{i18n>deliveryDate}' }
  ],

  // ── Object Page header ──────────────────────────────────────────────────────

  UI.HeaderInfo: {
    TypeName       : '{i18n>rfq}',
    TypeNamePlural : '{i18n>rfqs}',
    Title          : { Value: rfqNumber },
    Description    : { Value: title }
  },

  UI.HeaderFacets: [
    {
      $Type : 'UI.ReferenceFacet',
      Target: '@UI.FieldGroup#StatusBadge'
    }
  ],

  // ── Field groups ────────────────────────────────────────────────────────────

  UI.FieldGroup #StatusBadge: {
    Data: [
      {
        $Type      : 'UI.DataField',
        Value      : status,
        Criticality: criticality
      }
    ]
  },

  UI.FieldGroup #General: {
    Label: '{i18n>general}',
    Data : [
      { $Type: 'UI.DataField', Value: rfqNumber,   Label: '{i18n>rfqNumber}' },
      { $Type: 'UI.DataField', Value: title,        Label: '{i18n>title}' },
      { $Type: 'UI.DataField', Value: description,  Label: '{i18n>description}' },
      { $Type: 'UI.DataField', Value: statusCode,   Label: '{i18n>statusCode}' },
      { $Type: 'UI.DataField', Value: status,       Label: '{i18n>status}' }
    ]
  },

  UI.FieldGroup #Parties: {
    Label: '{i18n>parties}',
    Data : [
      { $Type: 'UI.DataField', Value: buyerID,    Label: '{i18n>buyerID}' },
      { $Type: 'UI.DataField', Value: supplierID, Label: '{i18n>supplierID}' }
    ]
  },

  UI.FieldGroup #Commercial: {
    Label: '{i18n>commercial}',
    Data : [
      { $Type: 'UI.DataField', Value: amount,       Label: '{i18n>amount}' },
      { $Type: 'UI.DataField', Value: currency,     Label: '{i18n>currency}' },
      { $Type: 'UI.DataField', Value: deliveryDate, Label: '{i18n>deliveryDate}' }
    ]
  },

  UI.FieldGroup #Dates: {
    Label: '{i18n>dates}',
    Data : [
      { $Type: 'UI.DataField', Value: createdAt,  Label: '{i18n>createdAt}' },
      { $Type: 'UI.DataField', Value: modifiedAt, Label: '{i18n>modifiedAt}' }
    ]
  },

  // ── Object Page facets ──────────────────────────────────────────────────────

  UI.Facets: [
    {
      $Type : 'UI.ReferenceFacet',
      Label : '{i18n>general}',
      Target: '@UI.FieldGroup#General'
    },
    {
      $Type : 'UI.ReferenceFacet',
      Label : '{i18n>parties}',
      Target: '@UI.FieldGroup#Parties'
    },
    {
      $Type : 'UI.ReferenceFacet',
      Label : '{i18n>commercial}',
      Target: '@UI.FieldGroup#Commercial'
    },
    {
      $Type : 'UI.ReferenceFacet',
      Label : '{i18n>dates}',
      Target: '@UI.FieldGroup#Dates'
    }
  ]
);

// ── RFQStatusSummary – Reporting view ─────────────────────────────────────────

annotate RFQService.RFQStatusSummary with @(

  UI.LineItem: [
    { $Type: 'UI.DataField', Value: status,      Label: '{i18n>status}' },
    { $Type: 'UI.DataField', Value: count,        Label: '{i18n>count}' },
    { $Type: 'UI.DataField', Value: totalAmount,  Label: '{i18n>totalAmount}' },
    { $Type: 'UI.DataField', Value: currency,     Label: '{i18n>currency}' }
  ],

  UI.HeaderInfo: {
    TypeName       : '{i18n>rfqStatusSummary}',
    TypeNamePlural : '{i18n>rfqStatusSummaries}',
    Title          : { Value: status },
    Description    : { Value: statusCode }
  },

  UI.Chart: {
    $Type              : 'UI.ChartDefinitionType',
    ChartType          : #Bar,
    Title              : '{i18n>rfqPipeline}',
    Measures           : [ count ],
    Dimensions         : [ status ],
    MeasureAttributes  : [
      { $Type: 'UI.ChartMeasureAttributeType', Measure: count, Role: #Axis1 }
    ]
  }
);
