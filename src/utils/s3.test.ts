import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { mockClient } from "aws-sdk-client-mock";
import {
  deleteImageFromBucket,
  getImageFromBucket,
  uploadImageToBucket,
} from "./s3";
import { randomUUID } from "crypto";

vi.mock("fs");

describe("uploadImageToBucket", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uploads image to bucket", async () => {
    vi.stubEnv("OBJECT_STORAGE_BUCKET", "bucket");
    vi.stubEnv("VAULT_ENCRYPTION_KEY_BASE64", randomUUID().slice(0, 32));
    const s3clientMock = mockClient(S3Client);
    s3clientMock
      .on(PutObjectCommand, {
        Bucket: "bucket",
        Key: "test.png",
        Body: Buffer.from("Some contents"),
        ContentType: "image/png",
      })
      .resolves({});
    const result = await uploadImageToBucket(
      Buffer.from("Some contents"),
      "test.png",
      "image/png",
    );
    expect(result).toBeDefined();
  });
});

describe("getImageFromBucket", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("gets image from bucket", async () => {
    vi.stubEnv("OBJECT_STORAGE_BUCKET", "bucket");
    const s3clientMock = mockClient(S3Client);
    s3clientMock
      .on(GetObjectCommand, {
        Bucket: "bucket",
        Key: "test.png",
      })
      .resolves({});
    const result = await getImageFromBucket("test.png");
    expect(result).toBeDefined();
  });

  it("returns undefined if the parameter is undefined", async () => {
    const result = await getImageFromBucket(undefined);
    expect(result).toBeUndefined();
  });
});

describe("deleteImageFromBucket", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("deletes image from bucket", async () => {
    vi.stubEnv("OBJECT_STORAGE_BUCKET", "bucket");
    const s3clientMock = mockClient(S3Client);
    s3clientMock
      .on(DeleteObjectCommand, {
        Bucket: "bucket",
        Key: "test.png",
      })
      .resolves({});
    const result = await deleteImageFromBucket("test.png");
    expect(result).toBeDefined();
  });
});
