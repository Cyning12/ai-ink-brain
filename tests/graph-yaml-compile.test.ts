import { execSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const SCRIPT = "python3 scripts/graph_yaml_compile.py";
const REPO_ROOT = process.cwd();

function run(
  cmd: string,
  args: string,
  options?: { cwd?: string }
): { stdout: string; stderr: string; code: number } {
  try {
    const stdout = execSync(`${cmd} ${args}`, {
      cwd: options?.cwd ?? REPO_ROOT,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return { stdout, stderr: "", code: 0 };
  } catch (error: unknown) {
    const execError = error as { stdout?: Buffer; stderr?: Buffer; status?: number };
    return {
      stdout: execError.stdout?.toString() ?? "",
      stderr: execError.stderr?.toString() ?? "",
      code: execError.status ?? 1,
    };
  }
}

describe("graph_yaml_compile.py", () => {
  it("脚本存在且可执行", () => {
    const result = run(SCRIPT, "--help");
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("--graph-id");
    expect(result.stdout).toContain("--all");
    expect(result.stdout).toContain("--check");
  });

  it("--all 在没有 .graph.yaml 时返回 0", () => {
    const result = run(SCRIPT, "--all");
    expect(result.code).toBe(0);
  });

  it("--all --check 在没有 .graph.yaml 时返回 0", () => {
    const result = run(SCRIPT, "--all --check");
    expect(result.code).toBe(0);
  });

  it("对不存在的 graph-id 返回 1", () => {
    const result = run(SCRIPT, "--graph-id non_existent_graph");
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("YAML source not found");
  });
});

describe("G0: .ai.md files removed", () => {
  it("docs/_tech_graph 下没有 .ai.md 文件", () => {
    const entries = fs.readdirSync(path.join(REPO_ROOT, "docs/_tech_graph"));
    const aiMdFiles = entries.filter((e) => e.endsWith(".ai.md"));
    expect(aiMdFiles).toEqual([]);
  });
});
