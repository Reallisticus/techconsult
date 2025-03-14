// src/components/ui/button.tsx
"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";
import { Magnetic } from "./magnetic";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-accent-500 text-white hover:bg-accent-400 hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]",
        gradient:
          "bg-gradient-to-r from-accent-600 to-accent-400 text-white hover:shadow-lg",
        primaryGradient:
          "bg-gradient-to-r from-primary-600 to-primary-400 text-white hover:shadow-lg",
        outline:
          "border border-white/30 text-white backdrop-blur-sm hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]",
        ghost: "text-white hover:bg-white/10",
        secondary:
          "bg-secondary-500 text-white hover:bg-secondary-400 hover:shadow-[0_0_20px_rgba(5,150,105,0.4)]",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-9 px-4 py-1.5 text-sm",
        md: "h-11 px-6 py-2.5 text-base",
        lg: "h-12 px-8 py-3 text-lg",
        xl: "h-14 px-8 py-4 text-lg",
      },
      glow: {
        true: "group relative",
        false: "",
      },
      magnetic: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      glow: false,
      magnetic: false,
    },
  },
);

export interface ButtonProps extends VariantProps<typeof buttonVariants> {
  className?: string;
  glow?: boolean;
  magnetic?: boolean;
  magneticStrength?: number;
  asChild?: boolean;
  href?: string;
  children?: React.ReactNode;
}

type PolymorphicRef<C extends React.ElementType> =
  React.ComponentPropsWithRef<C>["ref"];

type PolymorphicComponentProps<
  C extends React.ElementType,
  Props = {},
> = Props &
  Omit<React.ComponentPropsWithoutRef<C>, keyof Props> & {
    as?: C;
  };

type ButtonComponent = <C extends React.ElementType = "button">(
  props: PolymorphicComponentProps<C, ButtonProps> & { ref?: React.Ref<any> },
) => React.ReactElement | null;

function ButtonInner<C extends React.ElementType = "button">(
  {
    as,
    className,
    variant,
    size,
    glow = false,
    magnetic = false,
    magneticStrength = 30,
    href,
    children,
    ...props
  }: PolymorphicComponentProps<C, ButtonProps>,
  ref: PolymorphicRef<C>,
) {
  const Comp = as || (href ? "a" : "button");

  const buttonContent = (
    <Comp
      ref={ref as any} // workaround to bypass ref type incompatibility
      href={href}
      className={cn(
        buttonVariants({ variant, size, glow, magnetic, className }),
      )}
      {...(props as any)} // explicitly cast props to any to resolve type incompatibility
    >
      {children}
      {glow && (
        <span className="absolute inset-0 z-[1] rounded-full bg-white/20 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100"></span>
      )}
    </Comp>
  );

  return magnetic ? (
    <Magnetic strength={magneticStrength}>{buttonContent}</Magnetic>
  ) : (
    buttonContent
  );
}

const Button = React.forwardRef(ButtonInner) as ButtonComponent;

export { Button, buttonVariants };
