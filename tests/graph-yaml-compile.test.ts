import { execSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const SCRIPT = "python3 scripts/graph_yaml_compile.py";
const REPO_ROOT = process.cwd();

function resolveExportScript(): string | null {
  const candidates = [
    path.join(REPO_ROOT, "ai-ink-brain-api-python/tools/tech_graph_graph_export.py"),
    path.join(REPO_ROOT, "../ai-ink-brain-api-python/tools/tech_graph_graph_export.py"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return `python3 "${candidate}"`;
    }
  }
  return null;
}

const EXPORT_SCRIPT = resolveExportScript();

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

describe("F3 regression: .ai.md pollution does not affect graph export", () => {
  it(
    "污染 00_main.ai.md 后 graph-export 结果不变",
    {
      skip: EXPORT_SCRIPT === null,
    },
    () => {
      const graphJsonPath = path.join(REPO_ROOT, "docs/_tech_graph/graph.json");
      const originalGraphJson = fs.readFileSync(graphJsonPath, "utf-8");

      // Use a temp directory to avoid mutating the working tree
      const tempDir = fs.mkdtempSync(path.join(REPO_ROOT, "tmp-f3-"));
      const tempTechGraphDir = path.join(tempDir, "docs", "_tech_graph");

      try {
        fs.mkdirSync(tempTechGraphDir, { recursive: true });
        for (const entry of fs.readdirSync(path.join(REPO_ROOT, "docs/_tech_graph"))) {
          const src = path.join(REPO_ROOT, "docs/_tech_graph", entry);
          const dst = path.join(tempTechGraphDir, entry);
          fs.cpSync(src, dst, { recursive: true });
        }

        const tempAiMdPath = path.join(tempTechGraphDir, "00_main.ai.md");
        const originalAiMd = fs.readFileSync(tempAiMdPath, "utf-8");
        const pollutedAiMd = originalAiMd.replace(
          "flowchart TD",
          "flowchart TD\n    FAKE_NODE[[FAKE_NODE]] --> ANOTHER_FAKE_NODE[ANOTHER_FAKE_NODE]"
        );
        fs.writeFileSync(tempAiMdPath, pollutedAiMd, "utf-8");

        const exportResult = run(
          EXPORT_SCRIPT as string,
          `--input "${tempTechGraphDir}" --output "${tempTechGraphDir}/graph.json"`,
          { cwd: REPO_ROOT }
        );
        expect(exportResult.code).toBe(0);

        const newGraphJson = fs.readFileSync(
          path.join(tempTechGraphDir, "graph.json"),
          "utf-8"
        );
        const originalGraph = JSON.parse(originalGraphJson);
        const newGraph = JSON.parse(newGraphJson);
        // generated_at will differ because of export timestamp
        delete originalGraph.generated_at;
        delete newGraph.generated_at;
        expect(newGraph).toEqual(originalGraph);
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }
  );
});
