import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { CustomerEditForm } from "@/components/customers/customer-edit-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function CustomerEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await db.customer.findUnique({ where: { id } });
  if (!customer) notFound();
  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/customers/${id}`}><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Edit Customer</h2>
      </div>
      <CustomerEditForm customer={customer} />
    </div>
  );
}
