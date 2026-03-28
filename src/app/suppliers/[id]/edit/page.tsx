import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { SupplierEditForm } from "@/components/suppliers/supplier-edit-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function SupplierEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supplier = await db.supplier.findUnique({ where: { id } });
  if (!supplier) notFound();
  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/suppliers/${id}`}><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Edit Supplier</h2>
      </div>
      <SupplierEditForm supplier={supplier} />
    </div>
  );
}
