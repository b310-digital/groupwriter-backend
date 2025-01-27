import { afterEach, describe, expect, it, vi } from "vitest";
import { encrypt, decrypt } from "./crypto";
import { randomUUID } from "crypto";
describe("encrypt", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("encrypts data", () => {
    vi.stubEnv("VAULT_ENCRYPTION_KEY_BASE64", randomUUID().slice(0, 32));
    const iv = randomUUID();
    const encrypted = encrypt(Buffer.from("test"), iv.slice(0, 16));
    expect(encrypted).toBeDefined();
  });

  it("decrypts data", () => {
    vi.stubEnv("VAULT_ENCRYPTION_KEY_BASE64", randomUUID().slice(0, 32));
    const iv = randomUUID();
    const encrypted = encrypt(Buffer.from("test"), iv.slice(0, 16));
    const decrypted = decrypt(encrypted, iv.slice(0, 16));
    expect(decrypted).toEqual(Buffer.from("test"));
  });
});
