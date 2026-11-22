import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '../lib/cn';

export type ButtonVariant =
  'primary' | 'secondary' | 'danger' | 'danger-ghost' | 'warning-ghost' | 'ghost' | 'link' | 'icon';

export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

const baseClass =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-focus focus-visible:ring-offset-2 focus-visible:ring-offset-ds-bg disabled:cursor-not-allowed disabled:opacity-50';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-ds-accent text-ds-on-accent hover:bg-ds-accent-hover',
  secondary: 'border-[0.5px] border-ds-border bg-ds-surface text-ds-text hover:bg-ds-surface-hover',
  danger: 'bg-ds-danger text-ds-on-accent hover:bg-ds-danger-hover',
  'danger-ghost': 'bg-transparent text-ds-danger-text hover:bg-ds-danger-subtle',
  'warning-ghost': 'bg-transparent text-ds-warning-text hover:bg-ds-warning-subtle',
  ghost: 'bg-transparent text-ds-text hover:bg-ds-surface-hover',
  link: 'bg-transparent px-0 text-ds-text underline-offset-4 hover:text-ds-text-strong hover:underline',
  icon: 'bg-transparent text-ds-text hover:bg-ds-surface-hover',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 rounded-ds-sm px-2.5 text-xs',
  md: 'h-9 min-w-[100px] rounded-ds-sm px-3.5 text-sm',
  lg: 'h-11 min-w-[120px] rounded-ds-sm px-5 text-base',
};

const iconSizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 w-8 rounded-ds-full',
  md: 'h-9 w-9 rounded-ds-full',
  lg: 'h-11 w-11 rounded-ds-full',
};

function buttonClass({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
}: ButtonStyleOptions) {
  const isLink = variant === 'link';
  const isIcon = variant === 'icon';

  return cn(
    baseClass,
    variantClasses[variant],
    isLink ? 'h-auto min-w-0 text-sm' : isIcon ? iconSizeClasses[size] : sizeClasses[size],
    fullWidth && 'w-full',
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Button({
  variant,
  size,
  fullWidth,
  leftIcon,
  rightIcon,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={buttonClass({ variant, size, fullWidth, className })} {...props}>
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}

interface ButtonLinkProps extends Omit<LinkProps, 'className'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function ButtonLink({
  variant,
  size,
  fullWidth,
  leftIcon,
  rightIcon,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonClass({ variant, size, fullWidth, className })} {...props}>
      {leftIcon}
      {children}
      {rightIcon}
    </Link>
  );
}
