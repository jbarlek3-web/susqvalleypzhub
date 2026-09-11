import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

export function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn(
        "text-xs font-semibold uppercase tracking-wider text-on-surface-variant",
        className,
      )}
      {...props}
    />
  );
}
