import { InventoryForm } from "@/components/inventory/inventory-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewProductPage() {
  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/inventory">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Add New Product</h2>
      </div>

      <div className="mx-auto mt-6">
        <InventoryForm />
      </div>
    </div>
  );
}
