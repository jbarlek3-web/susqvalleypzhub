import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-150 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary-container text-on-primary hover:bg-primary",
        solid: "bg-primary text-on-primary hover:bg-primary-container",
        secondary: "bg-secondary text-on-secondary hover:bg-on-secondary-container",
        outline:
          "border border-outline-variant bg-card text-on-surface hover:bg-surface-low",
        ghost: "text-on-surface hover:bg-surface-container",
        nav: "text-on-primary/80 hover:text-on-primary hover:bg-primary-container",
        destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
        link: "text-primary-container underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 rounded-sm px-3 text-xs",
        lg: "h-12 px-6",
        icon: "size-10",
        pill: "h-9 rounded-full px-4",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";
