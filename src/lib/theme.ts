export const FONT_SIZES = [
  { id: "small", label: "Small", px: "15px" },
  { id: "medium", label: "Regular", px: "16px" },
  { id: "large", label: "Large", px: "18px" },
  { id: "xl", label: "Extra large", px: "20px" },
] as const;

export const DISPLAY_FONTS = [
  "Cormorant Garamond",
  "Playfair Display",
  "Cinzel",
  "EB Garamond",
  "Fraunces",
] as const;

export const BODY_FONTS = [
  "Outfit",
  "Source Sans 3",
  "Lato",
  "Nunito",
  "DM Sans",
] as const;

export type ThemePresetId =
  | "heritage"
  | "temple"
  | "midnight"
  | "ivory-rose"
  | "royal"
  | "sand"
  | "pearl"
  | "emerald"
  | "ivory-green"
  | "kundan"
  | "meenakari"
  | "sapphire"
  | "onyx"
  | "lotus"
  | "champagne"
  | "coral"
  | "lilac"
  | "ruby-vault"
  | "peacock";

export type SiteTheme = {
  preset: ThemePresetId | "custom";
  displayFont: string;
  bodyFont: string;
  fontSize: (typeof FONT_SIZES)[number]["id"];
  parchment: string;
  ink: string;
  garnet: string;
  bronze: string;
};

export const DEFAULT_THEME: SiteTheme = {
  preset: "heritage",
  displayFont: "Cormorant Garamond",
  bodyFont: "Outfit",
  fontSize: "medium",
  parchment: "#f6f1e8",
  ink: "#1a1410",
  garnet: "#8c2f39",
  bronze: "#a68554",
};

export const THEME_PRESETS: {
  id: ThemePresetId;
  label: string;
  note: string;
  kind: "light" | "dark";
  parchment: string;
  ink: string;
  garnet: string;
  bronze: string;
}[] = [
  {
    id: "heritage",
    label: "Heritage",
    note: "Parchment & garnet — the house default",
    kind: "light",
    parchment: "#f6f1e8",
    ink: "#1a1410",
    garnet: "#8c2f39",
    bronze: "#a68554",
  },
  {
    id: "ivory-rose",
    label: "Ivory rose",
    note: "Soft cream, rose gold",
    kind: "light",
    parchment: "#faf4f0",
    ink: "#2a1818",
    garnet: "#9c3d4a",
    bronze: "#b8896a",
  },
  {
    id: "royal",
    label: "Royal maroon",
    note: "Deep red, court jewellery",
    kind: "light",
    parchment: "#f7efe4",
    ink: "#1c0f12",
    garnet: "#6b1c28",
    bronze: "#c4a15a",
  },
  {
    id: "sand",
    label: "Solapur sand",
    note: "Deccan dust and copper",
    kind: "light",
    parchment: "#f3ead6",
    ink: "#2a2218",
    garnet: "#9a4a28",
    bronze: "#c49a5a",
  },
  {
    id: "pearl",
    label: "Pearl white",
    note: "Gallery white, cool silver-gold",
    kind: "light",
    parchment: "#fbfaf8",
    ink: "#161412",
    garnet: "#7a2e36",
    bronze: "#9a8460",
  },
  {
    id: "emerald",
    label: "House green",
    note: "SGJ green, pale leaf, gold",
    kind: "light",
    parchment: "#f3f6f3",
    ink: "#12211a",
    garnet: "#3c6c54",
    bronze: "#c4a15a",
  },
  {
    id: "ivory-green",
    label: "Ivory green",
    note: "Ivory field, light sage, gold",
    kind: "light",
    parchment: "#f8f4e8",
    ink: "#1a241c",
    garnet: "#3e7350",
    bronze: "#c4a86a",
  },
  {
    id: "kundan",
    label: "Kundan gold",
    note: "Warm saffron cream, antique gold",
    kind: "light",
    parchment: "#f7edd4",
    ink: "#2a1c0a",
    garnet: "#8f5a12",
    bronze: "#d4b36a",
  },
  {
    id: "meenakari",
    label: "Meenakari",
    note: "Jaipur enamel teal and gold",
    kind: "light",
    parchment: "#f2f6f5",
    ink: "#152420",
    garnet: "#1f6b5c",
    bronze: "#c9a44a",
  },
  {
    id: "lotus",
    label: "Lotus blush",
    note: "Pale rose, coral, rose gold",
    kind: "light",
    parchment: "#faf1ee",
    ink: "#2a1416",
    garnet: "#c45c62",
    bronze: "#c9a07a",
  },
  {
    id: "champagne",
    label: "Champagne",
    note: "Warm ivory and champagne metal",
    kind: "light",
    parchment: "#f8f3e8",
    ink: "#241c14",
    garnet: "#8a6a3a",
    bronze: "#d4c08a",
  },
  {
    id: "coral",
    label: "Coral dawn",
    note: "Peach cream, coral and copper",
    kind: "light",
    parchment: "#faf1e6",
    ink: "#2c1810",
    garnet: "#c45a3a",
    bronze: "#d4a070",
  },
  {
    id: "lilac",
    label: "Lilac pearl",
    note: "Cool lilac, amethyst, pale gold",
    kind: "light",
    parchment: "#f5f2f7",
    ink: "#1c1524",
    garnet: "#6b4a8a",
    bronze: "#c4b07a",
  },
  {
    id: "temple",
    label: "Temple green",
    note: "Dark shrine, gold buttons",
    kind: "dark",
    parchment: "#0d1f1a",
    ink: "#f3efe4",
    garnet: "#c9a227",
    bronze: "#d4b36a",
  },
  {
    id: "midnight",
    label: "Midnight gold",
    note: "Night cabinet, warm metal",
    kind: "dark",
    parchment: "#141218",
    ink: "#f4efe6",
    garnet: "#c9a44a",
    bronze: "#e0c989",
  },
  {
    id: "sapphire",
    label: "Sapphire night",
    note: "Navy tray, cream type, gold",
    kind: "dark",
    parchment: "#0d1524",
    ink: "#eef1f6",
    garnet: "#c9a44a",
    bronze: "#e0c989",
  },
  {
    id: "onyx",
    label: "Onyx",
    note: "Black cabinet, ivory and gold",
    kind: "dark",
    parchment: "#0c0c0d",
    ink: "#f4efe6",
    garnet: "#c4a15a",
    bronze: "#e8d5a3",
  },
  {
    id: "ruby-vault",
    label: "Ruby vault",
    note: "Deep burgundy, cream type, gold",
    kind: "dark",
    parchment: "#1a0c10",
    ink: "#f6eee6",
    garnet: "#c43a48",
    bronze: "#d4b36a",
  },
  {
    id: "peacock",
    label: "Peacock",
    note: "Deep teal cabinet, gold",
    kind: "dark",
    parchment: "#0c1c1c",
    ink: "#eef4f2",
    garnet: "#2a8a78",
    bronze: "#d4b36a",
  },
];

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = Number.parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((x) => Math.max(0, Math.min(255, x)).toString(16).padStart(2, "0")).join("")}`;
}

export function mixHex(a: string, b: string, t: number) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex(
    Math.round(A[0] + (B[0] - A[0]) * t),
    Math.round(A[1] + (B[1] - A[1]) * t),
    Math.round(A[2] + (B[2] - A[2]) * t),
  );
}

export function themeVars(theme: SiteTheme): Record<string, string> {
  const size = FONT_SIZES.find((s) => s.id === theme.fontSize)?.px ?? "16px";
  const parchment = theme.parchment;
  const ink = theme.ink;
  return {
    "--font-display": `"${theme.displayFont}", "Palatino Linotype", serif`,
    "--font-sans": `"${theme.bodyFont}", ui-sans-serif, system-ui, sans-serif`,
    "--site-root-size": size,
    "--color-parchment": parchment,
    "--color-parchment-deep": mixHex(parchment, ink, 0.08),
    "--color-ivory": mixHex(parchment, "#ffffff", 0.45),
    "--color-ink": ink,
    "--color-ink-soft": mixHex(ink, parchment, 0.14),
    "--color-ink-muted": mixHex(ink, parchment, 0.42),
    "--color-stone": mixHex(ink, parchment, 0.55),
    "--color-garnet": theme.garnet,
    "--color-garnet-deep": mixHex(theme.garnet, "#000000", 0.22),
    "--color-bronze": theme.bronze,
    "--color-bronze-soft": mixHex(theme.bronze, parchment, 0.28),
    "--color-line": mixHex(parchment, ink, 0.14),
  };
}

export function applyTheme(theme: SiteTheme, root: HTMLElement = document.documentElement) {
  const vars = themeVars(theme);
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
  root.style.fontSize = vars["--site-root-size"] ?? "16px";
  root.style.backgroundColor = theme.parchment;
  root.style.color = theme.ink;
  const id = "sgj-theme-fonts";
  let link = document.getElementById(id) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  link.href = googleFontsHref(theme);
}

export function clearTheme(root: HTMLElement = document.documentElement) {
  for (const k of Object.keys(themeVars(DEFAULT_THEME))) root.style.removeProperty(k);
  root.style.removeProperty("font-size");
  root.style.removeProperty("background-color");
  root.style.removeProperty("color");
}

export function googleFontsHref(theme: SiteTheme) {
  const families = [theme.displayFont, theme.bodyFont]
    .map((f, i) =>
      i === 0
        ? `family=${encodeURIComponent(f).replace(/%20/g, "+")}:ital,wght@0,600;0,700;1,500`
        : `family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@400;500;600`,
    )
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}
