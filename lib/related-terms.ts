import { ENGLISH_STOP_WORDS } from "./stop-words";

const TOKEN_PATTERN = /[\p{L}\p{N}_]{2,}/gu;

/** Everyday product words mapped to language already present in the catalog. */
const PRODUCT_ALIASES: Record<string, string> = {
  table: "furniture chair sofa bed mattress home",
  tables: "furniture chair sofa bed mattress home",
  desk: "furniture chair office home",
  desks: "furniture chair office home",
  wardrobe: "furniture clothes home",
  wardrobes: "furniture clothes home",
  cupboard: "furniture kitchen home",
  cupboards: "furniture kitchen home",
  cabinet: "furniture kitchen home",
  cabinets: "furniture kitchen home",
  dining: "furniture chair home",
  couch: "sofa furniture home",
  couches: "sofa furniture home",
  settee: "sofa furniture home",
  bookshelf: "furniture book home",
  bookshelves: "furniture book home",
  dresser: "furniture home",
  drawers: "furniture home",
  stool: "furniture chair home",
  stools: "furniture chair home",
  fridge: "refrigerator freezer appliance",
  fridges: "refrigerator freezer appliance",
  cooker: "gas cooker kitchen appliance",
  cookers: "gas cooker kitchen appliance",
  blender: "kitchen appliance",
  microwave: "microwave kitchen appliance",
  microwaves: "microwave kitchen appliance",
  clothe: "fashion clothes dress",
  clothing: "fashion clothes dress",
  shirt: "fashion clothes",
  shirts: "fashion clothes shirt",
  shoe: "shoes sneakers fashion",
  bag: "handbag fashion",
  bags: "handbag fashion",
  wig: "hair beauty wig",
  wigs: "hair beauty wig",
  cream: "skincare cream beauty",
  creams: "skincare cream beauty",
  drug: "pharmacy medicine",
  drugs: "pharmacy medicine",
  medicine: "pharmacy medicine",
  medicines: "pharmacy medicine",
  vitamin: "pharmacy vitamin",
  vitamins: "pharmacy vitamin",
  car: "car tokunbo toyota",
  cars: "car tokunbo toyota",
  automobile: "car tokunbo vehicle",
  automobiles: "car tokunbo vehicle",
  flight: "flight ticket airline",
  flights: "flight ticket airline",
  ticket: "flight ticket travel",
  tickets: "flight ticket travel",
  ebook: "ebook course digital",
  ebooks: "ebook course digital",
  course: "online course ebook",
  courses: "online course ebook",
  meal: "jollof restaurant food delivery",
  meals: "jollof restaurant food delivery",
  rice: "rice groceries foodstuff",
  provision: "groceries rice provision",
  provisions: "groceries rice provision",
  dog: "pet dog veterinary animal",
  dogs: "pet dog veterinary animal",
  puppy: "pet dog puppy animal",
  cat: "pet cat veterinary animal",
  cats: "pet cat veterinary animal",
  kitten: "pet cat kitten animal",
  goat: "livestock goat animal farm",
  goats: "livestock goat animal farm",
  cow: "livestock cattle cow animal",
  cows: "livestock cattle cow animal",
  poultry: "poultry chicken farm animal",
  nepa: "electricity prepaid meter disco",
  phcn: "electricity prepaid meter disco",
  airtime: "airtime recharge mtn data",
  recharge: "airtime recharge electricity",
  meter: "prepaid meter electricity",
  passport: "passport immigration",
  nin: "nin national identity",
  job: "job vacancy career",
  jobs: "job vacancy career",
};

export function contentTokens(text: string): string[] {
  return (text.toLowerCase().match(TOKEN_PATTERN) ?? []).filter((token) => !ENGLISH_STOP_WORDS.has(token));
}

export function singularize(token: string): string {
  if (token.endsWith("ies") && token.length > 4) {
    return `${token.slice(0, -3)}y`;
  }
  if (/(?:sses|shes|ches|xes|zes)$/.test(token) && token.length > 4) {
    return token.slice(0, -2);
  }
  if (token.endsWith("s") && !token.endsWith("ss") && token.length > 3) {
    return token.slice(0, -1);
  }
  return token;
}

export function aliasFor(token: string): string | null {
  return PRODUCT_ALIASES[token] ?? PRODUCT_ALIASES[singularize(token)] ?? null;
}
