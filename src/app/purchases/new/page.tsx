import { PurchaseForm } from "@/components/purchases/purchase-form";
import { getSuppliers } from "@/actions/supplier";
import { getProducts } from "@/actions/inventory";
import { getNextPurchaseInvoiceNo } from "@/actions/purchase";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function NewPurchasePage() {
  const suppliers = await getSuppliers();
  const products = await getProducts();

  const nextInvoiceNo = await getNextPurchaseInvoiceNo();

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/purchases"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Record Purchase / মাল আনা</h2>
      </div>
      <div className="mt-6">
        <PurchaseForm suppliers={suppliers} products={products} nextInvoiceNo={nextInvoiceNo} />
      </div>
    </div>
  );
}
