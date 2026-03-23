# Custom Providers Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add configurable custom OpenAI-compatible providers to the gateway while preserving existing auto-discovery of VS Code language models.

**Architecture:** Keep the current `vscode.lm` path intact and introduce a parallel provider registry built from `githubCopilotApi.server.customProviders`. The gateway will merge built-in and configured models into one catalog, then route chat-completion requests either to a VS Code model or to a proxied external OpenAI-style endpoint.

**Tech Stack:** VS Code extension API, TypeScript, Node HTTP/fetch APIs, existing gateway request handlers

---

### Task 1: Add provider config types and settings

**Files:**
- Modify: `package.json`
- Modify: `src/CopilotApiGateway.ts`

**Step 1: Write the failing test**

Add a focused test for parsing `server.customProviders` and preserving valid entries while ignoring malformed ones.

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL because no parser or config field exists yet.

**Step 3: Write minimal implementation**

- Add TypeScript interfaces for custom providers
- Extend `ApiServerConfig`
- Read `server.customProviders` in `getServerConfig()`
- Add the corresponding VS Code configuration schema in `package.json`

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS for the new parsing test.

**Step 5: Commit**

```bash
git add package.json src/CopilotApiGateway.ts
git commit -m "feat: add custom provider configuration"
```

### Task 2: Merge built-in and custom models into one catalog

**Files:**
- Modify: `src/CopilotApiGateway.ts`
- Test: `src/test/customProviders.test.ts`

**Step 1: Write the failing test**

Add a test asserting that `/v1/models`-backing logic returns both VS Code-discovered models and prefixed custom provider models.

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL because only `vscode.lm` models are currently returned.

**Step 3: Write minimal implementation**

- Introduce a normalized internal model catalog
- Add custom-provider model ids in `custom/<provider>/<model>` format
- Keep metadata rich enough for request routing

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS for merged model-list behavior.

**Step 5: Commit**

```bash
git add src/CopilotApiGateway.ts src/test/customProviders.test.ts
git commit -m "feat: merge custom providers into model catalog"
```

### Task 3: Route chat-completion requests by model source

**Files:**
- Modify: `src/CopilotApiGateway.ts`
- Test: `src/test/customProviders.test.ts`

**Step 1: Write the failing test**

Add tests for:

- a VS Code model continuing through the existing `vscode.lm` path
- a custom provider model triggering HTTP forwarding to `<baseUrl>/chat/completions`

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL because the gateway only knows how to execute via `vscode.lm`.

**Step 3: Write minimal implementation**

- Add model-source resolution helpers
- Reuse normalized OpenAI chat payloads for provider forwarding
- Map provider errors back to gateway-style API errors when possible

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS for both routing paths.

**Step 5: Commit**

```bash
git add src/CopilotApiGateway.ts src/test/customProviders.test.ts
git commit -m "feat: route chat completions to custom providers"
```

### Task 4: Expose docs and safe defaults

**Files:**
- Modify: `README.md`
- Modify: `CHANGELOG.md`
- Modify: `package.json`

**Step 1: Write the failing test**

If there is no doc test harness, use a manual verification checklist instead of an automated test.

**Step 2: Run test to verify it fails**

Not applicable. Record manual verification targets before docs updates.

**Step 3: Write minimal implementation**

- Document `customProviders`
- Add one local endpoint example and one NVIDIA NIM example
- Mention current first-scope routing support

**Step 4: Run test to verify it passes**

Run:

```bash
npm run check-types
npm run lint
npm run compile
```

Expected: all commands succeed.

**Step 5: Commit**

```bash
git add README.md CHANGELOG.md package.json
git commit -m "docs: document custom providers"
```

### Task 5: Verify end-to-end with a local OpenAI-compatible provider

**Files:**
- Modify: `src/CopilotApiGateway.ts` if fixes are needed

**Step 1: Write the failing test**

Use a manual end-to-end check with a configured local provider such as `http://127.0.0.1:1234/v1`.

**Step 2: Run test to verify it fails**

Run:

```bash
curl http://127.0.0.1:3030/v1/models
curl -X POST http://127.0.0.1:3030/v1/chat/completions -H "Content-Type: application/json" -d '{"model":"custom/local-ollama-proxy/qwen2.5-coder-0.5b-instruct","messages":[{"role":"user","content":"Hello!"}]}'
```

Expected: fail before config and routing are fully wired.

**Step 3: Write minimal implementation**

Fix any remaining routing or response-shape issues discovered during the end-to-end test.

**Step 4: Run test to verify it passes**

Repeat the curl checks above.
Expected: both succeed, while a native VS Code model still works.

**Step 5: Commit**

```bash
git add src/CopilotApiGateway.ts
git commit -m "fix: complete custom provider routing"
```
