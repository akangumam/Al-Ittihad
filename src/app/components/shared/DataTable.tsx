import { cn } from "@/lib/utils";
import type { ReactNode, CSSProperties } from "react";

export function DataTable({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <table className={cn("w-full text-sm", className)}>{children}</table>;
}

export function Th({
  children,
  align = "left",
  className,
}: {
  children?: ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}) {
  return (
    <th
      className={cn(
        "text-xs font-medium text-[#9CA3A0] uppercase tracking-wide py-3",
        align === "left" && "text-left",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className
      )}
    >
      {children}
    </th>
  );
}

export function Tr({
  children,
  className,
  style,
}: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <tr
      className={cn("border-b border-border", className)}
      style={style}
    >
      {children}
    </tr>
  );
}
