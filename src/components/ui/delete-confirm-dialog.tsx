"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteConfirmDialogProps {
  onDelete: () => Promise<{ success: boolean; error?: string }>;
  title: string;
  description: string;
  itemName: string;
}

export function DeleteConfirmDialog({
  onDelete,
  title,
  description,
  itemName,
}: DeleteConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await onDelete();
    setIsDeleting(false);
    if (result.success) {
      setOpen(false);
    } else {
      alert(result.error || "একটি ভুল হয়েছে। পুনরায় চেষ্টা করুন।");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-10 bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-black font-outfit text-slate-900 tracking-tight">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-500 font-medium leading-relaxed mt-2 text-base">
            {description} <br />
            <span className="font-black text-rose-600 mt-2 block uppercase text-xs tracking-widest">
              Action: Deleting {itemName}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-8 gap-4">
          <AlertDialogCancel className="h-12 px-8 rounded-2xl border-2 border-slate-100 text-slate-600 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="h-12 px-8 rounded-2xl bg-rose-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-rose-700 shadow-xl shadow-rose-200/50"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Confirm Deletion"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
