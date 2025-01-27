import { describe, expect, it, vi } from "vitest";
import { readFileSync, rmSync } from "fs";
import { randomUUID } from "crypto";
import {
  downloadEncryptedImage,
  uploadEncryptedImage,
} from "./uploaderDownloader";
import { getImageFromBucket, uploadImageToBucket } from "./s3";
import { decrypt, encrypt } from "./crypto";
import { sdkStreamMixin } from "@smithy/util-stream";
import { Readable } from "stream";

vi.mock("../utils/crypto");
vi.mock("../utils/s3");
vi.mock("fs");
const mockReadFileSync = vi.mocked(readFileSync);
const mockRmSync = vi.mocked(rmSync);

describe("uploadImageToBucket", () => {
  it("calls encrypt with the data and iv", async () => {
    vi.mocked(uploadImageToBucket).mockResolvedValue(null);
    vi.mocked(encrypt).mockResolvedValue(null);
    vi.mocked(mockRmSync).mockResolvedValue(null);
    vi.mocked(mockReadFileSync).mockReturnValue(Buffer.from("test"));

    const imageid = randomUUID();
    await uploadEncryptedImage(imageid, "image/png", "/tmp/test.png");
    expect(encrypt).toHaveBeenCalledWith(
      Buffer.from("test"),
      imageid.slice(0, 16),
    );
    expect(mockRmSync).toHaveBeenCalledWith("/tmp/test.png");
    expect(mockReadFileSync).toHaveBeenCalledWith("/tmp/test.png");
  });
});

describe("downloadEncryptedImage", () => {
  it("calls decrypt", async () => {
    const imageId = randomUUID();
    vi.mocked(decrypt).mockResolvedValue(Buffer.from("test"));
    const stream = new Readable();
    stream.push("hello world");
    stream.push(null);
    const sdkStream = sdkStreamMixin(stream);
    vi.mocked(getImageFromBucket).mockResolvedValue({
      $metadata: {},
      Body: sdkStream,
    });
    await downloadEncryptedImage(imageId);
    expect(decrypt).toHaveBeenCalled();
  });
});
