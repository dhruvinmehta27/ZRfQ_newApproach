namespace ZRfQ_newApproach.db;

// All RFQ data lives in SAP C4C at /cust/v1/zrfq (RFQRootCollection).
// No local persistence is required – every request is proxied by srv/service.js.
// This file is kept so `cds build` does not warn about a missing db folder.
