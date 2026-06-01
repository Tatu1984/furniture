import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const config: Record<string, { label: string; className: string }> = {
  NEW: {
    label: "New",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  CONTACTED: {
    label: "Contacted",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  QUOTED: {
    label: "Quoted",
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
  CONFIRMED: {
    label: "Confirmed",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  CLOSED: {
    label: "Closed",
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

export function InquiryStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const c = config[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-800 border-gray-200",
  };
  return (
    <Badge variant="outline" className={cn("font-medium", c.className, className)}>
      {c.label}
    </Badge>
  );
}
