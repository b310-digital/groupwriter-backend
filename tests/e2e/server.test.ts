import { describe, expect, it } from "vitest";
import { TiptapTransformer } from "@hocuspocus/transformer";
import { HocuspocusProvider } from "@hocuspocus/provider";
import * as Y from "yjs";
import {
  newHocuspocus,
  newHocuspocusProvider,
} from "../helpers/hocuspocusHelpers";
import { Database } from "@hocuspocus/extension-database";
import { handleReadOnlyMode } from "../../src/utils/hooks";
import { PrismockClient } from "prismock";
import { createDocument } from "../../src/model/document";
import httpRouter from "../../src/httpRouter";
import { onRequestPayload } from "@hocuspocus/server";
import { Document } from "@prisma/client";
import {
  proseMirrorJson,
  proseMirrorYencodedStateUpdate,
} from "../helpers/e2eTestData";

describe("server", () => {
  it("should load a yjs document from the server", async () => {
    // Creates a Y.Doc from the ProseMirror editor JSON, see also:
    // https://github.com/ueberdosis/hocuspocus/blob/main/packages/transformer/src/Prosemirror.ts
    // https://github.com/yjs/y-prosemirror/blob/8033895b5d3c8397df2bbd1138d3d8ccb8557c95/README.md?plain=1#L152
    const ydoc = TiptapTransformer.toYdoc(proseMirrorJson, "default");
    const hocuspocus = await newHocuspocus({
      onLoadDocument() {
        return Promise.resolve(ydoc);
      },
    });
    const provider = await new Promise<HocuspocusProvider>((resolve) => {
      const p = newHocuspocusProvider(hocuspocus, {
        document: new Y.Doc(),
        name: "default",
        onSynced: () => {
          resolve(p);
        },
      });
    });
    expect(provider.document.getXmlFragment("default").toJSON()).toEqual(
      "<paragraph>Some test text</paragraph>",
    );
    await hocuspocus.server.destroy();
  });

  // This test should make sure, existing data can still be encoded, which might change at some point due to new protocols and updates
  it("should load an existing binary document from the server", async () => {
    const hocuspocus = await newHocuspocus({
      extensions: [
        new Database({
          fetch: () => {
            return Promise.resolve(proseMirrorYencodedStateUpdate);
          },
        }),
      ],
    });
    const provider = await new Promise<HocuspocusProvider>((resolve) => {
      const p = newHocuspocusProvider(hocuspocus, {
        document: new Y.Doc(),
        name: "default",
        onSynced: () => {
          resolve(p);
        },
      });
    });
    expect(provider.document.getXmlFragment("default").toJSON()).toEqual(
      "<paragraph>Some test text</paragraph>",
    );
    await hocuspocus.server.destroy();
  });

  it("sets the readOnly flag to false when the correct modification secret is provided", async () => {
    const prisma = new PrismockClient();
    const newDocument = await createDocument(prisma);

    const hocuspocus = await newHocuspocus({
      onAuthenticate: async ({ documentName, connectionConfig, token }) => {
        await handleReadOnlyMode(prisma, documentName, connectionConfig, token);
      },
      onLoadDocument: async ({ connectionConfig }) => {
        expect(connectionConfig.readOnly).toBe(false);
        return Promise.resolve();
      },
    });
    await new Promise<HocuspocusProvider>((resolve) => {
      const p = newHocuspocusProvider(hocuspocus, {
        document: new Y.Doc(),
        token: newDocument.modificationSecret,
        name: newDocument.id,
        onSynced: () => {
          resolve(p);
        },
      });
    });
    await hocuspocus.server.destroy();
  });

  it("sets the readOnly flag to true when the incorrect modification secret is provided", async () => {
    const prisma = new PrismockClient();
    const newDocument = await createDocument(prisma);

    const hocuspocus = await newHocuspocus({
      onAuthenticate: async ({ documentName, connectionConfig, token }) => {
        await handleReadOnlyMode(prisma, documentName, connectionConfig, token);
      },
      onLoadDocument: async ({ connectionConfig }) => {
        expect(connectionConfig.readOnly).toBe(true);
        return Promise.resolve();
      },
    });
    await new Promise<HocuspocusProvider>((resolve) => {
      const p = newHocuspocusProvider(hocuspocus, {
        document: new Y.Doc(),
        token: "wrong-token",
        name: newDocument.id,
        onSynced: () => {
          resolve(p);
        },
      });
    });
    await hocuspocus.server.destroy();
  });

  // tests if the extensions are loaded
  it("POST /documents", async () => {
    const prisma = new PrismockClient();
    const hocuspocus = await newHocuspocus({
      onRequest: async (data: onRequestPayload) => {
        await httpRouter(data, prisma);
      },
    });
    const response = await fetch(`${hocuspocus.server.httpURL}/documents`, {
      method: "POST",
    });

    expect(((await response.json()) as Document).id).toBeDefined();
    expect(response.status).toBe(200);
    await hocuspocus.server.destroy();
  });
});
