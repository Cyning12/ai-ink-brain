// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Component, type ReactNode } from "react";

import { OpsChatClient } from "@/components/ops/OpsChatClient";

class TestErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <div data-testid="error">{this.state.error.message}</div>;
    }
    return this.props.children;
  }
}

describe("OpsChatClient", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function createMockFetch(handlers: { urlPattern: RegExp; response: unknown; status?: number }[]) {
    return vi.fn().mockImplementation((url: string) => {
      for (const handler of handlers) {
        if (handler.urlPattern.test(url)) {
          return Promise.resolve(
            new Response(JSON.stringify(handler.response), {
              status: handler.status ?? 200,
            }),
          );
        }
      }
      return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
    });
  }

  it("多轮追问保留历史消息", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      createMockFetch([
        {
          urlPattern: /\/api\/ops\/chat\/models$/,
          response: {
            provider: "siliconflow",
            models: [{ id: "m1", label: "M1", test_only: false }],
            default_model: "m1",
            auto_fallback: false,
          },
        },
        {
          urlPattern: /\/api\/ops\/chat\/messages$/,
          response: { run_id: "run-1", route: "fast", status: "done", answer: "答案一" },
        },
        {
          urlPattern: /\/api\/ops\/runs\/run-1$/,
          response: {
            id: "run-1",
            repo_id: "",
            session_id: "sess-1",
            query: "问题一",
            route: "fast",
            status: "done",
            final_answer: { answer: "答案一" },
            retry_token: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
        {
          urlPattern: /\/api\/ops\/runs\/run-1\/events/,
          response: { run_id: "run-1", after_seq: 0, events: [] },
        },
      ]),
    );

    render(
      <TestErrorBoundary>
        <OpsChatClient sessionId="sess-1" />
      </TestErrorBoundary>,
    );

    const input = await screen.findByPlaceholderText("输入问题，例如：最近指标趋势、#545 适合我吗、P0 完成没");
    const sendButton = screen.getByRole("button", { name: "发送" });

    await user.type(input, "问题一");
    await user.click(sendButton);

    const errorEl = screen.queryByTestId("error");
    if (errorEl) {
      throw new Error(`Component crashed: ${errorEl.textContent}`);
    }

    await waitFor(() => {
      expect(screen.getByText("问题一")).toBeTruthy();
      expect(screen.getByText("答案一")).toBeTruthy();
    });
  });

  it("clarify 路由展示澄清卡片并允许输入", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      createMockFetch([
        {
          urlPattern: /\/api\/ops\/chat\/models$/,
          response: {
            provider: "siliconflow",
            models: [{ id: "m1", label: "M1", test_only: false }],
            default_model: "m1",
            auto_fallback: false,
          },
        },
        {
          urlPattern: /\/api\/ops\/chat\/messages$/,
          response: {
            run_id: "run-clarify",
            route: "clarify",
            status: "clarify",
            needs_clarification: true,
            clarify_question: "你想比较哪方面？",
          },
        },
      ]),
    );

    render(
      <TestErrorBoundary>
        <OpsChatClient sessionId="sess-1" />
      </TestErrorBoundary>,
    );

    const input = await screen.findByPlaceholderText("输入问题，例如：最近指标趋势、#545 适合我吗、P0 完成没");
    const sendButton = screen.getByRole("button", { name: "发送" });

    await user.type(input, "比较 #545 和 #546");
    await user.click(sendButton);

    const errorEl = screen.queryByTestId("error");
    if (errorEl) {
      throw new Error(`Component crashed: ${errorEl.textContent}`);
    }

    await waitFor(() => {
      expect(screen.getByText(/需要澄清/)).toBeTruthy();
      expect(screen.getByText("你想比较哪方面？")).toBeTruthy();
    });

    expect(screen.getByPlaceholderText("补充信息…")).toBeTruthy();
    expect(screen.getByRole("button", { name: "跳过" })).toBeTruthy();
  });

  it("checkpoint.resume 事件展示续跑提示", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      createMockFetch([
        {
          urlPattern: /\/api\/ops\/chat\/models$/,
          response: {
            provider: "siliconflow",
            models: [{ id: "m1", label: "M1", test_only: false }],
            default_model: "m1",
            auto_fallback: false,
          },
        },
        {
          urlPattern: /\/api\/ops\/chat\/messages$/,
          response: { run_id: "run-cp", route: "react", status: "running" },
        },
        {
          urlPattern: /\/api\/ops\/runs\/run-cp$/,
          response: {
            id: "run-cp",
            repo_id: "",
            session_id: "sess-1",
            query: "继续分析",
            route: "react",
            status: "running",
            final_answer: null,
            retry_token: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
        {
          urlPattern: /\/api\/ops\/runs\/run-cp\/events/,
          response: {
            run_id: "run-cp",
            after_seq: 0,
            events: [
              {
                run_id: "run-cp",
                seq: 1,
                ts_ms: 1,
                node_id: null,
                agent_role: "orchestrator",
                event_type: "checkpoint.resume",
                payload: { from_run_id: "run-prev", step: 3 },
              },
            ],
          },
        },
      ]),
    );

    render(
      <TestErrorBoundary>
        <OpsChatClient sessionId="sess-1" />
      </TestErrorBoundary>,
    );

    const input = await screen.findByPlaceholderText("输入问题，例如：最近指标趋势、#545 适合我吗、P0 完成没");
    const sendButton = screen.getByRole("button", { name: "发送" });

    await user.type(input, "继续分析");
    await user.click(sendButton);

    const errorEl = screen.queryByTestId("error");
    if (errorEl) {
      throw new Error(`Component crashed: ${errorEl.textContent}`);
    }

    await waitFor(() => {
      expect(screen.getByText(/从运行/)).toBeTruthy();
    });
  });

  it("react.max_steps 事件展示步数上限提示", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      createMockFetch([
        {
          urlPattern: /\/api\/ops\/chat\/models$/,
          response: {
            provider: "siliconflow",
            models: [{ id: "m1", label: "M1", test_only: false }],
            default_model: "m1",
            auto_fallback: false,
          },
        },
        {
          urlPattern: /\/api\/ops\/chat\/messages$/,
          response: { run_id: "run-ms", route: "react", status: "running" },
        },
        {
          urlPattern: /\/api\/ops\/runs\/run-ms$/,
          response: {
            id: "run-ms",
            repo_id: "",
            session_id: "sess-1",
            query: "复杂问题",
            route: "react",
            status: "running",
            final_answer: null,
            retry_token: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
        {
          urlPattern: /\/api\/ops\/runs\/run-ms\/events/,
          response: {
            run_id: "run-ms",
            after_seq: 0,
            events: [
              {
                run_id: "run-ms",
                seq: 1,
                ts_ms: 1,
                node_id: null,
                agent_role: "react",
                event_type: "react.max_steps",
                payload: { max_steps: 8 },
              },
            ],
          },
        },
      ]),
    );

    render(
      <TestErrorBoundary>
        <OpsChatClient sessionId="sess-1" />
      </TestErrorBoundary>,
    );

    const input = await screen.findByPlaceholderText("输入问题，例如：最近指标趋势、#545 适合我吗、P0 完成没");
    const sendButton = screen.getByRole("button", { name: "发送" });

    await user.type(input, "复杂问题");
    await user.click(sendButton);

    const errorEl = screen.queryByTestId("error");
    if (errorEl) {
      throw new Error(`Component crashed: ${errorEl.textContent}`);
    }

    await waitFor(() => {
      expect(screen.getByText(/当前运行已触发最大步数限制/)).toBeTruthy();
    });
  });
});
