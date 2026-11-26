# Pos Satpam

Ask why CI failed on GitHub Actions, Jenkins or Bitbucket, and your agent gets
one capped, cited answer that says what it left out. It can't touch CI except
for one rerun you approve.

Pos Satpam is a bounded Model Context Protocol (MCP) server for coding and
operations agents. It turns allowlisted CI provider data into small, typed,
redacted evidence. The agent, chat gateway, credentials, and deployment policy
remain outside the server. Read-only Grafana and Prometheus-compatible
observability tools are also included.

[![Validate](https://github.com/hmrdkn-labs/pos-satpam/actions/workflows/validate.yml/badge.svg)](https://github.com/hmrdkn-labs/pos-satpam/actions/workflows/validate.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-2f6f4e.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22-43853d.svg)](package.json)

## Product Boundary

~~~text
AI client or chat gateway
        |
        | MCP stdio or private Streamable HTTP
        v
Pos Satpam application
  protocol -> policy -> domain evidence -> redaction and bounds
        |                 |                  |
        v                 v                  v
   MCP schemas      provider adapters    metadata-only audit
        |                 |
        +---------> observability, CI, and SCM providers
~~~

The code follows these bounded contexts:

- **Protocol** owns MCP lifecycle, transports, tool registration, and errors.
- **Policy** owns provider, repository, workflow, ref, dashboard, query, and
  capability allowlists.
- **Evidence** owns versioned envelopes, freshness, truncation, redaction, and
  deterministic digests.
- **Provider adapters** translate Grafana, Prometheus-compatible backends,
  GitHub Actions, Jenkins, Bitbucket Cloud, and SCM APIs into those contracts.
- **CI operations** owns read-only status, logs, failure analysis, remediation
  plans, SCM evidence, telemetry correlation, and the one approval-gated GitHub
  failed-job rerun.
- **Observer** is an optional companion process for bounded polling/webhook
  normalization, dedupe, and signed internal delivery. It is not an MCP tool or
  a chat gateway.

Pos Satpam does not run an LLM, receive chat messages, execute shell commands,
retrieve secrets, modify source, deploy workloads, mutate alerts or dashboards,
or silently call another MCP server. The only write-capable path is GitHub's
rerun-failed-jobs, and it requires a fresh one-time operator approval.

## Current Condition

What works today, checked 2026-11-26:

- **From source:** clone, `npm ci`, `npm run build`, then run `node dist/cli.js`
  over stdio. See [Install And Run](#install-and-run).
- **GitHub Actions** is the provider that has been run against a live repository.
  **Jenkins and Bitbucket Cloud** are implemented and covered by recorded
  fixtures; they have not been exercised against a live server.
- **Bitbucket Data Center** is a contract only. There is no adapter.
- **Real CI data needs the private HTTP transport**, a YAML configuration and a
  GitHub App. A read-only token over stdio is not available yet.
- **The stdio server returns demo data.** See [Demo Data](#demo-data).
- **No token-savings number is claimed.** It has not been measured.
- **Nothing is published yet.** The npm package is published from v0.3.0, and
  the image `ghcr.io/hmrdkn-labs/pos-satpam` appears at the next release. The
  registry listing follows the npm package. Until then, use the source route.

Private HTTP is a single-operator pre-release transport. Public exposure is
blocked until OAuth, authorization, Origin policy, ingress and tenant isolation
are implemented and verified. The private edge observer and chat-gateway route
remain deployment-owner work. See the
[implementation status](docs/implementation-status.md).

## What The Approval Gate Does Not Cover

The one write path, rerun of failed GitHub jobs, needs a fresh one-time operator
approval. That gate holds only if the agent has no other CI-write credential.
If the agent also has a shell with a `gh` token or any other token that can
rerun, cancel or trigger workflows, it can bypass Pos Satpam. Give the agent a
read-only credential, or none, outside this server.

## Install And Run

Node.js 22 or newer is required.

### From source (stdio)

~~~bash
git clone https://github.com/hmrdkn-labs/pos-satpam.git
cd pos-satpam
npm ci
npm run build
npm run inspector:list
~~~

The last command starts `node dist/cli.js` and prints the `tools/list` result.
To use the server from an MCP client, launch it as a child process:

~~~json
{
  "mcpServers": {
    "pos-satpam": {
      "command": "node",
      "args": ["/absolute/path/to/pos-satpam/dist/cli.js"]
    }
  }
}
~~~

### Demo Data

`pos-satpam` over stdio has no provider configured. It serves a built-in fake
provider: fixed example services, alerts and metrics. Every result says so, with
`"providerClass": "fake"` and `"notice": "demo data: no provider configured"`.
Do not treat stdio output as information about any real system. Real CI evidence
needs the private HTTP transport below.

### OCI image

The image identity is:

~~~text
ghcr.io/hmrdkn-labs/pos-satpam@sha256:<immutable-digest>
~~~

This image is published by the next release workflow; the digest will be recorded
in the release notes. Earlier images were published under a previous image name,
recorded in the [changelog](CHANGELOG.md). Always pin by digest. The image is
non-root, supports linux/amd64 and linux/arm64, and defaults to stdio:

~~~bash
docker run --rm -i ghcr.io/hmrdkn-labs/pos-satpam@sha256:<immutable-digest>
~~~

For private HTTP, run dist/http-cli.js, mount the configuration and secret
files read-only, and pass the same environment variables shown below. The
container entrypoint is node; the command selects the transport.

### npm package

Published from v0.3.0. Until that release the package does not exist on the
registry and `npm install @hmrdkn-labs/pos-satpam` fails with E404. After
publication:

~~~bash
npx @hmrdkn-labs/pos-satpam
~~~

### Private Streamable HTTP

Private HTTP is for a private, single-operator network. It requires a strict
YAML runtime configuration and a bearer token in a regular 0600 file. Values
are never put in the YAML, command line, MCP request, logs, or documentation.

~~~bash
node dist/http-cli.js
~~~

(`pos-satpam-http` after an npm install.) The HTTP process reads these
environment variables:

~~~text
MCP_HTTP_HOST=127.0.0.1
MCP_HTTP_PORT=8765
MCP_HTTP_ALLOWED_HOSTS=127.0.0.1
OBSERVABILITY_PROVIDER_CONFIG=/private/path/provider-config.yml
MCP_TOKEN_FILE=/private/path/mcp-token
GRAFANA_TOKEN_FILE=/private/path/grafana-token   # observability profiles only
~~~

If a required variable is missing or the configuration is invalid, it prints one
line to stderr and exits with status 2.

The bearer file must be a regular 0600 file containing at least 16 bytes. The
Grafana file follows the same rule. CI credentials, GitHub App material,
approval keys, and Bitbucket tokens are separate 0600 files referenced by the
runtime configuration. Use the versioned examples as placeholder-only
templates.

The current HTTP routes are:

| Route | Enabled when | Surface |
| --- | --- | --- |
| /mcp | observability is enabled | seven observability tools, plus CI tools in combined |
| /mcp/ci | CI is enabled | CI tools only |
| /healthz | HTTP process is running | unauthenticated process liveness |

All MCP routes require an Authorization Bearer credential and an exact
configured Host value. /mcp is absent for ci-only; /mcp/ci is absent when CI is
disabled.

### Development

~~~bash
npm ci
npm run validate
~~~

The controlled GitHub Actions fixture at .github/workflows/goal14-controlled-fixture.yml
is a test-only failure/rerun reference and is not a production workflow.

## Profiles

| Profile | Transport | Provider requirement | Client endpoint |
| --- | --- | --- | --- |
| observability-only | private HTTP | metrics, alerts, Grafana, policy | /mcp |
| ci-only | private HTTP | one enabled CI provider and CI allowlist | /mcp/ci |
| combined | private HTTP | observability and one enabled CI provider | /mcp and /mcp/ci |
| stdio | local stdio | none; serves labelled demo data from a fake provider | process stdin/stdout |
| private-http | example name for observability HTTP | same as observability-only | /mcp |

The configuration parser requires version: 1. Observability profiles require
providers and policy. CI profiles require ci.enabled: true; CI cannot be
enabled in observability-only. The CI-only profile does not require Grafana
configuration or a Grafana credential.

## Provider Matrix

| Provider | CI read contract | SCM read contract | Mutation | Credentials |
| --- | --- | --- | --- | --- |
| GitHub Actions | status, failed-job analysis, redacted logs, dry-run remediation, failure analysis, optional telemetry/SCM | GitHub commits, comparisons, and pull requests | approval-gated failed jobs only | GitHub App files; separate read/write token paths are enforced by the adapter |
| Jenkins | status, failed-job analysis, redacted console evidence, dry-run remediation, failure analysis, optional telemetry/SCM | configured multibranch job change evidence | unsupported | anonymous read or username/API token; credentialed transport requires HTTPS |
| Bitbucket Cloud | pipeline status, failed-job analysis, redacted logs, dry-run remediation, failure analysis, optional telemetry/SCM | pull-request identity, diffstat, bounded diff evidence | unsupported | username:token or token plus username in a 0600 file; HTTPS required |
| Bitbucket Data Center | contract-only | contract-only | unsupported | [contract artifact only](docs/contracts/bitbucket-data-center-adapter.md); no built-in adapter or supported runtime profile |

Provider identity is metadata, not a caller-selected URL. GitHub Actions emits
github-actions and SCM emits github; Bitbucket Cloud emits bitbucket-cloud.
Run and job identifiers remain provider-native strings, including numeric
strings and supported UUID forms. Pos Satpam does not invent a cross-provider
numeric ID.

## URL And Reverse-Proxy Semantics

Provider configuration accepts exactly one of these forms:

~~~yaml
base_url: https://ci.example.test/reverse-proxy/2.0
~~~

or:

~~~yaml
endpoint:
  origin: https://ci.example.test
  path: /reverse-proxy/2.0
~~~

base_url is parsed into the same origin plus path pair. The origin must not
contain credentials, query data, or fragments. endpoint.origin must be only an
HTTP(S) origin, and endpoint.path must be an absolute path without query or
fragment. Do not configure both forms.

Provider request paths are appended under the configured path exactly once. A
request for /repositories/... therefore becomes
https://ci.example.test/reverse-proxy/2.0/repositories/..., never
.../2.0/reverse-proxy/2.0/.... Absolute provider request URLs are accepted only
when their origin matches the configured origin. Redirects are rejected.

GitHub is restricted to the HTTPS api.github.com origin. Jenkins allows
explicit loopback HTTP only for anonymous development; credentials always
require HTTPS. Bitbucket credentials always require HTTPS. A reverse proxy does
not change the provider capability or authorization policy.

## Evidence And Budgets

Every result includes schema version 1.0, observation time, provider class,
freshness, truncation, redaction status, warnings, and normalized data.

- **Observability:** at most 25 services, 100 alerts, 50 metric series, 1,440
  samples per series, and a 24-hour query/range window. Metric steps are 1
  second to 1 hour. Panel renders are at most 1,600 x 900 and dashboards at
  most 2,400 x 4,000; the visual adapter also enforces byte, timeout, and
  concurrency limits.
- **CI:** one log call accepts at most 200 redacted lines. Provider responses
  are capped at 2 MiB and freshness defaults to 300 seconds, configurable up
  to 3,600 seconds. Failure analysis accepts at most 10 jobs, 200 log lines,
  25 changed files, 40 lines per hunk request, and 20 telemetry signals.
- **SCM:** direct ci.scm_change_evidence has six budgets: maxBytes
  (256 KiB maximum, 64 KiB default), maxFiles (100 maximum, 100 default),
  maxHunks (100 maximum, 50 default), maxLines (10,000 maximum, 2,000
  default), maxProviderRequests (16 maximum, 4 default), and maxDurationMs
  (60,000 maximum, 10,000 default). Results report both limits and usage.
- **Aggregate failure analysis:** maxFiles 1-25, maxHunks 1-100, maxLines
  1-200, maxBytes 1 KiB-256 KiB, maxProviderRequests 2-32, and a positive time
  window no longer than 24 hours. Defaults derive from requested changes/log
  lines, with 64 KiB and 16 provider requests.
- **Telemetry contract:** metric, alert, log, and trace references are bounded
  to 100 items; metric samples are bounded to 1,440 per series; correlation
  windows are at most 24 hours. The current runtime bridge supplies named
  metrics only. It does not fetch raw logs or traces and never claims causality.
- **Observer:** defaults are a 30-second poll, 5-minute overlap, 24-hour
  initial lookback, 1-hour stale threshold, 100 items per page, and two pages
  per target. Failed jobs default to 5, log lines to 80, payloads to 128 KiB,
  delivery attempts to 4, delivery timeout to 10 seconds, and lease time to 60
  seconds. Each value has a strict schema maximum; pagination truncation is
  degraded health, not silent cursor advancement.

Oversized or unavailable evidence is marked explicitly. Raw provider payloads,
raw logs, credentials, and image bytes do not become normal logs or durable
observer state.

## CLI Commands And Doctor

| Command | Function |
| --- | --- |
| pos-satpam | stdio server |
| pos-satpam-http | private Streamable HTTP server |
| pos-satpam-doctor | metadata-only runtime readiness diagnostic |
| pos-satpam-observer | optional observer companion |
| pos-satpam-approval | operator approval CLI |

The commands are installed by the npm package from v0.3.0. From a source
checkout, run the built files directly: `node dist/cli.js`,
`node dist/http-cli.js`, `node dist/diagnostics/cli.js`,
`node dist/observer/cli.js` and `node dist/approval-cli.js`.

Run the doctor with paths, never with secret values:

~~~bash
node dist/diagnostics/cli.js \
  --config /private/path/provider-config.yml \
  --mcp-token /private/path/mcp-token \
  --grafana-token /private/path/grafana-token
~~~

For ci-only, omit --grafana-token. The doctor reports profile, provider
metadata, and file readiness without printing file contents.

## Operator Workflow And Rollback

1. Copy one profile example into a private deployment directory.
2. Create regular 0600 files for each credential and approval key; do not commit
   them or put values in YAML.
3. Run pos-satpam-doctor and fix every error before starting HTTP.
4. Start the server on loopback or a private interface with exact allowed Host
   values. Verify /healthz, bearer denial, MCP initialization, tool discovery,
   and one read-only call.
5. For CI, verify the repository/workflow allowlist and provider capability
   metadata. Treat provider text as untrusted evidence. Follow
   observe -> analyze -> redact/bound -> dry-run plan -> one approval -> rerun
   failed jobs -> observe; the observer never performs the approval or rerun.
6. Pin releases by npm version or OCI digest and retain the previous known-good
   reference and metadata-only observer state.

To roll back, stop the new process, restore the prior pinned npm version or OCI
digest with the same private configuration and credential file paths, and repeat
the health/MCP read-only checks. Do not delete observer state during a rollback
unless the deployment owner has confirmed a schema migration; state is
metadata-only and exists to prevent duplicate delivery. A rollback does not
revert provider-side changes, and Pos Satpam has no deployment or source
rollback authority.

## Chat Gateway And External AI Boundary

A chat gateway, a desktop client, or another AI client owns prompts, conversation state, and chat
delivery. Pos Satpam returns evidence over MCP. The optional observer sends fresh
success or failure events to operator-configured internal routes using an HMAC
over timestamp.body, a deterministic request ID, bounded retries, and no raw
log lines. The analysis route may trigger an external agent to call Pak
Satpam's read-only CI tools; the observer itself does not run an LLM, browse,
execute commands, rerun jobs, or send Discord/chat messages.

## Documentation

- [Architecture and DDD boundaries](docs/architecture.md)
- [Installation and portability](docs/portability.md)
- [Tool surface and budgets](docs/tool-surface.md)
- [Provider and CI contract](docs/ci-cd-integration-contract.md)
- [Operator runbook and rollback](docs/operator-runbook.md)
- [CI observer contract](docs/ci-observer.md)
- [Security model and forbidden capabilities](docs/security-model.md)
- [Client compatibility](docs/client-compatibility.md)
- [Verification and contributor workflow](docs/test-strategy.md)
- [Implementation status and blockers](docs/implementation-status.md)
- [Examples](examples/v1/README.md)

## License

Apache License 2.0. See [LICENSE](LICENSE).
