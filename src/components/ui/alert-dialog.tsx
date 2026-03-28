"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const AlertDialogContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

const AlertDialog = ({ open: controlledOpen, onOpenChange, children }: AlertDialogProps) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  return (
    <AlertDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
};

const AlertDialogTrigger = ({ children, asChild }: { children: React.ReactElement; asChild?: boolean }) => {
  const { setOpen } = React.useContext(AlertDialogContext);
  
  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent) => {
      const childProps = children.props as any;
      if (childProps.onClick) childProps.onClick(e);
      setOpen(true);
    }
  } as any);
};

const AlertDialogContent = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const { open, setOpen } = React.useContext(AlertDialogContext);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={() => setOpen(false)}
      />
      <div className={cn("relative z-[101] animate-in zoom-in-95 duration-200 w-full max-w-lg overflow-hidden bg-white shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]", className)}>
        {children}
      </div>
    </div>,
    document.body
  );
};

const AlertDialogHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}>
    {children}
  </div>
);

const AlertDialogFooter = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}>
    {children}
  </div>
);

const AlertDialogTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h2 className={cn("text-lg font-semibold", className)}>{children}</h2>
);

const AlertDialogDescription = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={cn("text-sm text-slate-500", className)}>{children}</p>
);

const AlertDialogAction = ({ children, onClick, className, disabled }: { children: React.ReactNode; onClick?: (e: any) => void; className?: string; disabled?: boolean }) => (
  <button 
    disabled={disabled}
    onClick={onClick}
    className={cn("inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-50", className)}
  >
    {children}
  </button>
);

const AlertDialogCancel = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const { setOpen } = React.useContext(AlertDialogContext);
  return (
    <button 
      onClick={() => setOpen(false)}
      className={cn("inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold", className)}
    >
      {children}
    </button>
  );
};

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
