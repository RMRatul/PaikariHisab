import { db } from "@/lib/db";
import { ReturnForm } from "@/components/returns/return-form";

export const dynamic = "force-dynamic";

export default async function NewReturnPage() {
  const [customers, products] = await Promise.all([
    db.customer.findMany({ orderBy: { name: "asc" } }),
    db.product.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex-1 py-10">
      <ReturnForm customers={customers as any} products={products as any} />
    </div>
  );
}
