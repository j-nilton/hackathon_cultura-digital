import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva("rounded-xl border text-card-foreground transition-all duration-300", {
  variants: {
    variant: {
      default: "bg-card border-border/50 shadow-sm",
      editorial:
        "bg-card border-border/50 shadow-[0_4px_20px_-4px_hsl(174_42%_35%_/_0.1),0_8px_40px_-8px_hsl(200_25%_15%_/_0.05)] hover:shadow-lg hover:border-primary/20",
      elevated:
        "bg-card border-transparent shadow-lg hover:shadow-xl",
      outlined:
        "bg-transparent border-border hover:border-primary/40",
      warm:
        "bg-[hsl(12,60%,92%)] border-secondary/20 shadow-[0_4px_20px_-4px_hsl(12_76%_61%_/_0.15),0_8px_40px_-8px_hsl(25_45%_55%_/_0.1)]",
      ai:
        "bg-card text-card-foreground border-[hsl(262,52%,55%)]/20 shadow-sm dark:border-[hsl(262,52%,55%)]/25",
      muted:
        "bg-muted/50 border-border/30",
      interactive:
        "bg-card border-border/50 shadow-sm hover:shadow-[0_4px_20px_-4px_hsl(174_42%_35%_/_0.1)] hover:-translate-y-1 cursor-pointer",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, className }))}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-display text-2xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
