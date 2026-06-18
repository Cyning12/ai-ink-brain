"""Tests for graph_v2 schema dual-track validation."""

import json
import subprocess
import sys
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[1]
SCHEMA_PATH = REPO_ROOT / "docs" / "_tech_graph" / "graph_v2.schema.json"
GRAPH_PATH = REPO_ROOT / "docs" / "_tech_graph" / "graph.json"
SCRIPT_PATH = REPO_ROOT / "scripts" / "tech_graph_schema_check.py"


def test_schema_file_exists_and_is_valid_json():
    assert SCHEMA_PATH.is_file(), "graph_v2.schema.json must exist"
    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    assert schema["schema_version"] == "graph_v2"
    assert "required_root_keys" in schema
    assert "nodes" in schema["required_root_keys"]
    assert "edges" in schema["required_root_keys"]


def test_schema_has_required_meta_fields():
    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    assert schema["default_graph_id"] == "main"
    assert set(schema["allowed_node_kinds"]) == {"flow", "struct", "external"}
    assert schema["required_node_keys"] == ["id", "label"]
    assert "mark" in schema["required_edge_keys"]
    assert "anchors" in schema["required_edge_keys"]
    assert schema["required_anchor_keys"] == ["path", "symbol"]


def test_graph_json_matches_schema_version():
    assert GRAPH_PATH.is_file(), "graph.json must exist"
    graph = json.loads(GRAPH_PATH.read_text(encoding="utf-8"))
    assert graph["schema_version"] == "graph_v2"
    assert isinstance(graph["nodes"], list)
    assert isinstance(graph["edges"], list)


def test_schema_check_script_passes():
    result = subprocess.run(
        [sys.executable, str(SCRIPT_PATH)],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0, result.stderr
    assert "OK: graph_v2 schema" in result.stdout


def test_schema_check_fails_when_graph_json_is_empty(tmp_path: Path):
    bad_graph = tmp_path / "graph.json"
    bad_graph.write_text("{}", encoding="utf-8")
    result = subprocess.run(
        [sys.executable, str(SCRIPT_PATH), "--graph", str(bad_graph)],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
    )
    assert result.returncode != 0
    assert "schema 校验失败" in result.stderr or "缺少根字段" in result.stderr
