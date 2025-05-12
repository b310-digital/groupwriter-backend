import type { ServerConfiguration } from "@hocuspocus/server";
import { Server, Hocuspocus } from "@hocuspocus/server";
import {
  HocuspocusProvider,
  HocuspocusProviderConfiguration,
  HocuspocusProviderWebsocketConfiguration,
  HocuspocusProviderWebsocket,
} from "@hocuspocus/provider";

// This module includes copies of some hocuspocus helper function from the hocuspocus library, as these are not exported.

// https://github.com/ueberdosis/hocuspocus/blob/main/tests/utils/newHocuspocus.ts
export const newHocuspocus = (options?: Partial<ServerConfiguration>) => {
  const server = new Server({
    // We don’t need the logging in testing.
    quiet: true,
    // Binding something port 0 will end up on a random free port.
    // That’s helpful to run tests concurrently.
    port: 0,
    // Add or overwrite settings, depending on the test case.
    ...options,
  });

  return server.listen();
};

export const newHocuspocusProviderWebsocket = (
  hocuspocus: Hocuspocus,
  options: Partial<Omit<HocuspocusProviderWebsocketConfiguration, "url">> = {},
) => {
  return new HocuspocusProviderWebsocket({
    // We don’t need which port the server is running on, but
    // we can get the URL from the passed server instance.
    url: hocuspocus.server.webSocketURL,
    // Pass a polyfill to use WebSockets in a Node.js environment.
    WebSocketPolyfill: WebSocket,
    ...options,
  });
};

export const newHocuspocusProvider = (
  hocuspocus: Hocuspocus,
  options: Partial<HocuspocusProviderConfiguration> = {},
  websocketOptions: Partial<HocuspocusProviderWebsocketConfiguration> = {},
  websocketProvider?: HocuspocusProviderWebsocket,
): HocuspocusProvider => {
  const provider = new HocuspocusProvider({
    websocketProvider:
      websocketProvider ??
      newHocuspocusProviderWebsocket(hocuspocus, websocketOptions),
    // Just use a generic document name for all tests.
    name: "hocuspocus-test",
    // Add or overwrite settings, depending on the test case.
    ...options,
  });
  provider.attach();
  return provider;
};
