/** Lay a product photograph onto the house ivory, so the cloth is the same on every piece. */
export const IVORY_HEX = "#fffbf4";

export async function layOnIvory(file: File): Promise<{ dataUrl: string; filename: string }> {
  const src = await readAsImage(file);
  const side = Math.min(1600, Math.max(src.naturalWidth, src.naturalHeight, 900));
  const canvas = document.createElement("canvas");
  canvas.width = side;
  canvas.height = side;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not open the tray.");
  ctx.fillStyle = IVORY_HEX;
  ctx.fillRect(0, 0, side, side);
  const pad = side * 0.06;
  const scale = Math.min((side - pad * 2) / src.naturalWidth, (side - pad * 2) / src.naturalHeight);
  const w = src.naturalWidth * scale;
  const h = src.naturalHeight * scale;
  ctx.drawImage(src, (side - w) / 2, (side - h) / 2, w, h);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
  const filename = file.name.replace(/\.[^.]+$/, "") + "-ivory.jpg";
  return { dataUrl, filename };
}

function readAsImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That photograph would not open."));
    };
    img.src = url;
  });
}
