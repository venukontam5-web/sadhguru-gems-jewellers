import assert from "node:assert/strict";
import { test } from "node:test";
import {
  checkCode128,
  code128Bits,
  decodeCode128Bits,
  decodeCode128FromImageData,
  decodeCode128FromScanline,
  normalizeSku,
  stripScannerPrefix,
  syntheticScanline,
} from "./barcode.ts";

test("normalizes house SKUs and gun prefixes", () => {
  assert.equal(normalizeSku("19"), "SGJ-0019");
  assert.equal(normalizeSku("sgj-19"), "SGJ-0019");
  assert.equal(normalizeSku("SGJ0019"), "SGJ-0019");
  assert.equal(normalizeSku("]C1SGJ-0005"), "SGJ-0005");
  assert.equal(stripScannerPrefix("]C1SGJ-0005"), "SGJ-0005");
});

test("Code 128B round-trips house SKUs", () => {
  for (const sku of ["SGJ-0001", "SGJ-0005", "SGJ-0014", "SGJ-0019", "SGJ-0020"]) {
    const bits = code128Bits(sku);
    assert.equal(decodeCode128Bits(bits), sku);
    assert.equal(decodeCode128FromScanline(syntheticScanline(bits, 2, 12)), sku);
    assert.equal(decodeCode128FromScanline(syntheticScanline(bits, 3, 20)), sku);
    const chk = checkCode128(sku);
    assert.equal(chk.bits, true, sku);
    assert.equal(chk.scan, true, sku);
  }
});

test("reads a raster of SGJ-0019", () => {
  const sku = "SGJ-0019";
  const bits = code128Bits(sku);
  const module = 2;
  const quiet = 12;
  const row = syntheticScanline(bits, module, quiet);
  const height = 16;
  const width = row.length;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const v = row[x];
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
  }
  assert.equal(decodeCode128FromImageData({ width, height, data }), sku);
});
