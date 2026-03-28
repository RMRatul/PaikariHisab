"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { addSupplier } from "@/actions/supplier";

export function SupplierForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      company: formData.get("company") as string,
      address: formData.get("address") as string,
    };

    const result = await addSupplier(data);
    if (result.success) {
      router.push("/suppliers");
    } else {
      setError(result.error || "Failed to add supplier");
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Supplier / Mahajan Details</CardTitle>
        <CardDescription>Enter the details of the new supplier below.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-md">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Mahajan Name *</label>
              <Input id="name" name="name" required placeholder="e.g. Haji Selim" />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">Phone Number *</label>
              <Input id="phone" name="phone" required placeholder="e.g. 01800000000" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="company" className="text-sm font-medium">Company / Brand Name</label>
            <Input id="company" name="company" placeholder="e.g. Anarkali Textiles" />
          </div>

          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium">Address</label>
            <Input id="address" name="address" placeholder="e.g. Narayanganj" />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Supplier"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
