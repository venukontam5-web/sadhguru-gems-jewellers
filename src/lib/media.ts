export function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

export async function compressImage(
  file: File,
  max = 1800,
  quality = 0.84,
): Promise<{ dataUrl: string; mime: string; name: string }> {
  if (!file.type.startsWith("image/")) {
    return { dataUrl: await readAsDataUrl(file), mime: file.type, name: file.name };
  }
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * scale));
  const h = Math.max(1, Math.round(bmp.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { dataUrl: await readAsDataUrl(file), mime: file.type, name: file.name };
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  return { dataUrl, mime: "image/jpeg", name: file.name.replace(/\.\w+$/, ".jpg") };
}
