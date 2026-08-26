import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
  {
    variants: {
      variant: {
        default: "border border-primary/30 bg-primary-fixed text-primary",
        lead: "border border-primary/30 bg-primary-fixed text-primary",
        permitting: "border border-secondary/30 bg-secondary-container text-secondary",
        diligence: "border border-outline-variant bg-surface-high text-on-surface",
        approved: "border border-secondary/30 bg-secondary-container text-secondary",
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
