import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { PurchaseForm } from "@/components/purchases/purchase-form";

export const dynamic = "force-dynamic";

export default async function EditPurchasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [purchase, suppliers, products] = await Promise.all([
    db.purchase.findUnique({
      where: { id },
      include: { items: true }
    }),
    db.supplier.findMany({ orderBy: { name: "asc" } }),
    db.product.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!purchase) notFound();

  return (
    <div className="flex-1 space-y-10 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight font-outfit uppercase">
          Edit <span className="text-amber-600">Purchase</span>
        </h1>
        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
          Revise procurement registry and stock levels
        </p>
      </div>

      <PurchaseForm 
        suppliers={suppliers} 
        products={products} 
        initialData={purchase} 
      />
    </div>
  );
}
