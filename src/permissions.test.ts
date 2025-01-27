import { describe, expect, it } from "vitest";
import { checkPermission } from "./permissions";
import { createDocument } from "./model/document";
import { PrismockClient } from "prismock";
import { mock } from "vitest-mock-extended";
import { ServerResponse, IncomingMessage } from "http";

describe("checkPermission", () => {
  it("resolves if the secret is correct", async () => {
    const prisma = new PrismockClient();
    const document = await createDocument(prisma);
    const response = mock<ServerResponse<IncomingMessage>>();
    await expect(
      checkPermission(
        prisma,
        document.id,
        document.modificationSecret,
        response,
      ),
    ).resolves.toBeUndefined();
    expect(response.writeHead.mock.calls.length).toEqual(0);
  });

  it("rejects if the secret is incorrect", async () => {
    const prisma = new PrismockClient();
    const document = await createDocument(prisma);
    const response = mock<ServerResponse<IncomingMessage>>();
    await expect(
      checkPermission(prisma, document.id, "wrong", response),
    ).rejects.toThrow();
    expect(response.writeHead.mock.calls[0][0]).toEqual(403);
  });
});
