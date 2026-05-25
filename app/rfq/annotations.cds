using Rfqservice from '../../srv/service';

annotate Rfqservice.RFQs with @(
  UI.HeaderInfo : {
    TypeName       : 'RFQ',
    TypeNamePlural : 'RFQs',
    Title          : { Value : rfqID },
    Description    : { Value : name }
  },
  UI.HeaderFacets : [
    {
      $Type  : 'UI.ReferenceFacet',
      Label  : 'Status',
      Target : '@UI.DataPoint#Status'
    },
    {
      $Type  : 'UI.ReferenceFacet',
      Label  : 'Due Date',
      Target : '@UI.DataPoint#DueDate'
    },
    {
      $Type  : 'UI.ReferenceFacet',
      Label  : 'Account',
      Target : '@UI.DataPoint#Account'
    },
    {
      $Type  : 'UI.ReferenceFacet',
      Label  : 'Owner',
      Target : '@UI.DataPoint#Owner'
    }
  ],
  UI.Facets : [
    {
      $Type  : 'UI.ReferenceFacet',
      Label  : 'RFQ Details',
      Target : '@UI.FieldGroup#RFQDetails'
    },
    {
      $Type  : 'UI.ReferenceFacet',
      Label  : 'Line Items',
      Target : '@UI.FieldGroup#LineItemsPlaceholder'
    }
  ],
  UI.FieldGroup #RFQDetails : {
    Data : [
      { Value : ObjectID },
      { Value : rfqID },
      { Value : name },
      { Value : accountName },
      { Value : supplierName },
      { Value : ownerName },
      { Value : rfqDueDate },
      { Value : rfqStatusDesc },
      { Value : criticality },
      { Value : marketSeg },
      { Value : orgName }
    ]
  },
  UI.FieldGroup #LineItemsPlaceholder : {
    Data : [
      { Value : name, Label : 'Line items integration placeholder' }
    ]
  },
  UI.DataPoint #Status  : { Value : rfqStatusDesc },
  UI.DataPoint #DueDate : { Value : rfqDueDate },
  UI.DataPoint #Account : { Value : accountName },
  UI.DataPoint #Owner   : { Value : ownerName },
  UI.LineItem : [
    { Value : rfqID },
    { Value : name },
    { Value : accountName },
    { Value : supplierName },
    { Value : ownerName },
    { Value : rfqDueDate },
    { Value : rfqStatusDesc },
    { Value : criticality },
    { Value : marketSeg },
    { Value : orgName }
  ],
  UI.SelectionFields : [
    rfqID,
    name,
    accountName,
    ownerName,
    rfqStatusDesc,
    marketSeg,
    orgName
  ]
);
