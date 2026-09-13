/** House GST chart — Maharashtra (27) is home. Rates follow the council; confirm with the accountant if they change. */

export const HOME_STATE = { code: "27", name: "Maharashtra" } as const;

export type GstState = {
  code: string;
  name: string;
  intra: boolean;
};

export const GST_STATES: GstState[] = [
  { code: "01", name: "Jammu & Kashmir", intra: false },
  { code: "02", name: "Himachal Pradesh", intra: false },
  { code: "03", name: "Punjab", intra: false },
  { code: "04", name: "Chandigarh", intra: false },
  { code: "05", name: "Uttarakhand", intra: false },
  { code: "06", name: "Haryana", intra: false },
  { code: "07", name: "Delhi", intra: false },
  { code: "08", name: "Rajasthan", intra: false },
  { code: "09", name: "Uttar Pradesh", intra: false },
  { code: "10", name: "Bihar", intra: false },
  { code: "11", name: "Sikkim", intra: false },
  { code: "12", name: "Arunachal Pradesh", intra: false },
  { code: "13", name: "Nagaland", intra: false },
  { code: "14", name: "Manipur", intra: false },
  { code: "15", name: "Mizoram", intra: false },
  { code: "16", name: "Tripura", intra: false },
  { code: "17", name: "Meghalaya", intra: false },
  { code: "18", name: "Assam", intra: false },
  { code: "19", name: "West Bengal", intra: false },
  { code: "20", name: "Jharkhand", intra: false },
  { code: "21", name: "Odisha", intra: false },
  { code: "22", name: "Chhattisgarh", intra: false },
  { code: "23", name: "Madhya Pradesh", intra: false },
  { code: "24", name: "Gujarat", intra: false },
  { code: "26", name: "Dadra & Nagar Haveli and Daman & Diu", intra: false },
  { code: "27", name: "Maharashtra", intra: true },
  { code: "29", name: "Karnataka", intra: false },
  { code: "30", name: "Goa", intra: false },
  { code: "31", name: "Lakshadweep", intra: false },
  { code: "32", name: "Kerala", intra: false },
  { code: "33", name: "Tamil Nadu", intra: false },
  { code: "34", name: "Puducherry", intra: false },
  { code: "35", name: "Andaman & Nicobar", intra: false },
  { code: "36", name: "Telangana", intra: false },
  { code: "37", name: "Andhra Pradesh", intra: false },
  { code: "38", name: "Ladakh", intra: false },
  { code: "97", name: "Other territory", intra: false },
];

export type HsnRate = {
  hsn: string;
  name: string;
  rate: number;
  note: string;
};

export const HSN_RATES: HsnRate[] = [
  { hsn: "7102", name: "Diamonds", rate: 3, note: "Unset. Heera on the Navratna tray." },
  { hsn: "7103", name: "Precious & semi-precious stones", rate: 3, note: "Ruby, emerald, sapphire, gomed, lehsunia, panna." },
  { hsn: "7106", name: "Silver, unwrought or in semi-manufactured forms", rate: 3, note: "Silver 925 / 999 at the counter." },
  { hsn: "7108", name: "Gold, unwrought or in semi-manufactured forms", rate: 3, note: "24K, 22K bar and kundan gold." },
  { hsn: "7113", name: "Articles of jewellery", rate: 3, note: "Gold, silver and gem-set jewellery. The house default." },
  { hsn: "7116", name: "Articles of pearls, precious or semi-precious stones", rate: 3, note: "Pearl malas, gem strands, beads." },
  { hsn: "7117", name: "Imitation jewellery", rate: 3, note: "Fashion pieces. Confirm if a lot is imitation, not gold." },
  { hsn: "1404", name: "Rudraksha and vegetable materials", rate: 5, note: "Rudraksha malas. Not a gemstone HSN." },
  { hsn: "7418", name: "Copper household articles", rate: 18, note: "Bottles, lotas, kitchen copper." },
  { hsn: "7419", name: "Other copper / brass articles", rate: 18, note: "Brass diya, kalash, deepam." },
  { hsn: "9988", name: "Repair, polish, sizing (job work)", rate: 18, note: "Repair & polished bill. Service, not a stone leaving." },
];

export function splitGst(rate: number, intra: boolean) {
  if (rate <= 0) return { cgst: 0, sgst: 0, igst: 0, label: "Exempt" };
  if (intra) {
    const half = rate / 2;
    return { cgst: half, sgst: half, igst: 0, label: `CGST ${half}% + SGST ${half}%` };
  }
  return { cgst: 0, sgst: 0, igst: rate, label: `IGST ${rate}%` };
}
