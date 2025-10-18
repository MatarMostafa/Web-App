import * as React from "react";
import NextLink from "next/link";
import { type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { buttonVariants } from "./button";

export interface LinkProps
  extends React.ComponentProps<typeof NextLink>,
    VariantProps<typeof buttonVariants> {
  className?: string;
}

const Link = React.forwardRef<React.ComponentRef<typeof NextLink>, LinkProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <NextLink
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Link.displayName = "Link";

export { Link };
