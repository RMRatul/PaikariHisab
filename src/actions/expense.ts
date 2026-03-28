"use server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { expenseSchema, expenseCategorySchema } from "@/lib/validations";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Category Actions
export async function getExpenseCategories() {
  return await db.expenseCategory.findMany({
    orderBy: { name: "asc" }
  });
}

export async function addExpenseCategory(data: { name: string }) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session) return { success: false, error: "অননুমোদিত! দয়া করে লগইন করুন (Unauthorized)." };

    const validated = expenseCategorySchema.safeParse(data);
    if (!validated.success) return { success: false, error: validated.error.issues[0].message };

    const category = await db.expenseCategory.create({
      data: validated.data
    });
    revalidatePath("/expenses");
    return { success: true, data: category };
  } catch (error) {
    return { success: false, error: "Category already exists or failed to create (কিছু ভুল হয়েছে)" };
  }
}

export async function updateExpenseCategory(id: string, name: string) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session) return { success: false, error: "অননুমোদিত! দয়া করে লগইন করুন (Unauthorized)." };

    const validated = expenseCategorySchema.safeParse({ name });
    if (!validated.success) return { success: false, error: validated.error.issues[0].message };

    const category = await db.expenseCategory.update({
      where: { id },
      data: validated.data
    });
    revalidatePath("/expenses");
    return { success: true, data: category };
  } catch (error) {
    return { success: false, error: "Failed to update category (কিছু ভুল হয়েছে)" };
  }
}

export async function deleteExpenseCategory(id: string) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session) return { success: false, error: "অননুমোদিত! দয়া করে লগইন করুন (Unauthorized)." };

    await db.expenseCategory.delete({ where: { id } });
    revalidatePath("/expenses");
    return { success: true };
  } catch (error) {
    return { success: false, error: "এই ক্যাটাগরির অধীনে খরচ আছে, তাই এটি ডিলিট করা সম্ভব নয়। আগে খরচগুলো ডিলিট করুন।" };
  }
}

// Expense Actions
export async function getExpenses() {
  return await db.expense.findMany({ 
    include: { category: true },
    orderBy: { date: "desc" } 
  });
}

export async function addExpense(data: any) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session) return { success: false, error: "অননুমোদিত! দয়া করে লগইন করুন (Unauthorized)." };

    const validated = expenseSchema.safeParse(data);
    if (!validated.success) return { success: false, error: validated.error.issues[0].message };
    const { categoryId, amount, description, date } = validated.data;
    
    const expense = await db.expense.create({
      data: {
        categoryId,
        amount,
        description,
        date: date ? new Date(date) : new Date(),
      },
    });
    revalidatePath("/expenses");
    revalidatePath("/reports");
    return { success: true, data: expense };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to add expense (কিছু ভুল হয়েছে)" };
  }
}

export async function updateExpense(id: string, data: any) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session) return { success: false, error: "অননুমোদিত! দয়া করে লগইন করুন (Unauthorized)." };

    const validated = expenseSchema.safeParse(data);
    if (!validated.success) return { success: false, error: validated.error.issues[0].message };
    const { categoryId, amount, description, date } = validated.data;
    
    const expense = await db.expense.update({
      where: { id },
      data: {
        categoryId,
        amount,
        description,
        date: date ? new Date(date) : new Date(),
      },
    });
    revalidatePath("/expenses");
    revalidatePath("/reports");
    return { success: true, data: expense };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update expense (কিছু ভুল হয়েছে)" };
  }
}

export async function deleteExpense(id: string) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session) return { success: false, error: "অননুমোদিত! দয়া করে লগইন করুন (Unauthorized)." };

    await db.expense.delete({ where: { id } });
    revalidatePath("/expenses");
    revalidatePath("/reports");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete expense (কিছু ভুল হয়েছে)" };
  }
}
