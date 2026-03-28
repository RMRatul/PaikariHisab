"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function SearchBar({ placeholder = "Search..." }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    }, 250); // 250ms debounce for ultra-fast perceived "binary-search" tier performance
  };

  return (
    <div className="relative">
      <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isPending ? "animate-pulse text-primary" : "text-slate-400"}`} />
      <Input
        className="pl-9 w-72"
        placeholder={placeholder}
        defaultValue={searchParams.get("q") ?? ""}
        onChange={handleSearch}
      />
    </div>
  );
}
