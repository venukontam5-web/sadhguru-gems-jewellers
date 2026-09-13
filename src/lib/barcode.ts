/** Code 128B patterns (values 0–106). Stop is value 106 plus a terminal bar. */
const PATTERNS = [
  "11011001100", "11001101100", "11001100110", "10010011000", "10010001100",
  "10001001100", "10011001000", "10011000100", "10001100100", "11001001000",
  "11001000100", "11000100100", "10110011100", "10011011100", "10011001110",
  "10111001100", "10011101100", "10011100110", "11001110010", "11001011100",
  "11001001110", "11011100100", "11001110100", "11101101110", "11101001100",
  "11100101100", "11100100110", "11101100100", "11100110100", "11100110010",
  "11011011000", "11011000110", "11000110110", "10100011000", "10001011000",
  "10001000110", "10110001000", "10001101000", "10001100010", "11010001000",
  "11000101000", "11000100010", "10110111000", "10110001110", "10001101110",
  "10111011000", "10111000110", "10001110110", "11101110110", "11010001110",
  "11000101110", "11011101000", "11011100010", "11011101110", "11101011000",
  "11101000110", "11100010110", "11101101000", "11101100010", "11100011010",
  "11101111010", "11001000010", "11110001010", "10100110000", "10100001100",
  "10010110000", "10010000110", "10000101100", "10000100110", "10110010000",
  "10110000100", "10011010000", "10011000010", "10000110100", "10000110010",
  "11000010010", "11001010000", "11110111010", "11000010100", "10001111010",
  "10100111100", "10010111100", "10010011110", "10111100100", "10011110100",
  "10011110010", "11110100100", "11110010100", "11110010010", "11011011110",
  "11011110110", "11110110110", "10101111000", "10100011110", "10001011110",
  "10111101000", "10111100010", "11110101000", "11110100010", "10111011110",
  "10111101110", "11101011110", "11110101110", "11010000100", "11010010000",
  "11010011100", "11000111010",
];

const START_B = 104;
const STOP = 106;
const STOP_TERM = "11";
const STOP_BITS = PATTERNS[STOP] + STOP_TERM;

export function stripScannerPrefix(raw: string) {
  let t = raw.replace(/^\uFEFF/, "").trim();
  t = t.replace(/^[\x00-\x1F]+/, "").replace(/[\x00-\x1F]+$/, "");
  if (/^\][A-Z][0-9]/.test(t)) t = t.slice(3);
  return t;
}

export function normalizeSku(raw: string) {
  const t = stripScannerPrefix(raw).toUpperCase().replace(/\s+/g, "");
  if (!t) return "";
  const digits = t.replace(/\D/g, "");
  if (/^SGJ-?\d{1,6}$/.test(t) && digits) {
    return `SGJ-${digits.padStart(4, "0")}`;
  }
  if (/^\d{1,6}$/.test(t)) return `SGJ-${t.padStart(4, "0")}`;
  return t;
}

export function looksLikeSku(raw: string) {
  const t = stripScannerPrefix(raw).toUpperCase().replace(/\s+/g, "");
  return /^SGJ-?\d{1,6}$/.test(t) || /^\d{1,6}$/.test(t) || /^[A-Z0-9-]{3,20}$/.test(t);
}

export function code128Bits(text: string) {
  const chars = [...text].filter((c) => {
    const n = c.charCodeAt(0);
    return n >= 32 && n <= 126;
  });
  if (!chars.length) return "";
  const values = chars.map((c) => c.charCodeAt(0) - 32);
  let sum = START_B;
  values.forEach((v, i) => {
    sum += v * (i + 1);
  });
  const checksum = sum % 103;
  const seq = [START_B, ...values, checksum, STOP];
  return seq.map((v) => PATTERNS[v]).join("") + STOP_TERM;
}

export function code128Svg(text: string, opts?: { height?: number; module?: number }) {
  const bits = code128Bits(text);
  if (!bits) return "";
  const module = opts?.module ?? 2;
  const barH = opts?.height ?? 56;
  const quiet = 10 * module;
  const width = quiet * 2 + bits.length * module;
  let x = quiet;
  let d = "";
  for (const bit of bits) {
    if (bit === "1") d += `M${x} 0h${module}v${barH}h-${module}z`;
    x += module;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${barH}" width="${width}" height="${barH}" role="img" aria-label="${text}" shape-rendering="crispEdges"><rect width="${width}" height="${barH}" fill="#fff"/><path d="${d}" fill="#1a1410"/></svg>`;
}

export function decodeCode128Bits(bits: string) {
  if (bits.length < 11 * 3 + 2 || !bits.endsWith(STOP_TERM)) return null;
  const body = bits.slice(0, -STOP_TERM.length);
  if (body.length % 11 !== 0) return null;
  const values: number[] = [];
  for (let i = 0; i < body.length; i += 11) {
    const v = PATTERNS.indexOf(body.slice(i, i + 11));
    if (v < 0) return null;
    values.push(v);
  }
  if (values[0] !== START_B || values[values.length - 1] !== STOP) return null;
  const checksum = values[values.length - 2];
  const data = values.slice(1, -2);
  if (!data.length) return null;
  let sum = START_B;
  data.forEach((v, i) => {
    sum += v * (i + 1);
  });
  if (sum % 103 !== checksum) return null;
  return data.map((v) => String.fromCharCode(v + 32)).join("");
}

function widthsToBits(mods: number[], startBar = true) {
  let bits = "";
  let bar = startBar;
  for (const w of mods) {
    bits += (bar ? "1" : "0").repeat(w);
    bar = !bar;
  }
  return bits;
}

function quantize(widths: number[], target: number) {
  const sum = widths.reduce((a, b) => a + b, 0);
  if (sum <= 0 || widths.some((w) => w <= 0)) return null;
  const m = sum / target;
  if (m < 0.6) return null;
  const q = widths.map((w) => Math.max(1, Math.round(w / m)));
  let s = q.reduce((a, b) => a + b, 0);
  const err = widths.map((w, i) => ({ i, d: w / m - q[i] }));
  while (s > target) {
    err.sort((a, b) => a.d - b.d);
    const j = err.find((e) => q[e.i] > 1);
    if (!j) break;
    q[j.i] -= 1;
    j.d += 1;
    s -= 1;
  }
  while (s < target) {
    err.sort((a, b) => b.d - a.d);
    const j = err[0];
    q[j.i] += 1;
    j.d -= 1;
    s += 1;
  }
  return s === target ? q : null;
}

function tryDecodeRuns(runs: number[]) {
  if (runs.length < 25) return null;
  const startMods = quantize(runs.slice(0, 6), 11);
  if (!startMods) return null;
  const startBits = widthsToBits(startMods, true);
  if (PATTERNS.indexOf(startBits) !== START_B) return null;

  const values: number[] = [START_B];
  let i = 6;
  while (i + 6 <= runs.length) {
    if (i + 7 <= runs.length) {
      const stopMods = quantize(runs.slice(i, i + 7), 13);
      if (stopMods && widthsToBits(stopMods, true) === STOP_BITS) break;
    }
    const mods = quantize(runs.slice(i, i + 6), 11);
    if (!mods) return null;
    const idx = PATTERNS.indexOf(widthsToBits(mods, true));
    if (idx < 0 || idx > 102) return null;
    values.push(idx);
    i += 6;
  }
  const stopMods = i + 7 <= runs.length ? quantize(runs.slice(i, i + 7), 13) : null;
  if (!stopMods || widthsToBits(stopMods, true) !== STOP_BITS) return null;
  if (values.length < 2) return null;
  const checksum = values[values.length - 1];
  const data = values.slice(1, -1);
  if (!data.length) return null;
  let sum = START_B;
  data.forEach((v, di) => {
    sum += v * (di + 1);
  });
  if (sum % 103 !== checksum) return null;
  return data.map((v) => String.fromCharCode(v + 32)).join("");
}

export function decodeCode128FromRuns(runs: number[]) {
  for (const offset of [0, 1]) {
    const hit = tryDecodeRuns(runs.slice(offset));
    if (hit) return hit;
  }
  return null;
}

function runsFromDark(dark: boolean[]) {
  let i = 0;
  while (i < dark.length && !dark[i]) i++;
  if (i >= dark.length) return [] as number[];
  const runs: number[] = [];
  let cur = true;
  let n = 0;
  for (; i < dark.length; i++) {
    if (dark[i] === cur) n += 1;
    else {
      runs.push(n);
      cur = !cur;
      n = 1;
    }
  }
  runs.push(n);
  return runs;
}

export function decodeCode128FromScanline(luma: ArrayLike<number>) {
  const len = luma.length;
  if (len < 40) return null;
  let min = 255;
  let max = 0;
  for (let i = 0; i < len; i++) {
    const v = luma[i];
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (max - min < 16) return null;
  const fracs = [0.38, 0.45, 0.5, 0.55, 0.62];
  for (const f of fracs) {
    const thr = min + (max - min) * f;
    for (const invert of [false, true]) {
      const dark: boolean[] = new Array(len);
      for (let i = 0; i < len; i++) {
        const isDark = luma[i] < thr;
        dark[i] = invert ? !isDark : isDark;
      }
      const hit = decodeCode128FromRuns(runsFromDark(dark));
      if (hit) return hit;
    }
  }
  return null;
}

export function decodeCode128FromImageData(data: {
  width: number;
  height: number;
  data: ArrayLike<number>;
}) {
  const { width, height, data: px } = data;
  if (width < 40 || height < 4) return null;
  const fracs = [0.28, 0.38, 0.5, 0.62, 0.72];
  for (const f of fracs) {
    const y = Math.min(height - 1, Math.max(0, Math.floor(height * f)));
    const row = new Float32Array(width);
    const band = Math.min(2, Math.floor(height / 4));
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let n = 0;
      for (let dy = -band; dy <= band; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= height) continue;
        const i = (yy * width + x) * 4;
        sum += 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
        n += 1;
      }
      row[x] = sum / n;
    }
    const hit = decodeCode128FromScanline(row);
    if (hit) return hit;
  }
  return null;
}

/** Build a 1-bit scanline from encoded bits — used to check a scanner round-trip. */
export function syntheticScanline(bits: string, module = 3, quiet = 18) {
  const row: number[] = [];
  for (let i = 0; i < quiet; i++) row.push(250);
  for (const b of bits) {
    const v = b === "1" ? 8 : 247;
    for (let i = 0; i < module; i++) row.push(v);
  }
  for (let i = 0; i < quiet; i++) row.push(250);
  return row;
}

export function checkCode128(text: string) {
  const bits = code128Bits(text);
  if (!bits) return { bits: false, scan: false, read: null as string | null };
  const readBits = decodeCode128Bits(bits);
  const readScan = decodeCode128FromScanline(syntheticScanline(bits));
  return { bits: readBits === text, scan: readScan === text, read: readScan ?? readBits };
}
