export type IPhonePricingTemplate = {
  label: string;
  slug: string;
  model: string;
  storage: string;
  condition: "Used" | "New";
  price: number;
  downPayment: number;
  downPaymentPercent: number;
  weeklyPayment: number;
  installmentWeeks: number;
  warrantyMonths: number;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function stockImageForProduct(model: string, storage: string, condition: string) {
  return `/stock-iphone/${slugify(`${model} ${storage} ${condition}`)}.svg`;
}

export function stockImageForTemplate(template: Pick<IPhonePricingTemplate, "model" | "storage" | "condition">) {
  return stockImageForProduct(template.model, template.storage, template.condition);
}

function template(model: string, storage: string, condition: "Used" | "New", price: number, downPayment: number, weeklyPayment: number): IPhonePricingTemplate {
  const label = `${model} ${storage} ${condition}`;
  return {
    label,
    slug: slugify(label),
    model,
    storage,
    condition,
    price,
    downPayment,
    downPaymentPercent: 40,
    weeklyPayment,
    installmentWeeks: 12,
    warrantyMonths: condition === "New" ? 12 : 3
  };
}

export const iphonePricingTemplates: IPhonePricingTemplate[] = [
  template("iPhone 11 Pro", "64GB", "Used", 2900, 1160, 217),
  template("iPhone 11 Pro", "256GB", "Used", 3300, 1320, 247),
  template("iPhone 11 Pro Max", "64GB", "Used", 3300, 1320, 247),
  template("iPhone 11 Pro Max", "256GB", "Used", 3600, 1440, 270),
  template("iPhone 12", "64GB", "Used", 2800, 1120, 210),
  template("iPhone 12", "128GB", "Used", 3100, 1240, 233),
  template("iPhone 12 Pro", "128GB", "Used", 3600, 1440, 270),
  template("iPhone 12 Pro", "256GB", "Used", 3900, 1560, 293),
  template("iPhone 12 Pro Max", "128GB", "Used", 4100, 1640, 308),
  template("iPhone 12 Pro Max", "256GB", "Used", 4500, 1800, 338),
  template("iPhone 13", "128GB", "Used", 3900, 1560, 293),
  template("iPhone 13", "256GB", "Used", 4200, 1680, 315),
  template("iPhone 13 Pro", "128GB", "Used", 4700, 1880, 353),
  template("iPhone 13 Pro", "256GB", "Used", 5100, 2040, 382),
  template("iPhone 13 Pro Max", "128GB", "Used", 5400, 2160, 405),
  template("iPhone 13 Pro Max", "256GB", "Used", 6000, 2400, 450),
  template("iPhone 14", "128GB", "Used", 4500, 1800, 338),
  template("iPhone 14", "256GB", "Used", 5000, 2000, 375),
  template("iPhone 14 Pro", "128GB", "Used", 6200, 2480, 465),
  template("iPhone 14 Pro", "256GB", "Used", 6500, 2600, 487),
  template("iPhone 14 Pro Max", "128GB", "Used", 7100, 2840, 532),
  template("iPhone 14 Pro Max", "256GB", "Used", 7700, 3080, 577),
  template("iPhone 15", "128GB", "Used", 6000, 2400, 450),
  template("iPhone 15", "256GB", "Used", 6500, 2600, 487),
  template("iPhone 15 Pro", "128GB", "Used", 8000, 3200, 600),
  template("iPhone 15 Pro", "256GB", "Used", 8500, 3400, 638),
  template("iPhone 15 Pro Max", "256GB", "Used", 9000, 3600, 675),
  template("iPhone 16", "128GB", "Used", 7600, 3040, 570),
  template("iPhone 16", "256GB", "Used", 8100, 3240, 607),
  template("iPhone 16", "128GB", "New", 8700, 3480, 653),
  template("iPhone 16", "256GB", "New", 9900, 3960, 743),
  template("iPhone 16 Plus", "128GB", "Used", 8500, 3400, 638),
  template("iPhone 16 Plus", "128GB", "New", 9900, 3960, 742),
  template("iPhone 16 Pro", "128GB", "Used", 9200, 3680, 690),
  template("iPhone 16 Pro", "256GB", "Used", 9900, 3960, 742),
  template("iPhone 16 Pro Max", "256GB", "Used", 11800, 4720, 885),
  template("iPhone 17", "256GB", "New", 11500, 4600, 862),
  template("iPhone 17 Pro", "256GB", "New", 16500, 6600, 1237),
  template("iPhone 17 Pro Max", "256GB", "New", 18500, 7400, 1388)
];
