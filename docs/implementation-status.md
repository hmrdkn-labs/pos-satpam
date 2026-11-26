# Implementation Status

Last reviewed: 2026-11-26
Source evidence: the `phase-a` branch (draft PR #14 against `main`). This status
intentionally avoids a self-stale commit SHA. Durable evidence for the
contract-only provider: `docs/contracts/bitbucket-data-center-adapter.md` and
`tests/bitbucket-data-center-contract.test.ts`.

## Release State

| Route | State on 2026-11-26 |
| --- | --- |
| npm `@hmrdkn-labs/pos-satpam` | Not published. Planned from v0.3.0. Earlier publish attempts under the old package name (v0.2.0 to v0.2.2) failed and nothing is on the registry. |
| MCP registry `io.github.hmrdkn-labs/pos-satpam` | Not listed. |
| Image `ghcr.io/hmrdkn-labs/pos-satpam` | Not yet published. It appears at the next release. Images 0.2.0 to 0.2.5 exist under a previous image name, recorded in the changelog, as history. |
| GitHub release assets | None. |
| From source | Works. `npm ci`, `npm run build`, `node dist/cli.js`. |

The package version in this branch is 0.2.5 and has never been published. The
last GitHub release is v0.2.2. The `validate` workflow on `main` had been red
since 2026-07-21; the fixes (dependency audit advisories, a load-sensitive test
timeout) are on this branch and not merged yet.

## Implemented Product

- Package `@hmrdkn-labs/pos-satpam`, registry identity
  `io.github.hmrdkn-labs/pos-satpam`, binaries `pos-satpam`, `pos-satpam-http`,
  `pos-satpam-doctor`, `pos-satpam-observer` and `pos-satpam-approval`.
- stdio and private stateless Streamable HTTP transports.
- observability-only, ci-only and combined runtime profiles.
- The stdio server runs a deterministic fake provider and labels its output
  `"notice": "demo data: no provider configured"`. It reads no real system.
- `pos-satpam-http` with missing required environment prints one line to stderr
  and exits 2.
- Bounded Grafana, Prometheus-compatible metrics, vmalert/Alertmanager, CI, SCM
  and telemetry evidence.
- Non-root OCI packaging for linux/amd64 and linux/arm64 with SBOM and
  provenance attestations. Images are not signed.
- Metadata-only doctor diagnostics and file-injected credentials.
- Optional observer polling, verified GitHub `workflow_run` webhook intake,
  durable lease and dedupe state, stale suppression, signed routes, sanitized
  health and metrics, and state-transition-only notifications.

## Local Contract Coverage

Tests cover:

- SCM selectors, provider-neutral results, all six budgets and digest output;
- GitHub Actions, Jenkins and Bitbucket Cloud read adapters against recorded
  fixtures;
- Jenkins and Bitbucket reverse-proxy path joining without duplicate prefixes;
- provider-native numeric and UUID identifiers;
- bounded logs, SCM patches, metrics, telemetry references and non-causal
  correlations;
- webhook and poll duplicate suppression, restart state, stale suppression,
  bounded pagination and signed delivery;
- capability isolation and the GitHub-only approval-gated rerun.

Only the GitHub path has been run against a live provider. Jenkins and Bitbucket
Cloud are covered by fixtures and have not been exercised live.

## Provider Status

| Provider | Read | SCM | Rerun | Status |
| --- | --- | --- | --- | --- |
| GitHub Actions | implemented | GitHub implemented | approval-gated failed jobs | built-in; run live once |
| Jenkins | implemented | multibranch implemented | unsupported | built-in read-only; fixtures only |
| Bitbucket Cloud | implemented | pull-request/diff implemented | unsupported | built-in read-only; fixtures only |
| Bitbucket Data Center | contract-only | contract-only | unsupported | no adapter |

The telemetry runtime bridge queries named metrics only. Log and trace types are
bounded schema references, not raw log or trace provider integrations. Bitbucket
Data Center remains deferred until a separately reviewed adapter, runtime
configuration and tool-surface gate exist.

## Known Gaps

- CI runtime configuration requires a GitHub App. A read-only token over stdio
  is not available yet.
- `ci.workflow_status` and `ci.failed_job_analysis` have no branch or ref input,
  so a status call can report a pull-request run while the default branch is
  red.
- Token savings against `gh run view --log-failed` have not been measured; no
  number is claimed.
- Private HTTP uses a static file-injected bearer and exact Host allowlists. It
  is not public OAuth, multi-tenant authorization or a public endpoint. Public
  exposure stays blocked until OAuth protected-resource metadata,
  issuer/audience/scope validation, Origin policy, ingress controls and tenant
  isolation exist.
- The approval gate holds only if the agent has no other CI-write credential,
  such as a shell with a `gh` token. See the README.
- The private edge observer and chat-gateway route are deployment-owner work and
  are not proven live by this repository.

## Verification

The repository-defined aggregate gate is `npm run validate`. The foundation
script also checks required docs, package identity, forbidden private and secret
surfaces, workflow YAML and local Markdown links. Multi-architecture and
container runtime checks are separate non-publishing gates in the validation
workflow, which runs on pull requests and pushes to `main`.

Design evidence is kept in the architecture decisions and the changelog. Neither
is a publication receipt.
