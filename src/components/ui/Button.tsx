import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { Magnetic } from './Magnetic';

type Variant = 'primary' | 'outline' | 'outline-dark' | 'ink';

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-accent-ink hover:brightness-[1.06]',
  outline: 'border border-bone-100/25 text-bone-100 hover:border-bone-100/70 hover:bg-bone-100/[0.06]',
  'outline-dark': 'border border-ink-900/20 text-ink-900 hover:border-ink-900/70 hover:bg-ink-900/[0.04]',
  ink: 'bg-ink-900 text-bone-100 hover:bg-ink-700',
};

interface ButtonProps {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  size?: 'md' | 'lg';
  icon?: IconName | null;
  leadingIcon?: IconName;
  magnetic?: boolean;
  cursor?: 'cta' | 'link';
  className?: string;
  type?: 'button' | 'submit';
  onClick?: () => void;
  disabled?: boolean;
  external?: boolean;
  ariaLabel?: string;
}

/** Bouton / lien avec effet de « roulement » du libellé au survol. */
export function Button({
  children,
  href,
  variant = 'primary',
  size = 'md',
  icon = 'arrow-right',
  leadingIcon,
  magnetic = false,
  cursor,
  className = '',
  type = 'button',
  onClick,
  disabled,
  external,
  ariaLabel,
}: ButtonProps) {
  const sizing = size === 'lg' ? 'h-14 px-7 text-[1rem] sm:h-16 sm:px-8' : 'h-12 px-5 text-[0.95rem]';
  const classes = `group/btn relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-[3px] font-medium tracking-[-0.005em] whitespace-nowrap transition-[background-color,border-color,filter,color] duration-300 sm:w-auto disabled:pointer-events-none disabled:opacity-50 ${sizing} ${variants[variant]} ${className}`;

  const content = (
    <>
      {leadingIcon && <Icon name={leadingIcon} className="size-[1.15em] shrink-0" />}
      <span className="relative block overflow-hidden">
        <span className="block transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/btn:-translate-y-full">{children}</span>
        <span
          aria-hidden="true"
          className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/btn:translate-y-0"
        >
          {children}
        </span>
      </span>
      {icon && (
        <Icon name={icon} className="size-[1.1em] shrink-0 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/btn:translate-x-1" />
      )}
    </>
  );

  const dataCursor = cursor ?? (variant === 'primary' ? 'cta' : 'link');
  let el: ReactNode;
  if (href) {
    const isInternal = href.startsWith('/') && !external;
    el = isInternal ? (
      <Link href={href} className={classes} data-cursor={dataCursor} aria-label={ariaLabel} onClick={onClick}>
        {content}
      </Link>
    ) : (
      <a
        href={href}
        className={classes}
        data-cursor={dataCursor}
        aria-label={ariaLabel}
        onClick={onClick}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {content}
      </a>
    );
  } else {
    el = (
      <button type={type} className={classes} data-cursor={dataCursor} onClick={onClick} disabled={disabled} aria-label={ariaLabel}>
        {content}
      </button>
    );
  }
  return magnetic ? <Magnetic className="w-full sm:w-auto">{el}</Magnetic> : el;
}
