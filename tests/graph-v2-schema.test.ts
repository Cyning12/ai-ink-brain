import { execSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const REPO_ROOT = process.cwd();
const SCHEMA_PATH = path.join(REPO_ROOT, "docs/_tech_graph/graph_v2.schema.json");
const GRAPH_PATH = path.join(REPO_ROOT, "docs/_tech_graph/graph.json");

function run(cmd: string): { stdout: string; stderr: string; code: number } {
  try {
    const stdout = execSync(cmd, {
      cwd: REPO_ROOT,
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

describe("graph_v2.schema.json", () => {
  it("schema 文件存在且为合法 JSON", () => {
    const raw = fs.readFileSync(SCHEMA_PATH, "utf-8");
    const schema = JSON.parse(raw) as Record<string, unknown>;
    expect(schema.schema_version).toBe("graph_v2");
    expect(schema.required_root_keys).toContain("schema_version");
    expect(schema.required_root_keys).toContain("nodes");
    expect(schema.required_root_keys).toContain("edges");
  });

  it("schema 包含必要的元数据字段", () => {
    const raw = fs.readFileSync(SCHEMA_PATH, "utf-8");
    const schema = JSON.parse(raw) as Record<string, unknown>;
    expect(schema.default_graph_id).toBe("main");
    expect(schema.allowed_node_kinds).toContain("flow");
    expect(schema.allowed_node_kinds).toContain("struct");
    expect(schema.allowed_node_kinds).toContain("external");
    expect(schema.required_node_keys).toEqual(["id", "label"]);
    expect(schema.required_edge_keys).toContain("mark");
    expect(schema.required_edge_keys).toContain("anchors");
    expect(schema.required_anchor_keys).toEqual(["path", "symbol"]);
  });

  it("graph.json 存在且 schema_version 为 graph_v2", () => {
    const raw = fs.readFileSync(GRAPH_PATH, "utf-8");
    const graph = JSON.parse(raw) as Record<string, unknown>;
    expect(graph.schema_version).toBe("graph_v2");
    expect(Array.isArray(graph.nodes)).toBe(true);
    expect(Array.isArray(graph.edges)).toBe(true);
  });

  it("pnpm tech-graph:schema-check 返回 0", () => {
    const result = run("pnpm tech-graph:schema-check");
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("OK: graph_v2 schema");
  });
});
