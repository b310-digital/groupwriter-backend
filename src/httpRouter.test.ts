import { describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import httpRouter from "./httpRouter";
import { onRequestPayload } from "@hocuspocus/server";
import {
  handleCreateDocumentRequest,
  handleDeleteDocumentRequest,
  handleDeleteImageRequest,
  handleGetImageRequest,
  handleUploadImageRequest,
} from "./httpHandler";

vi.mock("./httpHandler");

describe("httpRouter", () => {
  it("posts documents", async () => {
    const payload = mock<onRequestPayload>();
    payload.request.method = "POST";
    payload.request.url = "/documents";
    payload.request.headers = {};

    await expect(httpRouter(payload, null)).rejects.toThrow();
    expect(handleCreateDocumentRequest).toHaveBeenCalled();
  });

  it("deletes documents", async () => {
    const payload = mock<onRequestPayload>();
    payload.request.method = "DELETE";
    payload.request.url = "/documents";
    payload.request.headers = {};

    await expect(httpRouter(payload, null)).rejects.toThrow();
    expect(handleDeleteDocumentRequest).toHaveBeenCalled();
  });

  it("creates images", async () => {
    const payload = mock<onRequestPayload>();
    payload.request.method = "POST";
    payload.request.url = "/documents/abc/images";
    payload.request.headers = {};

    await expect(httpRouter(payload, null)).rejects.toThrow();
    expect(handleUploadImageRequest).toHaveBeenCalled();
  });

  it("deletes images", async () => {
    const payload = mock<onRequestPayload>();
    payload.request.method = "DELETE";
    payload.request.url = "/images/123";
    payload.request.headers = {};

    await expect(httpRouter(payload, null)).rejects.toThrow();
    expect(handleDeleteImageRequest).toHaveBeenCalled();
  });

  it("gets images", async () => {
    const payload = mock<onRequestPayload>();
    payload.request.method = "GET";
    payload.request.url = "/images/123";
    payload.request.headers = {};

    await expect(httpRouter(payload, null)).rejects.toThrow();
    expect(handleGetImageRequest).toHaveBeenCalled();
  });
});
