// @vitest-environment jsdom

import { act, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

import Component from "./component";

describe("widgets/iframe/component", () => {
  it("renders an iframe with the configured src/title and classes", () => {
    const service = {
      widget: {
        type: "iframe",
        name: "My Frame",
        src: "http://example.test",
        classes: "h-10 w-10",
        allowScrolling: "no",
      },
    };

    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    const iframe = container.querySelector("iframe");
    expect(iframe).toBeTruthy();
    expect(iframe.getAttribute("src")).toBe("http://example.test");
    expect(iframe.getAttribute("title")).toBe("My Frame");
    expect(iframe.getAttribute("name")).toBe("My Frame");
    expect(iframe.getAttribute("scrolling")).toBe("no");
    expect(iframe.className).toContain("h-10 w-10");
  });

  it("updates iframe src when iframeParamsChange event is dispatched", async () => {
    const service = {
      widget: {
        type: "iframe",
        name: "Dynamic Frame",
        src: "http://example.test/{{host}}",
        classes: "h-10 w-10",
      },
    };

    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    // Initially, the placeholder should be empty
    let iframe = container.querySelector("iframe");
    expect(iframe.getAttribute("src")).toBe("http://example.test/");

    // Dispatch the custom event with new params
    act(() => {
      window.dispatchEvent(new CustomEvent("iframeParamsChange", { detail: { host: "test" } }));
    });

    // Wait for the component to re-render with the new src
    await waitFor(() => {
      iframe = container.querySelector("iframe");
      expect(iframe.getAttribute("src")).toBe("http://example.test/test");
    });
  });

  it("handles multiple params in iframe src", async () => {
    const service = {
      widget: {
        type: "iframe",
        name: "Multi Param Frame",
        src: "http://{{test1}}.example.test/{{test2}}",
        classes: "h-10 w-10",
      },
    };

    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    act(() => {
      window.dispatchEvent(new CustomEvent("iframeParamsChange", { detail: { test1: "test1", test2: "test2" } }));
    });

    await waitFor(() => {
      const iframe = container.querySelector("iframe");
      expect(iframe.getAttribute("src")).toBe("http://test1.example.test/test2");
    });
  });
});
