'use strict';

// Sample data returned when C4C_BASE_URL is not configured (local dev / UI testing).

const RFQS = [
  {
    ObjectID: 'MOCK-RFQ-001',
    rfqID: 'RFQ-2026-001',
    name: 'Office Equipment Procurement',
    rfqType: 'STANDARD',
    rfqStatus: '1',
    rfqStatusDesc: 'Open',
    externalStatus: 'OPEN',
    systemStatus: 'OPEN',
    accountName: 'ACME Corporation',
    account: 'BP001',
    supplierName: 'TechSupply Ltd',
    supplier: 'SUP001',
    ownerName: 'John Smith',
    owner: 'EMP001',
    requestorName: 'Jane Doe',
    categoryPurchaserName: 'Bob Lee',
    categoryPurchaserEmail: 'bob.lee@example.com',
    rfqDueDate: '2026-07-31',
    rfqInquiryDate: '2026-05-01',
    sop: '2026-08-01',
    estimatedTurnover: 50000,
    estimatedTurnoverCurrency: 'USD',
    supplierLeadTime: 4,
    marketSeg: 'IT',
    busSeg: 'CORPORATE',
    orgName: 'Procurement Org',
    orgID: 'ORG001',
    rfqOverDue: false,
    rfqRemainingDays: 70,
    noOfProducts: 2,
    criticality: 0,
    createdOnDate: '2026-05-01',
    changedOnDate: '2026-05-10',
    createdByName: 'System',
    lastChangedByName: 'John Smith'
  },
  {
    ObjectID: 'MOCK-RFQ-002',
    rfqID: 'RFQ-2026-002',
    name: 'Raw Materials Q3',
    rfqType: 'STANDARD',
    rfqStatus: '3',
    rfqStatusDesc: 'Overdue',
    externalStatus: 'OVERDUE',
    systemStatus: 'OPEN',
    accountName: 'Global Manufacturing Corp',
    account: 'BP002',
    supplierName: 'Materials Direct Inc',
    supplier: 'SUP002',
    ownerName: 'Sarah Connor',
    owner: 'EMP002',
    rfqDueDate: '2026-04-15',
    rfqInquiryDate: '2026-03-01',
    estimatedTurnover: 120000,
    estimatedTurnoverCurrency: 'USD',
    supplierLeadTime: 6,
    marketSeg: 'MFG',
    busSeg: 'INDUSTRIAL',
    orgName: 'Supply Chain Org',
    orgID: 'ORG002',
    rfqOverDue: true,
    rfqRemainingDays: -37,
    noOfProducts: 3,
    criticality: 1,
    createdOnDate: '2026-03-01',
    changedOnDate: '2026-04-20',
    createdByName: 'System',
    lastChangedByName: 'Sarah Connor'
  },
  {
    ObjectID: 'MOCK-RFQ-003',
    rfqID: 'RFQ-2026-003',
    name: 'Logistics Services H2',
    rfqType: 'SERVICE',
    rfqStatus: '2',
    rfqStatusDesc: 'Sent to Supplier',
    externalStatus: 'SENT',
    systemStatus: 'IN_PROCESS',
    accountName: 'FastMove Logistics',
    account: 'BP003',
    supplierName: 'Express Freight Co',
    supplier: 'SUP003',
    ownerName: 'Mark Weber',
    owner: 'EMP003',
    rfqDueDate: '2026-06-15',
    rfqInquiryDate: '2026-05-10',
    estimatedTurnover: 30000,
    estimatedTurnoverCurrency: 'EUR',
    marketSeg: 'LOG',
    busSeg: 'SERVICES',
    orgName: 'Logistics Org',
    orgID: 'ORG003',
    rfqOverDue: false,
    rfqRemainingDays: 24,
    noOfProducts: 1,
    criticality: 0,
    createdOnDate: '2026-05-10',
    changedOnDate: '2026-05-12',
    createdByName: 'System',
    lastChangedByName: 'Mark Weber'
  }
];

const ITEMS = [
  {
    ObjectID: 'MOCK-ITEM-001',
    parentObjectID: 'MOCK-RFQ-001',
    itemID: '10',
    productID: 'LAPTOP-PRO-15',
    productDescription: 'Business Laptop 15-inch, 16GB RAM, 512GB SSD',
    itemIDCustom: 'CUST-LAP-001',
    quantity: 30,
    quantityUnit: 'EA',
    expectedAnnualQty: 30,
    expectedAnnualUnit: 'EA',
    productCategoryDesc: 'Computing Devices',
    materialType: 'Electronics',
    safetyRelevant: false,
    toolingRequired: false
  },
  {
    ObjectID: 'MOCK-ITEM-002',
    parentObjectID: 'MOCK-RFQ-001',
    itemID: '20',
    productID: 'MONITOR-4K-27',
    productDescription: '27-inch 4K UHD Monitor, USB-C',
    itemIDCustom: 'CUST-MON-002',
    quantity: 30,
    quantityUnit: 'EA',
    expectedAnnualQty: 30,
    expectedAnnualUnit: 'EA',
    productCategoryDesc: 'Displays',
    materialType: 'Electronics',
    safetyRelevant: false,
    toolingRequired: false
  },
  {
    ObjectID: 'MOCK-ITEM-003',
    parentObjectID: 'MOCK-RFQ-002',
    itemID: '10',
    productID: 'STEEL-SHEET-2MM',
    productDescription: 'Steel Sheet 2mm, 1000x2000mm',
    itemIDCustom: 'RAW-STL-001',
    quantity: 500,
    quantityUnit: 'PC',
    expectedAnnualQty: 2000,
    expectedAnnualUnit: 'PC',
    productCategoryDesc: 'Raw Materials',
    materialType: 'Metal',
    safetyRelevant: true,
    toolingRequired: false
  },
  {
    ObjectID: 'MOCK-ITEM-004',
    parentObjectID: 'MOCK-RFQ-002',
    itemID: '20',
    productID: 'ALUM-PROFILE-6M',
    productDescription: 'Aluminium Profile 6m, 40x40mm',
    itemIDCustom: 'RAW-ALU-002',
    quantity: 200,
    quantityUnit: 'PC',
    expectedAnnualQty: 800,
    expectedAnnualUnit: 'PC',
    productCategoryDesc: 'Raw Materials',
    materialType: 'Metal',
    safetyRelevant: false,
    toolingRequired: false
  },
  {
    ObjectID: 'MOCK-ITEM-005',
    parentObjectID: 'MOCK-RFQ-003',
    itemID: '10',
    productID: 'FREIGHT-STD',
    productDescription: 'Standard Freight Service, per shipment',
    itemIDCustom: 'SVC-FRT-001',
    quantity: 100,
    quantityUnit: 'SH',
    expectedAnnualQty: 400,
    expectedAnnualUnit: 'SH',
    productCategoryDesc: 'Logistics Services',
    materialType: 'Service',
    safetyRelevant: false,
    toolingRequired: false
  }
];

const NOTES = [
  {
    ObjectID: 'MOCK-NOTE-001',
    parentObjectID: 'MOCK-RFQ-001',
    histryNote: 'Initial RFQ created based on annual IT refresh plan.',
    noteID: 'NOTE-001',
    changedByName: 'John Smith',
    changedOn: '20260501090000'
  },
  {
    ObjectID: 'MOCK-NOTE-002',
    parentObjectID: 'MOCK-RFQ-002',
    histryNote: 'Urgent – production line waiting. Escalate if no response by EOW.',
    noteID: 'NOTE-002',
    changedByName: 'Sarah Connor',
    changedOn: '20260420140000'
  }
];

const SALES_TEAM = [
  {
    ObjectID: 'MOCK-ST-001',
    parentObjectID: 'MOCK-RFQ-001',
    roleCode: 'OWNER',
    roleCodeText: 'Owner',
    partyID: 'EMP001',
    formattedName: 'John Smith',
    mainIndicator: true
  }
];

const PARTIES = [];
const EQUOTE_DATA = [];
const GLOBAL_EQUOTE = [];
const RELATED_TXNS = [];
const ATTACHMENT_LIST = [];
const ATTACHMENTS = [];
const STATUS_HISTORY = [
  {
    ObjectID: 'MOCK-SH-001',
    parentObjectID: 'MOCK-RFQ-001',
    newStatus: '1',
    newStatusText: 'Open',
    newStatusDesc: 'RFQ opened',
    oldStatus: '',
    oldStatusText: '',
    changedByName: 'System',
    changedOn: '20260501080000'
  }
];
const FORECASTS = [];

module.exports = {
  RFQS, ITEMS, NOTES, SALES_TEAM, PARTIES,
  EQUOTE_DATA, GLOBAL_EQUOTE, RELATED_TXNS,
  ATTACHMENT_LIST, ATTACHMENTS, STATUS_HISTORY, FORECASTS
};
