"use server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { productSchema } from "@/lib/validations";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getProducts(searchQuery?: string) {
  const query = searchQuery?.trim();
  if (!query) {
    return await db.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
  }

  const tokens = query.split(/\s+/).filter(Boolean);
  
  return await db.product.findMany({
    where: {
      isActive: true,
      AND: tokens.map(token => ({
        OR: [
          { name: { contains: token } },
          { code: { contains: token } },
          { category: { contains: token } },
        ],
      })),
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function addProduct(data: any) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session) return { success: false, error: "অননুমোদিত! দয়া করে লগইন করুন (Unauthorized)." };

    const validated = productSchema.safeParse(data);
    if (!validated.success) return { success: false, error: validated.error.issues[0].message };

    const product = await db.product.create({ data: validated.data });
    revalidatePath("/inventory");
    return { success: true, data: product };
  } catch (error: any) {
    if (error.code === "P2002") return { success: false, error: "এই প্রোডাক্ট কোডটি ইতিপূর্বে ব্যবহার করা হয়েছে (Code already exists)" };
    return { success: false, error: "পণ্য যোগ করতে ব্যর্থ হয়েছে (Failed to add product)" };
  }
}

export async function updateProduct(id: string, data: any) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session) return { success: false, error: "অননুমোদিত! দয়া করে লগইন করুন (Unauthorized)." };

    const validated = productSchema.safeParse(data);
    if (!validated.success) return { success: false, error: validated.error.issues[0].message };

    const product = await db.product.update({ where: { id }, data: validated.data });
    revalidatePath(`/inventory/${id}`);
    revalidatePath("/inventory");
    return { success: true, data: product };
  } catch (error: any) {
    if (error.code === "P2002") return { success: false, error: "এই কোডটি অন্য একটি পণ্যে ব্যবহার করা হয়েছে।" };
    return { success: false, error: "তথ্য আপডেট করতে ব্যর্থ হয়েছে (Failed to update product)" };
  }
}

export async function deleteProduct(id: string) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session) return { success: false, error: "অননুমোদিত! দয়া করে লগইন করুন (Unauthorized)." };

    // Check for history
    const product = await db.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: { saleItems: true, purchaseItems: true }
        }
      }
    });

    if (!product) return { success: false, error: "পণ্যটি পাওয়া যায়নি।" };

    if (product._count.saleItems > 0 || product._count.purchaseItems > 0) {
      // Soft delete
      await db.product.update({
        where: { id },
        data: { isActive: false }
      });
      revalidatePath("/inventory");
      return { success: true, message: "পণ্যটি ইনভেন্টরি থেকে সরানো হয়েছে (ইতিহাস সংরক্ষিত আছে)" };
    }

    await db.product.delete({ where: { id } });
    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "পণ্য ডিলিট করতে ব্যর্থ হয়েছে (Failed to delete product)" };
  }
}
