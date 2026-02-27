# MCP upgrade research for workshop refresh (spec + SDK + MCP Apps)

## Executive summary

- The core MCP spec has one stable release after October 2025 (`2025-11-25`), plus draft changes since then.
- The biggest shift for this workshop is not in core MCP alone; it is the formalization of **MCP Apps** as an official extension (`SEP-1865`, stable `2026-01-26`), which supersedes the old "MCP-UI as de facto protocol" framing.
- Current workshop materials still teach several legacy MCP-UI patterns (`externalUrl`, `remoteDom`, custom `postMessage` message types, embedded UI resources as primary pattern, `x-origin` header workaround).
- The workshop repo is pinned to `@modelcontextprotocol/sdk@^1.24.3` and `@mcp-ui/server@^5.16.1`; current SDK/recommended ecosystem has moved forward (`typescript-sdk v1.27.1`, `@modelcontextprotocol/ext-apps v1.1.2`, `@mcp-ui/* v6.x`).
- Recommendation: rename this workshop to an **MCP Apps**-first workshop, keep MCP-UI as a transitional utility layer, and redistribute some spec changes to the other three workshops in the series.

---

## Scope and sources used

### Core MCP spec and release metadata

- `modelcontextprotocol/modelcontextprotocol` releases via `gh`:
  - `2025-11-25` (stable)
  - no newer stable core spec release as of today
- Core spec changelog:
  - `docs/specification/2025-11-25/changelog.mdx`
- Draft changelog since `2025-11-25`:
  - `docs/specification/draft/changelog.mdx`

### TypeScript SDK changes (requested: all releases since Oct 2025)

- `modelcontextprotocol/typescript-sdk` release stream via `gh release list/view`
- Included range: `1.19.0` (2025-10-02) through `v1.27.1` (2026-02-24)

### MCP Apps / MCP-UI evolution

- Official MCP Apps docs:
  - `modelcontextprotocol.io/extensions/apps/overview`
  - `modelcontextprotocol.io/extensions/apps/build`
  - API docs: `apps.extensions.modelcontextprotocol.io/api/`
- Extension spec repository:
  - `modelcontextprotocol/ext-apps`
  - stable spec: `specification/2026-01-26/apps.mdx`
  - draft spec: `specification/draft/apps.mdx`
  - release stream through `v1.1.2`
- MCP-UI repo:
  - `idosal/mcp-ui` release notes, notably v6 migration (`mcp-ui -> mcp apps`)

### Current workshop material analysis

- Epic Agent indexed context:
  - `mcp-ui` workshop (all 5 exercises)
  - series siblings: `mcp-fundamentals`, `advanced-mcp-features`, `mcp-auth`
- Local repo review:
  - `exercises/README.mdx`, `exercises/FINISHED.mdx`
  - representative exercise readmes and utility code
  - package dependency versions across exercise workspaces

---

## Current workshop snapshot (what is taught today)

The current workshop is explicitly positioned as **MCP UI** and teaches:

1. `createUIResource` with `rawHtml`.
2. `remoteDom` content type with host components (`ui-text`, `ui-button`, etc.).
3. `externalUrl` iframe resources.
4. Custom postMessage message protocol (`tool`, `prompt`, `link`, `intent`, `notify`) + `ui-message-response`.
5. `uiMetadata` fields like:
   - `preferred-frame-size`
   - `initial-render-data`
6. Host readiness + sizing messages:
   - `ui-lifecycle-iframe-ready`
   - `ui-size-change`
7. Origin plumbing via a custom `x-origin` header workaround in tool request handling.

This is coherent for legacy MCP-UI, but no longer aligned to the official MCP Apps-first architecture.

---

## Core MCP spec: added/changed/removed since November 2025

## 1) Stable release `2025-11-25` (core MCP)

### Major additions/changes

1. OpenID Connect discovery support for authorization server discovery.
2. Icon metadata support for tools/resources/resource templates/prompts.
3. Incremental scope consent via `WWW-Authenticate`.
4. Tool naming guidance.
5. Elicitation schema/result changes (including enum forms).
6. URL mode elicitation.
7. Sampling with tool calling (`tools`, `toolChoice`).
8. OAuth Client ID Metadata Documents (recommended client registration mechanism).
9. Experimental tasks support.

### Minor additions/changes

1. JSON Schema 2020-12 as default dialect.
2. Primitive default values in elicitation schemas.
3. Protected resource discovery alignment with RFC 9728 (`WWW-Authenticate` optional fallback semantics).
4. SSE polling clarifications and stream behavior updates.
5. Input validation errors clarified as tool execution errors.
6. Streamable HTTP origin handling clarifications (403 for invalid origins).
7. Optional `description` in `Implementation`.

### Removed/deprecated

- No large "hard removals" in the core spec changelog, but behavior expectations tightened in multiple areas (schemas, transport semantics, auth discovery behavior).

## 2) Draft changes since `2025-11-25`

1. **`extensions` field** added to `ClientCapabilities` and `ServerCapabilities` to support optional protocol extensions.
2. OpenTelemetry trace-context conventions in `_meta` (`traceparent`, `tracestate`, `baggage`).

**Why this matters for this workshop:** MCP Apps extension negotiation depends on extension-capability semantics; the workshop should include extension-aware capability gating and graceful fallback.

---

## MCP Apps transition: what changed relative to this workshop

MCP Apps is now an official extension track with stable spec (`2026-01-26`) and active SDK releases (`ext-apps` >= 1.0, latest 1.1.2).

### High-impact deltas vs current workshop

- **Changed architectural center**
  - Old: embedded MCP-UI resources returned directly from tool calls as primary path.
  - New official: **predeclared UI resources** + tool linkage via `_meta.ui.resourceUri`.

- **Changed transport semantics**
  - Old: custom ad-hoc postMessage message types.
  - New: JSON-RPC-based Apps dialect with structured methods/notifications.

- **Changed content-type baseline**
  - Official MVP focuses on `text/html;profile=mcp-app` as baseline.
  - `externalUrl`/other formats are deferred in the official MVP narrative.
  - Current workshop’s `externalUrl` and `remoteDom` emphasis is now partially off-core-spec path.

- **Changed capability model**
  - Explicit extension support/capability negotiation and graceful degradation expected.

- **Expanded security model**
  - CSP domain declarations, sandbox permissions, optional stable domain behavior, and explicit host mediation patterns are first-class.

- **New view-host UX hooks**
  - Host context, host styles/theming variables, display mode requests, and newer host-mediated operations (e.g. `ui/download-file`) are now concrete teachable concepts.

### MCP-UI utility status

- MCP-UI still has value as a practical SDK layer and compatibility adapter.
- `mcp-ui` v6 release notes explicitly indicate migration to MCP Apps and breaking changes ("removed discarded content types, changed mimetype, updated docs, etc.").
- This supports a strategy of teaching **MCP Apps concepts first**, while using MCP-UI selectively as an adapter/tooling utility.

---

## TypeScript SDK releases since October 2025 (significant items to represent)

Below are the notable changes from `1.19.0` -> `v1.27.1` that should influence workshop content.

### P0 (must account for in refreshed material)

1. **Protocol + spec alignment updates**
   - `1.24.0` explicitly aligns with spec `2025-11-25`.
   - `1.24.1` protocol version bump to `2025-11-25`.

2. **Tasks support**
   - `1.24.0` adds SEP-1686 tasks.
   - `v1.27.0` adds streaming methods for elicitation/sampling under tasks.

3. **Sampling + tool-call interplay**
   - `1.23.0` implements sampling with tools constraints/validation.
   - `v1.25.3` fixes schema validation edge case for sampling with tools.

4. **Auth + discovery maturity**
   - `1.23.0`/`1.21.x` include auth/discovery/scoping behavior updates.
   - `v1.27.0` adds `discoverOAuthServerInfo()` and discovery caching.
   - `v1.26.0` includes major security advisory fix.

5. **Request context evolution**
   - `v1.27.0` adds `url` on `RequestInfo`.
   - This can replace workshop-specific `x-origin` header workaround patterns.

6. **Schema strictness and compatibility**
   - JSON Schema 2020-12 compatibility updates.
   - stricter spec type compliance (`1.25.0`) + output schema update support.

### P1 (important but can be distributed across workshops)

1. Icons/types updates (`1.19.0`, `1.25.0` theme property).
2. Resource annotations support (`1.24.2`).
3. Transport robustness and SSE polling behavior (`1.23.x`, `1.24.x` patches).
4. Zod v4 compatibility trajectory (`1.23.0` onward).

### Current repo dependency gap

- Current workshop dependency baseline (`@modelcontextprotocol/sdk@^1.24.3`) misses:
  - `RequestInfo.url`
  - newer discovery helpers/caching
  - post-1.24 spec-alignment fixes and security patch set

---

## What directly affects **this** workshop (added / changed / removed)

## Added (should be added to updated workshop)

1. Official **MCP Apps** extension framing and terminology.
2. Extension capability negotiation and graceful fallback to non-UI behavior.
3. Predeclared UI resources + `_meta.ui.resourceUri` linkage.
4. `registerAppTool` / `registerAppResource`-style patterns.
5. Host context/theming and display-mode aware UI behavior.
6. CSP/permissions/domain metadata in UI resources.
7. Host-mediated APIs beyond link/tool/prompt (e.g. `ui/download-file`).

## Changed (current lessons should be rewritten)

1. Custom MCP-UI message protocol lessons -> JSON-RPC Apps dialect patterns.
2. Embedded-resource-first story -> resource registration and linkage-first story.
3. `x-origin` request-header workaround -> modern request context (`RequestInfo.url`) and cleaner server design.
4. "MCP UI supports these content types" -> "MCP Apps MVP baseline is HTML profile; additional formats are extension/future/adapter territory."

## Removed / de-emphasized

1. `remoteDom` as a core, first-class protocol concept (keep as legacy/optional adapter module if desired).
2. `externalUrl` as baseline pattern in the official-spec storyline (can be taught as practical compatibility pattern, not MVP core).
3. Legacy `ui-lifecycle-*` and `ui-message-response` as the primary protocol mental model.

---

## New concepts not currently represented (or underrepresented)

1. UI extension identifier and extension capability negotiation model.
2. Tool visibility controls (`model` vs `app`) for safer interaction surfaces.
3. Host style variables/fonts and visual adaptation strategy.
4. Display mode request APIs and host-accepted mode handling.
5. Host-mediated file download (`ui/download-file`).
6. Strong CSP/permissions/domain patterns as primary security mechanism.
7. Compatibility strategy across hosts with mixed support (native MCP Apps vs MCP-UI adapter).

---

## Suggested rewrite of this workshop (5-module shape)

### Module 1: MCP Apps foundations (rename from "Simple")

- Register app tool + app resource.
- `_meta.ui.resourceUri`, `ui://` URIs, `text/html;profile=mcp-app`.
- Text fallback behavior when UI is unsupported.

### Module 2: Interactive app runtime (replace "Consistent")

- App initialization handshake.
- Receiving tool input/result notifications.
- Calling tools from UI via official methods.
- Basic host context usage.

### Module 3: Security + rendering constraints (replace "Complex")

- CSP, permissions, domain, border preferences.
- Sizing and container constraints with modern host context concepts.
- De-emphasize `externalUrl` as core; include in legacy appendix if needed.

### Module 4: Host communication patterns (replace "Interactive")

- JSON-RPC method mapping (`tools/call`, `ui/message`, `ui/open-link`, etc.).
- Error handling, request/response patterns, cancellation semantics.

### Module 5: Advanced app patterns (replace "Advanced")

- Structured outputs + client-side schema checks (still relevant).
- View state/model-context updates.
- `requestDisplayMode`, `ui/download-file`, and practical host capability checks.

### Optional appendix track

- "Legacy MCP-UI compatibility mode"
  - `@mcp-ui/server` adapter mode
  - bridging old `ui-lifecycle-*` messaging to MCP Apps hosts
  - migration checklist from legacy widgets

---

## Cross-workshop distribution recommendations (4-workshop series)

## Keep in this workshop (renamed to MCP Apps)

- Extension-specific UI architecture and runtime.
- UI security model (CSP/permissions/sandbox).
- UI-to-host interaction APIs and advanced app affordances.

## Move/emphasize in MCP Fundamentals

- Updated protocol version framing (`2025-11-25` baseline).
- JSON Schema 2020-12 defaults and practical implications.
- Updated tool naming guidance and implementation metadata hygiene.

## Move/emphasize in Advanced MCP Features

- URL elicitation and evolved elicitation schema model.
- Sampling with tools.
- Tasks concepts (and when to use them).
- Icons/resource annotations as richer metadata for UX.

## Move/emphasize in MCP Auth

- OIDC discovery updates.
- OAuth client ID metadata docs and DCR expectations.
- Incremental scope consent via `WWW-Authenticate`.
- Discovery edge-case handling and SDK helper updates.

---

## Proposed naming update

Primary recommendation:

- **"MCP Apps: Building Interactive UI for MCP"**

Alternative:

- **"MCP Apps (with MCP-UI utilities)"** for transition period messaging.

---

## Practical rollout plan (first-half-year refresh)

## Phase 1 (immediate planning + skeleton)

1. Rename workshop metadata/title/subtitle.
2. Update intro/outro and module titles to MCP Apps terminology.
3. Decide canonical code path:
   - A) `@modelcontextprotocol/ext-apps` native APIs
   - B) MCP-UI adapter-first with explicit migration framing
4. Upgrade dependency targets and baseline host support matrix.

## Phase 2 (content + exercise rewrite)

1. Rewrite exercises 1-5 around MCP Apps model above.
2. Add one "legacy interoperability" optional lesson.
3. Replace custom message diagrams with JSON-RPC method flows.
4. Remove `x-origin` workaround teaching in favor of current request context patterns.

## Phase 3 (recording + QA)

1. Re-record videos aligned to new API names and host support reality.
2. Validate examples in at least:
   - Claude or Claude Desktop
   - VS Code Copilot
   - one additional host (Goose/Postman/MCPJam)
3. Publish migration notes for existing learners from the October 2025 cohort.

---

## Open decisions to resolve before implementation

1. Do you want the workshop to be strict-spec MVP only (HTML profile), or include practical non-MVP patterns as optional modules?
2. Do you want to standardize on ext-apps APIs in exercises, or keep MCP-UI APIs and explicitly teach the adapter bridge?
3. Which host(s) should be the canonical demo environment for recordings and student debugging?
4. Should `ui/download-file` and display-mode requests be required content or bonus content?

---

## Bottom line

For this workshop specifically, the biggest required shift is:

- **from "MCP-UI protocol workshop"**
- **to "MCP Apps official extension workshop"**

while preserving MCP-UI as a transitional utility for compatibility where useful.
