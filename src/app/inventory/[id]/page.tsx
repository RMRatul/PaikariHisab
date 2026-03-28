import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { InventoryEditForm } from "@/components/inventory/inventory-edit-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function InventoryEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });
  if (!product) notFound();
  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/inventory"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
      </div>
      <InventoryEditForm product={product} />
    </div>
  );
}
