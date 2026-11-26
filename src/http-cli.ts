#!/usr/bin/env node
import process from "node:process";

import { createObservabilityHttpApp } from "./http/create-http-app.js";
import { loadRuntimeConfiguration } from "./runtime/load-runtime-configuration.js";

let app: ReturnType<typeof createObservabilityHttpApp>;
let host: string;
let port: number;
try {
  host = process.env.MCP_HTTP_HOST ?? "127.0.0.1";
  port = parsePort(process.env.MCP_HTTP_PORT ?? "8765");
  const allowedHosts = requiredEnvironment("MCP_HTTP_ALLOWED_HOSTS")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const grafanaTokenPath = optionalEnvironment("GRAFANA_TOKEN_FILE");
  const runtime = loadRuntimeConfiguration({
    configPath: requiredEnvironment("OBSERVABILITY_PROVIDER_CONFIG"),
    ...(grafanaTokenPath === undefined ? {} : { grafanaTokenPath }),
    mcpTokenPath: requiredEnvironment("MCP_TOKEN_FILE"),
    fetch: globalThis.fetch.bind(globalThis),
  });
  app = createObservabilityHttpApp({
    ...(runtime.provider === undefined ? {} : { provider: runtime.provider }),
    ...(runtime.visualProvider === undefined ? {} : { visualProvider: runtime.visualProvider }),
    ...(runtime.visualAllowlist === undefined ? {} : { visualAllowlist: runtime.visualAllowlist }),
    ...(runtime.ci === undefined ? {} : { ci: runtime.ci }),
    bearerToken: runtime.bearerToken,
    host,
    allowedHosts,
  });
} catch (error) {
  const reason = error instanceof Error ? error.message.split("\n")[0] : "invalid configuration";
  process.stderr.write(`pos-satpam-http: ${reason}\n`);
  process.exit(2);
}

const listener = app.listen(port, host, (error?: Error) => {
  if (error !== undefined) {
    process.stderr.write("pos-satpam-http: startup failed\n");
    process.exitCode = 1;
    return;
  }
  process.stderr.write("pos-satpam-http: transport ready\n");
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    listener.close(() => process.exit(0));
  });
}

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (value === undefined || value.length === 0) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function optionalEnvironment(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value === undefined || value.length === 0 ? undefined : value;
}

function parsePort(value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65_535) {
    throw new Error("MCP_HTTP_PORT must be an integer between 1 and 65535");
  }
  return parsed;
}
