import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

const projectRoot = process.cwd();
let outDir = "";

describe("HTTP entry without configuration", () => {
  beforeAll(() => {
    outDir = mkdtempSync(join(projectRoot, "node_modules", ".pos-satpam-http-cli-"));
    const build = spawnSync(
      process.execPath,
      [join(projectRoot, "node_modules", "typescript", "bin", "tsc"), "-p", "tsconfig.build.json", "--outDir", outDir, "--incremental", "false"],
      { cwd: projectRoot, encoding: "utf8" },
    );
    expect(build.status, build.stdout + build.stderr).toBe(0);
  }, 180_000);

  afterAll(() => {
    if (outDir !== "") rmSync(outDir, { recursive: true, force: true });
  });

  it("prints exactly one stderr line, no stack trace, and exits 2", () => {
    const result = spawnSync(process.execPath, [join(outDir, "http-cli.js")], {
      cwd: projectRoot,
      env: {},
      encoding: "utf8",
    });

    expect(result.status).toBe(2);
    expect(result.stdout).toBe("");
    expect(result.stderr).toBe("pos-satpam-http: MCP_HTTP_ALLOWED_HOSTS is required\n");
    expect(result.stderr).not.toContain("    at ");
  }, 30_000);
});
