"use server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function processReturn(data: {
  customerId: string;
  items: { productId: string; quantity: number; refundPrice: number }[];
  reason: string;
}) {
  try {
    const totalReturnAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.refundPrice), 0);

    // 0. SQA Hardening: Validate Prices and Entities
    for (const item of data.items) {
      const product = await db.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new Error(`Product ${item.productId} not found`);
      if (item.refundPrice > product.sellingPrice) {
        throw new Error(`Refund price for ${product.name} cannot exceed selling price (Tk ${product.sellingPrice})`);
      }
    }

    await db.$transaction(async (tx) => {
      // 1. Create Return Record
      const returnRecord = await tx.return.create({
        data: {
          customerId: data.customerId,
          totalAmount: totalReturnAmount,
          reason: data.reason,
          items: {
            create: data.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              refundPrice: item.refundPrice,
            }))
          }
        }
      });

      // 2. Adjust Product Stocks
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        });
      }

      // 3. Adjust Customer Due (Credit the customer)
      await tx.customer.update({
        where: { id: data.customerId },
        data: { dueBalance: { decrement: totalReturnAmount } }
      });

      // 4. Create Transaction Record for Audit
      await tx.transaction.create({
        data: {
          type: "IN",
          partyType: "CUSTOMER",
          partyId: data.customerId,
          customId: data.customerId,
          amount: 0,
          discount: totalReturnAmount,
          method: "RETURN",
          description: `Product Return Ref: ${returnRecord.id.slice(-6).toUpperCase()} — ${data.reason}`,
        }
      });
    });

    revalidatePath(`/customers/${data.customerId}`);
    revalidatePath("/inventory");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to process return (কিছু ভুল হয়েছে)" };
  }
}

export async function getReturns() {
  return await db.return.findMany({
    include: {
      customer: { select: { name: true, shopName: true } },
      items: { include: { product: true } }
    },
    orderBy: { createdAt: "desc" }
  });
}
