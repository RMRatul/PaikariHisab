"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { addCustomer } from "@/actions/customer";

export function CustomerForm() {
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
      ownerName: formData.get("ownerName") as string,
      phone: formData.get("phone") as string,
      shopName: formData.get("shopName") as string,
      shopAddress: formData.get("shopAddress") as string,
      permanentAddress: formData.get("permanentAddress") as string,
    };

    const result = await addCustomer(data);
    if (result.success) {
      router.push("/customers");
    } else {
      setError(result.error || "Failed to add customer");
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Customer Details</CardTitle>
        <CardDescription>Enter the details of the new customer below.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-md">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Full Name *</label>
              <Input id="name" name="name" required placeholder="e.g. Rahim Uddin" />
            </div>
            <div className="space-y-2">
              <label htmlFor="ownerName" className="text-sm font-medium">Owner Name</label>
              <Input id="ownerName" name="ownerName" placeholder="e.g. Md. Abdullah" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">Phone Number *</label>
              <Input id="phone" name="phone" required placeholder="e.g. 01700000000" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="shopName" className="text-sm font-medium">Shop Name</label>
              <Input id="shopName" name="shopName" placeholder="e.g. Rahim Garments" />
            </div>
            <div className="space-y-2">
              <label htmlFor="shopAddress" className="text-sm font-medium">Shop Address</label>
              <Input id="shopAddress" name="shopAddress" placeholder="e.g. Islampur, Dhaka" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="permanentAddress" className="text-sm font-medium">Permanent Address</label>
            <Input id="permanentAddress" name="permanentAddress" placeholder="e.g. Village, Thana, District" />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Customer"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
