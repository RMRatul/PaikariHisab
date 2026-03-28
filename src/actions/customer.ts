"use server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { customerSchema, customerPaymentSchema } from "@/lib/validations";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getCustomers(searchQuery?: string) {
  const query = searchQuery?.trim();
  if (!query) {
    return await db.customer.findMany({
      include: {
        sales: { select: { totalAmount: true } }
      },
      orderBy: { createdAt: "desc" },
    });
  }

  const tokens = query.split(/\s+/).filter(Boolean);
  
  return await db.customer.findMany({
    where: {
      AND: tokens.map(token => ({
        OR: [
          { name: { contains: token } },
          { phone: { contains: token } },
          { shopName: { contains: token } },
          { shopAddress: { contains: token } },
        ],
      })),
    },
    include: {
      sales: { select: { totalAmount: true } }
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function addCustomer(data: any) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session) return { success: false, error: "অননুমোদিত! দয়া করে লগইন করুন (Unauthorized)." };

    const validated = customerSchema.safeParse(data);
    if (!validated.success) return { success: false, error: validated.error.issues[0].message };
    
    // Auto-generate code if not provided
    const customerData = { ...validated.data };
    if (!customerData.code) {
      const lastCust = await db.customer.findFirst({
        orderBy: { createdAt: "desc" },
        select: { code: true }
      });
      let nextNum = 1001;
      if (lastCust?.code) {
        const match = lastCust.code.match(/\d+/);
        if (match) nextNum = parseInt(match[0]) + 1;
      }
      customerData.code = `CUST-${nextNum}`;
    }

    const customer = await db.customer.create({ data: customerData });
    revalidatePath("/customers");
    return { success: true, data: customer };
  } catch (error: any) {
    if (error.code === "P2002") return { success: false, error: "এই ফোন নম্বরটি ইতিমধ্যে সিস্টেমে আছে (Phone number already exists)" };
    return { success: false, error: "কাস্টমার যোগ করতে ব্যর্থ হয়েছে (Failed to add customer)" };
  }
}

export async function updateCustomer(id: string, data: any) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session) return { success: false, error: "অননুমোদিত! দয়া করে লগইন করুন (Unauthorized)." };

    const validated = customerSchema.safeParse(data);
    if (!validated.success) return { success: false, error: validated.error.issues[0].message };

    const customer = await db.customer.update({ where: { id }, data: validated.data });
    revalidatePath(`/customers/${id}`);
    revalidatePath("/customers");
    return { success: true, data: customer };
  } catch (error: any) {
    if (error.code === "P2002") return { success: false, error: "এই ফোন নম্বরটি অন্য একাউন্টে ব্যবহার করা হচ্ছে (Phone already in use)" };
    return { success: false, error: "তথ্য আপডেট করতে ব্যর্থ হয়েছে (Failed to update customer)" };
  }
}

export async function collectPayment(data: any) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session) return { success: false, error: "অননুমোদিত! দয়া করে লগইন করুন (Unauthorized)." };

    const validated = customerPaymentSchema.safeParse(data);
    if (!validated.success) return { success: false, error: validated.error.issues[0].message };
    const { customerId, amount, discount, method, description } = validated.data;

    const totalDeduction = amount + discount;
    await db.$transaction(async (tx) => {
      await tx.customer.update({
        where: { id: customerId },
        data: { dueBalance: { decrement: totalDeduction } },
      });
      await tx.transaction.create({
        data: {
          type: "IN",
          partyType: "CUSTOMER",
          partyId: customerId,
          amount,
          discount,
          method,
          description: description || "Payment received",
          customId: customerId,
        },
      });
    });
    revalidatePath(`/customers/${customerId}`);
    revalidatePath("/customers");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "পেমেন্ট সংগ্রহ করতে ব্যর্থ হয়েছে (Failed to collect payment)" };
  }
}

export async function deleteCustomer(id: string) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session) return { success: false, error: "অননুমোদিত! দয়া করে লগইন করুন (Unauthorized)." };

    await db.customer.delete({ where: { id } });
    revalidatePath("/customers");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "কাস্টমার ডিলিট করা সম্ভব নয়। তাদের কোনো লেনদেনের ইতিহাস আছে কি না যাচাই করুন। (Cannot delete customer with history)" };
  }
}
