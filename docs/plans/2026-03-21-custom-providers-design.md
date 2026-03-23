# Custom Providers Design

**Date:** 2026-03-21

**Goal:** Extend the gateway so it continues auto-discovering VS Code language models while also exposing manually configured external providers such as Ollama-compatible local servers, NVIDIA NIM, Codex-compatible endpoints, and similar OpenAI-style backends.

## Problem

Today the extension only exposes models discovered through `vscode.lm`. That works well for providers already registered inside VS Code, but it blocks users who have additional model endpoints that are OpenAI-compatible yet not surfaced through `vscode.lm`.

The user wants the same client-facing experience they get from Copilot today:

- built-in VS Code models remain available automatically
- extra providers can be added manually
- all models appear in one unified `/v1/models` list
- requests are routed automatically based on the chosen model

## Design

Add a new configuration setting:

`githubCopilotApi.server.customProviders`

Each provider entry will contain:

- `name`: human-friendly provider name
- `baseUrl`: OpenAI-compatible base URL, usually ending in `/v1`
- `apiKey`: optional secret or environment-placeholder string
- `models`: explicit list of model ids to expose
- `headers`: optional static headers
- `enabled`: optional boolean

Example:

```json
"githubCopilotApi.server.customProviders": [
  {
    "name": "local-ollama-proxy",
    "baseUrl": "http://127.0.0.1:1234/v1",
    "apiKey": "",
    "models": ["qwen2.5-coder-0.5b-instruct"],
    "enabled": true
  },
  {
    "name": "nvidia-nim",
    "baseUrl": "https://integrate.api.nvidia.com/v1",
    "apiKey": "${env:NVIDIA_API_KEY}",
    "models": ["meta/llama-3.1-70b-instruct"],
    "enabled": true
  }
]
```

## Unified Model View

The gateway should merge two sources:

1. Models from `vscode.lm.selectChatModels()`
2. Models defined in `server.customProviders`

Custom provider models should receive a stable routed id to avoid collisions. Recommended format:

`custom/<provider-name>/<model-id>`

Example:

- `gpt-4o`
- `github.copilot/gpt-4o-mini`
- `custom/local-ollama-proxy/qwen2.5-coder-0.5b-instruct`
- `custom/nvidia-nim/meta/llama-3.1-70b-instruct`

The response should still look like a normal OpenAI `/v1/models` list.

## Routing

When a request arrives:

- if the model id matches a VS Code language model, keep the current `vscode.lm` execution path
- if the model id matches a configured custom provider model, proxy the request to that provider's OpenAI-compatible endpoint

Initial scope should support:

- `/v1/chat/completions`
- `/v1/models`

Follow-up work can extend the same routing to:

- `/v1/responses`
- `/v1/completions`
- Anthropic/Google/Llama compatibility shims

## Error Handling

- Invalid provider config entries should be skipped with a clear output-channel warning
- Unreachable custom providers should not break VS Code model discovery
- Requests to missing custom models should return a normal `model_not_found` error
- Environment-placeholder API keys should resolve on request, not only at startup

## Testing

There is no obvious existing unit-test suite around routing today, so the first pass should add targeted tests for:

- config parsing for `customProviders`
- merged model list behavior
- model routing resolution
- OpenAI proxy request forwarding for a custom provider

Manual verification should include:

- one VS Code-discovered model
- one local OpenAI-compatible model on `127.0.0.1:1234/v1`
- `GET /v1/models`
- `POST /v1/chat/completions` against both model types
