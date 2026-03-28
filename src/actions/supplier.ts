"use server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { supplierSchema, supplierPaymentSchema } from "@/lib/validations";

export async function getSuppliers(searchQuery?: string) {
  const query = searchQuery?.trim();
  if (!query) {
    return await db.supplier.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  const tokens = query.split(/\s+/).filter(Boolean);
  
  return await db.supplier.findMany({
    where: {
      AND: tokens.map(token => ({
        OR: [
          { name: { contains: token } },
          { phone: { contains: token } },
          { company: { contains: token } },
          { address: { contains: token } },
        ],
      })),
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function addSupplier(data: any) {
  try {
    const validated = supplierSchema.safeParse(data);
    if (!validated.success) return { success: false, error: validated.error.issues[0].message };

    const supplier = await db.supplier.create({ data: validated.data });
    revalidatePath("/suppliers");
    return { success: true, data: supplier };
  } catch (error: any) {
    if (error.code === "P2002") return { success: false, error: "Phone number already exists" };
    return { success: false, error: "Failed to add supplier (কিছু ভুল হয়েছে)" };
  }
}

export async function updateSupplier(id: string, data: any) {
  try {
    const validated = supplierSchema.safeParse(data);
    if (!validated.success) return { success: false, error: validated.error.issues[0].message };

    const supplier = await db.supplier.update({ where: { id }, data: validated.data });
    revalidatePath(`/suppliers/${id}`);
    revalidatePath("/suppliers");
    return { success: true, data: supplier };
  } catch (error: any) {
    if (error.code === "P2002") return { success: false, error: "Phone number already in use" };
    return { success: false, error: "Failed to update supplier (কিছু ভুল হয়েছে)" };
  }
}

export async function paySupplier(data: any) {
  try {
    const validated = supplierPaymentSchema.safeParse(data);
    if (!validated.success) return { success: false, error: validated.error.issues[0].message };
    const { supplierId, amount, discount, method, description } = validated.data;

    const totalDeduction = amount + discount;
    await db.$transaction(async (tx) => {
      await tx.supplier.update({
        where: { id: supplierId },
        data: { dueBalance: { decrement: totalDeduction } },
      });
      await tx.transaction.create({
        data: {
          type: "OUT",
          partyType: "SUPPLIER",
          partyId: supplierId,
          amount,
          discount,
          method,
          description: description || "Payment to supplier",
          suppId: supplierId,
        },
      });
    });
    revalidatePath(`/suppliers/${supplierId}`);
    revalidatePath("/suppliers");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to record supplier payment (কিছু ভুল হয়েছে)" };
  }
}

export async function deleteSupplier(id: string) {
  try {
    await db.supplier.delete({ where: { id } });
    revalidatePath("/suppliers");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete supplier. Ensure they have no critical transaction history." };
  }
}
