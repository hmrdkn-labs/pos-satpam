# Changelog

All notable changes to Pos Satpam are documented here. A changelog entry is not
a publication receipt. Entries dated before 2026-11-26 were written when the
project was named Pak Satpam; the npm package, image and registry names below
are recorded as they were at the time.

## [Unreleased]

- Rename the public TypeScript MCP server to Pos Satpam everywhere: npm package
  `@hmrdkn-labs/pos-satpam`, registry ID `io.github.hmrdkn-labs/pos-satpam`,
  image `ghcr.io/hmrdkn-labs/pos-satpam`, repository URLs and the README badge.
  Clean cutover with no aliases; the `pak-satpam*` and `observability-agent-mcp*`
  executables are removed. Binaries are now `pos-satpam`, `pos-satpam-http`,
  `pos-satpam-doctor`, `pos-satpam-observer` and `pos-satpam-approval`. Images
  published as `ghcr.io/hmrdkn-labs/pak-satpam` stay under that name as history;
  the new image appears at the next release.
- Label demo data: the stdio server's built-in fake provider now adds
  `"notice": "demo data: no provider configured"` next to `providerClass: "fake"`
  in every evidence envelope.
- `pos-satpam-http` with missing or invalid startup configuration prints one line
  to stderr and exits 2 instead of printing a stack trace.
- Rewrite the README lead, current condition and install routes; list only routes
  that work today and add the shell-bypass caveat for the approval gate.
- Remove the internal goal prompt under `docs/goals` and refresh
  `docs/implementation-status.md` to 2026-11-26.
- Fix the 0.2.2 gap below. The 0.2.2 entry had been relabelled 0.2.3 when v0.2.3
  was prepared.
- Clear npm audit advisories and give the published-image verifier test an
  explicit timeout, so `validate` is green again.

## [0.2.5] - 2026-07-17

- Classify shared analysis-deadline cancellation deterministically as timeout,
  independent of timer scheduling order.

## [0.2.4] - 2026-07-17

- Add the provider-neutral event envelope with deterministic replay,
  correlation, redaction, and validation boundaries.
- Bound one recommendation across failure evidence collection and analysis,
  while keeping status, routing, deployment, rollback, and rerun authority in
  deterministic code.

## [0.2.3] - 2026-07-16

- Default CI runtime profiles to the read-only tool surface.
- Reduce observer notification noise.

## [0.2.2] - 2026-07-15

- Restore the private compatibility boundary by keeping ordinary CI read profiles on the legacy five-tool surface and exposing failure analysis only with a validated explicit forensics provider.
- Fail closed for partial forensics providers while preserving configured SCM and telemetry tools.

## [0.2.1] - 2026-07-15

- Exclude BuildKit provenance and SPDX SBOM `unknown/unknown` attestation
  manifests from runtime platform comparison while continuing to require both
  attestation formats for every published runtime platform.
- Record that v0.2.0 was published but its post-publish image verification
  failed because the verifier counted attestation manifests as runtime
  platforms; v0.2.1 contains the verifier correction.

## [0.2.0] - 2026-07-15

### Goal 19 CP3 Documentation And Contract

- Add a contract-only Bitbucket Data Center provider artifact, normalized
  evidence schema, fixture, and fail-closed runtime/no-tool tests; no Data
  Center adapter or runtime support is added.
- Document the direct provider-neutral SCM evidence contract and all six SCM
  budgets.
- Document GitHub Actions, Jenkins, Bitbucket Cloud, and Bitbucket Data Center
  contract-only status.
- Document provider-native IDs and origin/path URL semantics for reverse proxies.
- Document bounded CI, SCM, metric, telemetry, render, observer, and approval
  budgets.
- Clarify webhook/poll dedupe, stale suppression, the external chat-gateway/AI
  boundary, forbidden capabilities, operator workflows, rollback, and current
  publication/deployment blockers.
- Preserve the npm and OCI release identities without changing package version or
  release workflows.

### Release Identity

- npm package: @hmrdkn-labs/pak-satpam.
- MCP name: io.github.hmrdkn-labs/pak-satpam.
- OCI image: ghcr.io/hmrdkn-labs/pak-satpam.
- Legacy observability-agent-mcp executable aliases remain supported.

### Release Hardening

- Pin both OCI build stages to the official Node multi-platform digest.
- Exercise real OCI stdio and private HTTP MCP clients on linux/amd64 and
  linux/arm64 during non-publishing validation.
- Enforce strict semantic version and dated changelog consistency, immutable
  version/SHA image tags, and post-publish manifest, provenance, and SPDX SBOM
  verification.

This entry records the source/documentation state. It does not claim that npm,
GHCR, a private edge runtime, or a chat-gateway route was published or deployed.
