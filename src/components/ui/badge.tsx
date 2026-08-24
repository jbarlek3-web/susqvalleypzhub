import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
  {
    variants: {
      variant: {
        default: "bg-primary-container text-on-primary",
        lead: "bg-primary-fixed text-on-primary-fixed",
        permitting: "bg-secondary-container text-on-secondary-container",
        diligence: "bg-surface-highest text-on-surface",
        approved: "bg-secondary text-on-secondary",
        outline: "border border-outline-variant text-on-surface-variant",
        warn: "bg-destructive/10 text-destructive",
        flood: "bg-flood/15 text-flood",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
