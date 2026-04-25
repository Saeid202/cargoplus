import { ProductShowcase } from "./ProductShowcase";
import type { ProductWithRelations } from "@/types";

export function ProductShowcaseWrapper({
  products,
  title,
}: {
  products: ProductWithRelations[];
  title?: string;
}) {
  return <ProductShowcase products={products} title={title} />;
}
