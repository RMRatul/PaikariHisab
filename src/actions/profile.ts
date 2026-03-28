"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function updateProfile(data: { email: string; name?: string }) {
  const session = await getServerSession(authOptions as any) as any;
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: {
        email: data.email,
        name: data.name,
      },
    });
    revalidatePath("/settings/profile");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002") return { success: false, error: "Email already in use" };
    return { success: false, error: "Failed to update profile" };
  }
}

export async function updatePassword(data: { currentPassword?: string; newPassword: string }) {
  const session = await getServerSession(authOptions as any) as any;
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user) return { success: false, error: "User not found" };

    // If it's the first time (isDefaultPassword), we might skip currentPassword check or enforce it if they know it
    const isMatched = await bcrypt.compare(data.currentPassword || "", user.password);
    if (!user.isDefaultPassword && !isMatched) {
      return { success: false, error: "Current password incorrect" };
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await db.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
        isDefaultPassword: false,
        passwordHistory: {
          create: {} // Creates a record with default createdAt pointing to userId
        }
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update password" };
  }
}
