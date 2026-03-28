"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateTransaction(id: string, data: { amount: number; discount: number; description?: string; method: string }) {
  try {
    const transaction = await db.transaction.findUnique({ where: { id } });
    if (!transaction) return { success: false, error: "Transaction not found." };

    const amountDiff = data.amount - transaction.amount;
    const discountDiff = data.discount - transaction.discount;
    const totalDiff = amountDiff + discountDiff;

    await db.$transaction(async (tx) => {
      await tx.transaction.update({
        where: { id },
        data: {
          amount: data.amount,
          discount: data.discount,
          description: data.description,
          method: data.method,
        },
      });

      if (transaction.partyType === "SUPPLIER" && transaction.partyId) {
        await tx.supplier.update({
          where: { id: transaction.partyId },
          data: { dueBalance: { decrement: totalDiff } },
        });
      } else if (transaction.partyType === "CUSTOMER" && transaction.partyId) {
        await tx.customer.update({
          where: { id: transaction.partyId },
          data: { dueBalance: { decrement: totalDiff } },
        });
      }
    });

    revalidatePath("/suppliers");
    revalidatePath("/customers");
    if (transaction.partyId) {
        revalidatePath(`/${transaction.partyType.toLowerCase()}s/${transaction.partyId}`);
    }
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update transaction." };
  }
}

export async function deleteTransaction(id: string) {
  try {
    const transaction = await db.transaction.findUnique({ where: { id } });
    if (!transaction) return { success: false, error: "Transaction not found." };

    const totalToReverse = transaction.amount + transaction.discount;

    await db.$transaction(async (tx) => {
      if (transaction.partyType === "SUPPLIER" && transaction.partyId) {
        await tx.supplier.update({
          where: { id: transaction.partyId },
          data: { dueBalance: { increment: totalToReverse } },
        });
      } else if (transaction.partyType === "CUSTOMER" && transaction.partyId) {
        await tx.customer.update({
          where: { id: transaction.partyId },
          data: { dueBalance: { increment: totalToReverse } },
        });
      }

      await tx.transaction.delete({ where: { id } });
    });

    revalidatePath("/suppliers");
    revalidatePath("/customers");
    if (transaction.partyId) {
        revalidatePath(`/${transaction.partyType.toLowerCase()}s/${transaction.partyId}`);
    }
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete transaction." };
  }
}
