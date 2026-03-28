"use server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { saleSchema } from "@/lib/validations";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getSales() {
  return await db.sale.findMany({
    include: {
      customer: true,
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getNextMemoNo() {
  const lastSale = await db.sale.findFirst({
    orderBy: { createdAt: "desc" },
    select: { memoNo: true },
  });
  
  let nextNumber = 1001;
  if (lastSale?.memoNo) {
    const match = lastSale.memoNo.match(/\d+/);
    if (match) nextNumber = parseInt(match[0]) + 1;
  }
  return `MEMO-${nextNumber}`;
}

export async function createSale(data: any) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session) return { success: false, error: "অননুমোদিত! দয়া করে লগইন করুন (Unauthorized)." };

    const validated = saleSchema.safeParse(data);
    if (!validated.success) return { success: false, error: validated.error.issues[0].message };
    const { customerId, items, subTotal, discount, totalAmount, paidAmount, dueAdded, courierName, courierBilty } = validated.data;

    // Start a transaction to ensure all db ops succeed or fail together
    const result = await db.$transaction(async (tx) => {
      // 1. Check Stock Levels Before Processing
      const productsForStock = await tx.product.findMany({
        where: { id: { in: items.map((i: any) => i.productId) } },
        select: { id: true, name: true, stock: true },
      });

      for (const item of items) {
        const dbProduct = productsForStock.find(p => p.id === item.productId);
        if (!dbProduct || dbProduct.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${dbProduct?.name || "Product"}. Available: ${dbProduct?.stock || 0}`);
        }
      }

      // 2. Generate unique Memo No
      const memoNo = await getNextMemoNo();

      // 3. Create the Sale record
      const productIds = items.map((i: any) => i.productId);
      const productsFromDb = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, purchasePrice: true },
      });

      // Calculate server-side dueAdded
      const serverDueAdded = Math.max(0, totalAmount - paidAmount);

      const sale = await tx.sale.create({
        data: {
          memoNo,
          customerId,
          subTotal,
          discount,
          totalAmount,
          paidAmount,
          dueAdded: serverDueAdded,
          courierName,
          courierBilty,
          items: {
            create: items.map((item: any) => {
              const p = productsFromDb.find((x: any) => x.id === item.productId);
              return {
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                costPrice: p?.purchasePrice || 0,
              };
            }),
          },
        },
      });

      // 4. Deduct Stock for each product
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 5. Update Customer Due Balance
      if (serverDueAdded !== 0) {
        await tx.customer.update({
          where: { id: customerId },
          data: { dueBalance: { increment: serverDueAdded } },
        });
      }
      
      // 6. If money was paid, record a transaction
      if (paidAmount > 0) {
        await tx.transaction.create({
            data: {
                type: "IN",
                partyType: "CUSTOMER",
                partyId: customerId,
                amount: paidAmount,
                discount: 0,
                method: data.method || "CASH",
                description: `Payment for Memo ${memoNo}`,
                customId: customerId,
            }
        })
      }

      return sale;
    });

    revalidatePath("/sales");
    revalidatePath("/customers");
    revalidatePath(`/customers/${customerId}`);
    revalidatePath("/inventory");
    return { success: true, data: result };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: "Failed to create sales memo (কিছু ভুল হয়েছে)" };
  }
}

export async function deleteSale(id: string) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session) return { success: false, error: "অননুমোদিত! দয়া করে লগইন করুন (Unauthorized)." };

    const sale = await db.sale.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!sale) return { success: false, error: "Sale record not found (বিক্রয় রেকর্ড পাওয়া যায়নি)" };

    await db.$transaction(async (tx) => {
      // 1. Revert Stock (Increment)
      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        });
      }

      // 2. Revert Customer Due Balance
      if (sale.dueAdded !== 0) {
        await tx.customer.update({
          where: { id: sale.customerId },
          data: { dueBalance: { decrement: sale.dueAdded } }
        });
      }

      // 3. Delete ALL associated transactions to prevent ghost money
      await tx.transaction.deleteMany({
        where: {
          partyId: sale.customerId,
          description: { contains: `Memo ${sale.memoNo}` }
        }
      });

      // 4. Delete Sale record
      await tx.saleItem.deleteMany({ where: { saleId: id } });
      await tx.sale.delete({ where: { id } });
    });

    revalidatePath("/sales");
    revalidatePath("/customers");
    revalidatePath(`/customers/${sale.customerId}`);
    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete sale record (রেকর্ড ডিলিট করতে ব্যর্থ হয়েছে)" };
  }
}
