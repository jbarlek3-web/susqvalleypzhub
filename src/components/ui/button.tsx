import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium select-none transition-all duration-150 ease-out active:scale-[0.97] active:duration-75 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100 [&_svg]:size-4 [&_svg]:shrink-0 shadow-xs hover:shadow-sm",
  {
    variants: {
      variant: {
        default: "border border-primary/25 bg-card text-primary hover:bg-primary/5 hover:border-primary/45 active:bg-primary/10",
        solid: "border border-primary/20 bg-primary text-on-primary hover:bg-primary/90 shadow-sm",
        secondary: "border border-secondary/30 bg-card text-secondary hover:bg-secondary-container hover:border-secondary/50",
        outline: "border border-outline-variant/80 bg-card text-on-surface hover:bg-surface-low hover:border-outline",
        ghost: "text-on-surface hover:bg-surface-container shadow-none hover:shadow-none",
        nav: "text-primary hover:bg-primary-fixed shadow-none hover:shadow-none",
        destructive: "bg-destructive text-destructive-foreground hover:opacity-90 shadow-sm",
        link: "text-primary-container underline-offset-4 hover:underline shadow-none hover:shadow-none",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "size-10",
        pill: "h-9 rounded-full px-4",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
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
