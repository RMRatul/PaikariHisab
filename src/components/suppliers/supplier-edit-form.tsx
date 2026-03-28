"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { updateSupplier } from "@/actions/supplier";
import type { Supplier } from "@/generated/client";

export function SupplierEditForm({ supplier }: { supplier: Supplier }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const result = await updateSupplier(supplier.id, {
      name: fd.get("name") as string,
      phone: fd.get("phone") as string,
      company: fd.get("company") as string || undefined,
      address: fd.get("address") as string || undefined,
    });
    if (result.success) { router.push(`/suppliers/${supplier.id}`); }
    else { setError(result.error || "Error"); setLoading(false); }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Update Supplier Details</CardTitle>
        <CardDescription>Editing: {supplier.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mahajan Name *</label>
              <Input name="name" required defaultValue={supplier.name} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number *</label>
              <Input name="phone" required defaultValue={supplier.phone} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Company / Brand</label>
            <Input name="company" defaultValue={supplier.company ?? ""} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Address</label>
            <Input name="address" defaultValue={supplier.address ?? ""} />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
