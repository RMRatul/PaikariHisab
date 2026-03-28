import { SalesForm } from "@/components/sales/sales-form";
import { getCustomers } from "@/actions/customer";
import { getProducts } from "@/actions/inventory";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getNextMemoNo } from "@/actions/sales";

export const dynamic = "force-dynamic";

export default async function NewSalePage() {
  const customers = await getCustomers();
  const products = await getProducts();
  const nextMemoNo = await getNextMemoNo();

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/sales">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Create Wholesale Memo</h2>
      </div>

      <div className="mt-6">
        <SalesForm customers={customers} products={products} nextMemoNo={nextMemoNo} />
      </div>
    </div>
  );
}
