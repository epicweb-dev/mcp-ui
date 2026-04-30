# MCP Apps Update TODO

These notes assume the videos were recorded for MCP UI before MCP Apps became
the official extension. The likely direction is to rename this workshop from
`mcp-ui` to `mcp-apps` and teach the official MCP Apps model.

Sources to re-check before recording:

- MCP Apps docs:
  https://modelcontextprotocol.io/docs/extensions/apps
- MCP Apps quickstart:
  https://apps.extensions.modelcontextprotocol.io/api/documents/Quickstart.html
- MCP Apps spec:
  https://github.com/modelcontextprotocol/ext-apps/tree/main/specification
- MCP Apps package:
  https://www.npmjs.com/package/@modelcontextprotocol/ext-apps
- MCP-UI docs:
  https://mcpui.dev

## Recommended Strategy

Rename this workshop to `mcp-apps` and reframe it around the official MCP Apps
extension. MCP-UI is still relevant, especially for host rendering support, but
it should be presented as ecosystem tooling that supports MCP Apps rather than
as the spec itself.

The main conceptual change is this:

- Old workshop: a tool returns an embedded UI resource directly.
- Current MCP Apps: a tool declares `_meta.ui.resourceUri`, and the UI is a
  predeclared `ui://` resource the host can fetch, inspect, cache, sandbox, and
  render.

That means this workshop probably needs more exercise rewrites than the other
three. The good news is that the official extension is closer to the existing
iframe direction than to the removed Remote DOM exercise.

## Global Rename And Positioning

- [ ] Rename the workshop from `mcp-ui` to `mcp-apps`.
- [ ] Update titles, intro copy, package names, route names, and links from
  "MCP UI" to "MCP Apps" where they refer to the official standard.
- [ ] Keep references to MCP-UI only where discussing the `@mcp-ui/client`
  renderer or compatibility/migration history.
- [ ] Replace "MCP UI extension to the spec" language with "MCP Apps official
  extension".
- [ ] Update client support lists. Current docs mention Claude, Claude Desktop,
  VS Code GitHub Copilot, Goose, Postman, and MCPJam, with the client matrix as
  the source of truth.
- [ ] Add an early note that MCP Apps support is negotiated as an extension and
  hosts that do not support it should still get a useful text/structured
  fallback.

## Global Implementation Updates

- [ ] Add `@modelcontextprotocol/ext-apps` and use its helpers where they reduce
  boilerplate:
  - `registerAppTool`
  - `registerAppResource`
  - `RESOURCE_MIME_TYPE`
  - `App` in iframe/view code
- [ ] Replace raw `text/html` MIME type examples for app resources with
  `text/html;profile=mcp-app`.
- [ ] Ensure every app UI resource uses the reserved `ui://` scheme.
- [ ] Predeclare app resources via `resources/list`/`resources/read` rather than
  only returning embedded resources from tool calls.
- [ ] Link tools to app resources with nested `_meta.ui.resourceUri`, not the
  deprecated flat `_meta["ui/resourceUri"]`.
- [ ] Use `_meta.ui.visibility` where appropriate:
  - `["model", "app"]` for tools the model and app may call
  - `["app"]` for app-only helper tools
  - `["model"]` for model-only tools
- [ ] Add `structuredContent`/tool-result fallback text to tools so non-App
  hosts still produce useful output.
- [ ] Add CSP and permission metadata examples where the official SDK supports
  them. This should be taught as part of the security model, not as optional
  polish.

## Exercise 01: Simple

- [ ] Rewrite the first exercise around the official quickstart pattern:
  "MCP Apps = tool + UI resource."
- [ ] Replace `createUIResource({ content: { type: "rawHtml" } })` as the core
  pattern with:
  - bundled HTML resource registered at a `ui://...` URI
  - tool metadata containing `_meta.ui.resourceUri`
  - tool returning text/structured data that the host can pass to the app
- [ ] Keep a raw HTML example only if it uses the official MCP Apps resource
  MIME type and resource registration model.
- [ ] Add a simple `App` instance in the view code and show `app.connect()`.
- [ ] Make the fallback output visible in the tool result so the exercise still
  works in hosts without MCP Apps.

## Exercise 03: Complex

- [ ] Keep iframe/full web app framing, but change the language from
  `externalUrl` content type to MCP Apps HTML resources rendered in sandboxed
  iframes.
- [ ] Replace custom lifecycle message names with official MCP Apps messages and
  the `App` helper API where possible.
- [ ] Teach that the host must not send requests/notifications to the view until
  initialization completes.
- [ ] Add host-context/display-mode handling if it is supported by the SDK and
  useful for responsive layouts.
- [ ] Replace custom sizing protocol material with the official MCP Apps sizing
  and host context APIs. If the official API does not cover a current feature,
  mark the feature as MCP-UI-specific and optional.
- [ ] Preserve the React/Vite iframe app exercises if they still work, but make
  the build output a registered app resource instead of an arbitrary external
  iframe URL.

## Exercise 04: Interactive

- [ ] Replace the custom MCP-UI `postMessage` envelope with MCP Apps JSON-RPC
  over `postMessage`, preferably through `@modelcontextprotocol/ext-apps`.
- [ ] Replace custom message types:
  - `tool` should become an app request that calls server tools through the host
  - `prompt` should become the official message/send-message or equivalent app
    API if supported
  - `link` should become the official open-link request if supported
  - `intent`/`notify` should be removed unless the official spec has direct
    equivalents worth teaching
- [ ] Add user-consent language for UI-initiated tool calls. Hosts may require
  approval before forwarding calls from an app to the MCP server.
- [ ] Introduce app-only tools with `_meta.ui.visibility: ["app"]` for UI helper
  actions that the model should not call.
- [ ] Show how the app can update model context if the SDK exposes
  `updateModelContext` or its finalized equivalent.

## Exercise 05: Advanced

- [ ] Rewrite "Tool Results" around the official `App` API:
  - receive initial tool results from the host
  - call server tools from the app
  - handle returned `content` and `structuredContent`
  - validate structured data in the app only as a local safety/type aid
- [ ] Rewrite "Render Data" around the official resource/template plus tool
  result flow. Avoid MCP-UI-specific `uiMetadata["initial-render-data"]` unless
  it remains compatible with MCP Apps.
- [ ] Add a section on common MCP Apps patterns:
  - app-only polling tools for live data
  - chunked data retrieval for large payloads
  - downloadable files through host-mediated APIs
  - useful text fallback for non-App clients
- [ ] Add a security exercise or sidebar covering:
  - sandboxed iframes
  - CSP from resource metadata
  - declared permissions
  - auditable JSON-RPC messages
  - host allow/block decisions before rendering

## Exercise Removal / Consolidation

- [ ] Keep the deleted Remote DOM exercise deleted. MCP Apps standardized on
  sandboxed iframe-style HTML apps, and Remote DOM would be a distraction.
- [ ] Consider combining current `03.complex` and `04.interactive` if the
  official `App` helper makes custom lifecycle/tool/prompt messaging much
  smaller. Fewer exercises may be better than preserving old boundaries.
- [ ] If the official extension makes raw HTML and complex iframe apps the same
  underlying mechanism, consider reducing the first module to a short simple
  app and spending more time on data flow/security.

## Host / Testing Updates

- [ ] Replace Nanobot-specific setup instructions with the official MCP Apps
  basic host or another actively supported host.
- [ ] Keep a short "try it in a real client" section, but do not depend on a
  single client for workshop correctness.
- [ ] Add smoke tests around:
  - resources/list includes the `ui://` app resource
  - resources/read returns `text/html;profile=mcp-app`
  - tools/list includes `_meta.ui.resourceUri`
  - app-only tools are hidden from the model if visibility is configured
  - fallback text/structured output is present

## Things To Avoid

- Do not teach the deprecated flat `_meta["ui/resourceUri"]` format except as a
  migration note.
- Do not teach `text/html` without the `profile=mcp-app` MIME type for official
  app resources.
- Do not rely on custom `postMessage` message types when the official App API
  provides an equivalent.
- Do not present MCP-UI as "the spec." Present it as compatibility tooling and
  historical context.
