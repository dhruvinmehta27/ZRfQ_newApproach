# ZRfQ — Request for Quotation App

A SAP CAP v9 backend + Fiori Elements v4 frontend that exposes RFQ data
from **SAP Cloud for Customer (C4C)** through a standard OData v4 API on BTP.

---

## Architecture Overview

```
Browser
  └─ Fiori Elements v4  (manifest.json + annotations.cds)
       └─ OData v4  →  CAP service.js
            └─ In-memory cache (1 000 newest RFQs, 30-min TTL)
                 └─ c4c-client.js (axios)
                      └─ C4C OData v2
                           my352500.crm.ondemand.com/cust/v1/zrfq
```

CAP acts as an **adapter layer**: it speaks OData v4 to the browser and OData v2
to C4C, translating field names, handling CSRF tokens, and caching responses so
the UI loads quickly despite C4C's large dataset (89 000+ records).

---

## Project Structure

```
ZRfQ_newApproach/
├── app/
│   └── rfq/
│       ├── annotations.cds          # UI metadata (columns, tabs, filter bar)
│       ├── i18n/i18n.properties     # Annotation label translations
│       └── webapp/
│           ├── index.html           # Standalone HTML entry point
│           ├── manifest.json        # App descriptor (model, routing, UI5 version)
│           ├── Component.js         # Ushell polyfills for standalone mode
│           └── ext/
│               └── ListReportExt.js # Custom List Report controller extension
├── db/
│   ├── schema.cds                   # CAP entity definitions (SQLite / mock mode)
│   └── data/
│       └── *.csv                    # Seed data for local mock runs
├── srv/
│   ├── service.cds                  # OData v4 service definition (all entities)
│   ├── service.js                   # Service handlers (READ/CREATE/UPDATE/DELETE)
│   └── lib/
│       ├── c4c-client.js            # HTTP client for C4C OData v2 API
│       ├── destination.js           # BTP Destination resolver (credentials)
│       └── mock-data.js             # Hardcoded sample data for mock mode
├── approuter/
│   ├── xs-app.json                  # Route rules (/api → CAP, /rfq → UI)
│   └── package.json                 # AppRouter npm config
├── mta.yaml                         # MTA deployment descriptor (BTP CF)
├── manifest.yml                     # CF manifest for manual cf push
├── package.json                     # Root npm config and cds scripts
├── default-env.json.example         # Template for local credentials file
└── default-env.json                 # ← GITIGNORED. Real credentials go here.
```

---

## File Reference

### `srv/service.cds` — OData v4 Entity Definitions

Declares every entity the Fiori UI consumes:

| Entity | Description |
|---|---|
| `RFQs` | Root RFQ records |
| `RFQItems` | Line items belonging to an RFQ |
| `RFQParties` | Buyers, suppliers, and other parties on an RFQ |
| `RFQNotes` | Free-text notes attached to an RFQ |
| `RFQForecasts` | Forecast figures per RFQ |
| `RFQAttachmentList` | Attachment list metadata (skeleton — not yet active) |
| `RFQAttachments` | Individual attachment records (skeleton — not yet active) |

---

### `srv/service.js` — Service Handlers

The heart of the backend. Responsibilities:

1. **Field mapping** — `TO_C4C` maps CAP field names → C4C OData v2 property names;
   `FROM_C4C` is the reverse (auto-derived). `toCAP()` and `toC4C()` convert records.

2. **In-memory cache** — Stores the 1 000 newest RFQs in a `Map` with a 30-minute TTL.
   A deduplication map (`_listFetch`) ensures that the startup warm and the first user
   request share a single C4C round-trip rather than triggering two parallel fetches.

3. **RFQs READ handler** — Single-record reads first check the cache, then call
   `getRFQ()` on C4C. List reads serve from cache and sort/page locally.

4. **Child entity handlers** — A `mkChildHandlers` factory wires up READ/CREATE/
   UPDATE/DELETE for every child collection. It reads the parent ObjectID from
   `req.params` (CAP v9 navigation pattern) and filters C4C results accordingly.

5. **Startup warm** — Immediately after the service loads it fires a background
   fetch of the first C4C page (`$orderby ID desc`) so users see data on first load.

**Key constants:**

| Constant | Value | Purpose |
|---|---|---|
| `IS_MOCK` | env flag | Switches between real C4C and mock data |
| `_CACHE_TTL` | 30 min | How long cached RFQ lists are kept |
| `CSRF_TTL` | 9 min | How long a fetched CSRF token is reused |

---

### `srv/lib/c4c-client.js` — C4C HTTP Client

All raw HTTP calls to C4C OData v2. Key behaviours:

- **Axios instance** created fresh per request so rotated BTP credentials are
  always picked up without restarting the server.
- **CSRF tokens** are fetched via `GET $top=1` (not HEAD — C4C returns 500 on HEAD)
  and cached for 9 minutes.
- **`listRFQsFirstPage`** strips `$top`/`$skip` before forwarding to C4C to avoid
  400 errors, and returns `{ results, nextUrl }` where `nextUrl` is the OData
  skiptoken link for page 2 (not currently followed).
- **`listChildren`** is generic — the caller passes the collection name and any
  OData params (e.g., `$filter: "ParentObjectID eq 'XYZ'"`).

---

### `srv/lib/destination.js` — BTP Destination Resolver

Reads the BTP Destination named `C4C_QUA_HARDCODED` and returns
`{ baseURL, auth }` so credentials are never hardcoded in source files.

In local development the destination config comes from `default-env.json`
(gitignored). In BTP Cloud Foundry it is read from `VCAP_SERVICES`.

---

### `srv/lib/mock-data.js` — Mock Data

Hardcoded sample RFQ records returned when the app runs with
`--profile mock`. Useful for local UI development without a C4C connection.

---

### `app/rfq/annotations.cds` — UI Annotations

Declarative UI configuration consumed by Fiori Elements v4. Defines:

- **List Report**: which columns appear, their order and labels
- **Filter Bar**: which fields are searchable and their display type
- **Object Page header**: title, subtitle, and header fields
- **Object Page tabs**: Details, Items, Parties, Notes, Forecasts
  *(Attachments tab is commented out — pending C4C attachment API)*
- **Field groups**: how fields are grouped within each tab section
- **Criticality**: colour coding for overdue RFQs (red = overdue)

---

### `app/rfq/webapp/Component.js` — Standalone Polyfills

Fiori Elements v4 expects to run inside a SAP Fiori Launchpad (FLP) which
provides `sap.ushell.Container`. Running standalone (no FLP) requires two
polyfills injected before the AppComponent loads:

1. **`patchUshell` IIFE** — Creates a minimal `sap.ushell.Container` with stub
   implementations of `AppState`, `URLParsing`, `ShellNavigation`, and `getUser`.
   Without these, FE crashes during view creation and routing initialisation.

2. **`registerShellUIService` IIFE** — Registers a no-op `ShellUIService` factory
   in UI5's `ServiceFactoryRegistry`. FE calls `setBackNavigation` on this service
   on every row press before navigating to the Object Page.

---

### `app/rfq/webapp/manifest.json` — App Descriptor

| Setting | Value |
|---|---|
| App ID | `com.zrfq.rfq` |
| UI5 version | 1.120 (loaded from CDN) |
| OData service | `/rfq/` (proxied to CAP by AppRouter) |
| List Report entity | `RFQs` |
| Object Page entity | `RFQs` |
| Navigation | `RFQs` → `RFQObjectPage` on `ObjectID` key |

---

### `approuter/xs-app.json` — Route Rules

| Pattern | Destination | Purpose |
|---|---|---|
| `/api/*` | CAP service | OData v4 API requests |
| `/rfq/*` | Static files | Fiori UI assets |

---

## Local Development

### Prerequisites

- Node.js 18+
- `@sap/cds` CLI installed globally (`npm i -g @sap/cds-dk`)
- A `default-env.json` file in the project root (copy from `default-env.json.example`
  and fill in your BTP credentials — this file is gitignored)

### Run against real C4C

```bash
npm install
cds watch
```

The app starts on `http://localhost:4004`. The Fiori UI is at
`http://localhost:4004/rfq/webapp/index.html`.

### Run in mock mode (no C4C needed)

```bash
cds watch --profile mock
```

Uses the hardcoded records in `srv/lib/mock-data.js`.

---

## Deployment (BTP Cloud Foundry)

```bash
mbt build
cf deploy mta_archives/<generated>.mtar
```

The MTA descriptor (`mta.yaml`) packages the CAP backend, Fiori UI, and
AppRouter together and wires up the BTP Destination and XSUAA service bindings.

---

## Known Limitations & Pending Work

| Item | Status | Notes |
|---|---|---|
| Attachment tab | Skeleton only | C4C attachment OData API not yet built |
| Search beyond 1 000 records | Not built | Needs filter passthrough to C4C `$filter` |
| Sort by latest RFQ | Partially working | Currently sorts by `ID desc`; full sort needs verification |

---

## C4C OData v2 Integration Notes

- **Collection**: `RFQRootCollection` under `/sap/c4c/odata/cust/v1/zrfq`
- **CSRF**: Must be fetched via GET (C4C returns 500 on HEAD requests)
- **Pagination**: C4C caps responses at ~1 000 rows; `d.__next` holds the skiptoken
  link for the next page
- **Child collections**: Do **not** support `$top`/`$skip` combined with `$filter`
  (returns 400) — pagination of child results is done in-memory on the CAP side
- **Attachments**: `RFQAttachmentsCollection` does not support GET with `$filter`
- **Key reads**: `getRFQ('id')` can return 500 on some records; the service falls
  back to a cached stub rather than surfacing the error to the browser
