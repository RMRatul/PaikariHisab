"use server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { purchaseSchema } from "@/lib/validations";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getPurchases() {
  return await db.purchase.findMany({
    include: { supplier: true, items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getNextPurchaseInvoiceNo() {
  const lastPurchase = await db.purchase.findFirst({
    where: { invoiceNo: { startsWith: "INV-" } },
    orderBy: { createdAt: "desc" },
    select: { invoiceNo: true },
  });
  
  let nextNumber = 1001;
  if (lastPurchase?.invoiceNo) {
    const match = lastPurchase.invoiceNo.match(/\d+/);
    if (match) nextNumber = parseInt(match[0]) + 1;
  }
  return `INV-${nextNumber}`;
}

export async function createPurchase(data: any) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session) return { success: false, error: "অননুমোদিত! দয়া করে লগইন করুন (Unauthorized)." };

    const validated = purchaseSchema.safeParse(data);
    if (!validated.success) return { success: false, error: validated.error.issues[0].message };
    const { supplierId, invoiceNo, items, totalAmount, discount, paidAmount, dueAdded } = validated.data;

    // Duplicate Invoice Check
    if (invoiceNo) {
      const existing = await db.purchase.findFirst({
        where: { supplierId, invoiceNo }
      });
      if (existing) return { success: false, error: "এই ইনভয়েস নম্বরটি এই সাপ্লায়ারের জন্য ইতিমধ্যে ব্যবহার করা হয়েছে।" };
    }
    const result = await db.$transaction(async (tx) => {
      // Calculate server-side due
      const serverDueAdded = Math.max(0, totalAmount - paidAmount);

      const purchase = await tx.purchase.create({
        data: {
          supplierId,
          invoiceNo,
          totalAmount,
          discount,
          paidAmount,
          dueAdded: serverDueAdded,
          items: {
            create: items.map((i: any) => ({
              productId: i.productId,
              quantity: i.quantity,
              price: i.price,
            })),
          },
        },
      });

      // Increase Stock for each product
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity }, purchasePrice: item.price },
        });
      }

      // 4. Update Supplier Due Balance
      if (serverDueAdded !== 0) {
        await tx.supplier.update({
          where: { id: supplierId },
          data: { dueBalance: { increment: serverDueAdded } },
        });
      }

      // 5. Record outgoing transaction
      if (paidAmount > 0) {
        await tx.transaction.create({
          data: {
            type: "OUT",
            partyType: "SUPPLIER",
            partyId: supplierId,
            amount: paidAmount,
            discount: 0,
            method: data.method || "CASH",
            description: `Payment for Purchase ${invoiceNo || purchase.id.slice(-6).toUpperCase()}`,
            suppId: supplierId,
          }
        });
      }

      return purchase;
    });

    revalidatePath("/purchases");
    revalidatePath("/suppliers");
    revalidatePath(`/suppliers/${supplierId}`);
    revalidatePath("/inventory");
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to record purchase (কিছু ভুল হয়েছে)" };
  }
}

export async function deletePurchase(id: string) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session) return { success: false, error: "অননুমোদিত! দয়া করে লগইন করুন (Unauthorized)." };

    const purchase = await db.purchase.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!purchase) return { success: false, error: "Purchase record not found" };

    await db.$transaction(async (tx) => {
      // 1. Revert Stock
      for (const item of purchase.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      // 2. Revert Supplier Due Balance
      if (purchase.dueAdded !== 0) {
        await tx.supplier.update({
          where: { id: purchase.supplierId },
          data: { dueBalance: { decrement: purchase.dueAdded } }
        });
      }

      // 3. Delete ALL associated transactions
      await tx.transaction.deleteMany({
        where: {
          partyId: purchase.supplierId,
          description: { contains: `Purchase ${purchase.invoiceNo || purchase.id.slice(-6).toUpperCase()}` }
        }
      });

      await tx.purchaseItem.deleteMany({ where: { purchaseId: id } });
      await tx.purchase.delete({ where: { id } });
    });

    revalidatePath("/purchases");
    revalidatePath("/suppliers");
    revalidatePath(`/suppliers/${purchase.supplierId}`);
    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete purchase record" };
  }
}

export async function updatePurchase(id: string, data: any) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session) return { success: false, error: "অননুমোদিত! দয়া করে লগইন করুন (Unauthorized)." };

    const validated = purchaseSchema.safeParse(data);
    if (!validated.success) return { success: false, error: validated.error.issues[0].message };
    const { supplierId, invoiceNo, items, totalAmount, discount, paidAmount, dueAdded } = validated.data;

    const oldPurchase = await db.purchase.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!oldPurchase) return { success: false, error: "Purchase record not found" };

    const result = await db.$transaction(async (tx) => {
      // 1. Revert Old Stock
      for (const item of oldPurchase.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      // 2. Revert Old Supplier Due Balance
      if (oldPurchase.dueAdded !== 0) {
        await tx.supplier.update({
          where: { id: oldPurchase.supplierId },
          data: { dueBalance: { decrement: oldPurchase.dueAdded } }
        });
      }

      // 3. Delete Old Transactions
      await tx.transaction.deleteMany({
        where: {
          partyId: oldPurchase.supplierId,
          description: { contains: `Purchase ${oldPurchase.invoiceNo || oldPurchase.id.slice(-6).toUpperCase()}` }
        }
      });

      // 4. Delete Old Items
      await tx.purchaseItem.deleteMany({
        where: { purchaseId: id }
      });

      // Calculate new due
      const serverDueAdded = Math.max(0, totalAmount - paidAmount);

      // 5. Update Purchase Record
      const updated = await tx.purchase.update({
        where: { id },
        data: {
          supplierId,
          invoiceNo,
          totalAmount,
          discount,
          paidAmount,
          dueAdded: serverDueAdded,
          items: {
            create: items.map((i: any) => ({
              productId: i.productId,
              quantity: i.quantity,
              price: i.price,
            })),
          },
        },
      });

      // 6. Apply New Stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity }, purchasePrice: item.price }
        });
      }

      // 7. Apply New Supplier Due Balance
      if (serverDueAdded !== 0) {
        await tx.supplier.update({
          where: { id: supplierId },
          data: { dueBalance: { increment: serverDueAdded } }
        });
      }

      // 8. Record new transaction if paid
      if (paidAmount > 0) {
        await tx.transaction.create({
          data: {
            type: "OUT",
            partyType: "SUPPLIER",
            partyId: supplierId,
            amount: paidAmount,
            discount: 0,
            method: data.method || "CASH",
            description: `Payment for Purchase ${invoiceNo || id.slice(-6).toUpperCase()}`,
            suppId: supplierId,
          }
        });
      }

      return updated;
    });

    revalidatePath("/purchases");
    revalidatePath("/suppliers");
    revalidatePath(`/suppliers/${supplierId}`);
    revalidatePath("/inventory");
    revalidatePath(`/purchases/${id}`);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update purchase (কিছু ভুল হয়েছে)" };
  }
}
