import { CustomerForm } from "@/components/customers/customer-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewCustomerPage() {
  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/customers">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Add New Customer</h2>
      </div>

      <div className="mx-auto mt-6">
        <CustomerForm />
      </div>
    </div>
  );
}
