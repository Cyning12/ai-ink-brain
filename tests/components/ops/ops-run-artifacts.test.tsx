// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";

import { OpsRunArtifacts } from "@/components/ops/OpsRunArtifacts";

describe("OpsRunArtifacts", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("有 artifact 时渲染 kind 与 JSON 摘要", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            run_id: "run-1",
            artifacts: [
              {
                run_id: "run-1",
                kind: "react_summary",
                payload: { answer: "最终答案", steps: 3 },
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    );

    render(<OpsRunArtifacts runId="run-1" expanded={true} onExpandedChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("react_summary")).toBeTruthy();
    });
    expect(screen.getByText(/最终答案/)).toBeTruthy();
  });

  it("404 时静默降级不渲染内容", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ok: false, error: "Not found" }), { status: 404 }),
      ),
    );

    const { container } = render(
      <OpsRunArtifacts runId="run-1" expanded={true} onExpandedChange={() => {}} />,
    );

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it("fetch 异常时静默降级", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

    const { container } = render(
      <OpsRunArtifacts runId="run-1" expanded={true} onExpandedChange={() => {}} />,
    );

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });
});
