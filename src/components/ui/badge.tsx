import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow",
        outline: "text-foreground",
        // Variantes do produto
        level:
          "border-primary/20 bg-[hsl(174,35%,85%)] text-primary",
        ai:
          "border-[hsl(262,52%,55%)]/20 bg-[hsl(262,40%,95%)] text-[hsl(262,52%,55%)]",
        success:
          "border-[hsl(158,64%,40%)]/20 bg-[hsl(158,64%,40%)]/10 text-[hsl(158,64%,40%)]",
        warning:
          "border-[hsl(38,92%,50%)]/20 bg-[hsl(38,92%,50%)]/10 text-foreground",
        info:
          "border-[hsl(200,80%,50%)]/20 bg-[hsl(200,80%,50%)]/10 text-[hsl(200,80%,50%)]",
        coral:
          "border-secondary/20 bg-[hsl(12,60%,92%)] text-secondary",
        muted:
          "border-border bg-muted text-muted-foreground",
        // Séries escolares
        fundamental1:
          "border-primary/30 bg-[hsl(174,35%,85%)] text-[hsl(174,50%,28%)] font-semibold",
        fundamental2:
          "border-secondary/30 bg-[hsl(12,60%,92%)] text-secondary font-semibold",
        medio:
          "border-accent/30 bg-[hsl(38,35%,92%)] text-accent font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
