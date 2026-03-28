"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { updateCustomer } from "@/actions/customer";
import type { Customer } from "@/generated/client";

export function CustomerEditForm({ customer }: { customer: Customer }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const result = await updateCustomer(customer.id, {
      name: fd.get("name") as string,
      ownerName: fd.get("ownerName") as string || undefined,
      phone: fd.get("phone") as string,
      shopName: fd.get("shopName") as string || undefined,
      shopAddress: fd.get("shopAddress") as string || undefined,
      permanentAddress: fd.get("permanentAddress") as string || undefined,
    });
    if (result.success) { router.push(`/customers/${customer.id}`); }
    else { setError(result.error || "Error"); setLoading(false); }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Update Customer Details</CardTitle>
        <CardDescription>Editing: {customer.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name *</label>
              <Input name="name" required defaultValue={customer.name} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Owner Name</label>
              <Input name="ownerName" defaultValue={customer.ownerName ?? ""} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number *</label>
              <Input name="phone" required defaultValue={customer.phone} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Shop Name</label>
              <Input name="shopName" defaultValue={customer.shopName ?? ""} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Shop Address</label>
              <Input name="shopAddress" defaultValue={customer.shopAddress ?? ""} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Permanent Address</label>
            <Input name="permanentAddress" defaultValue={customer.permanentAddress ?? ""} />
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
