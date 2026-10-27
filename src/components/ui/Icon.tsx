import type { SVGProps } from 'react';

const paths = {
  'arrow-right': <path d="M4 12h15M13 6l6 6-6 6" />,
  'arrow-up-right': <path d="M7 17 17 7M8.5 7H17v8.5" />,
  'arrow-left': <path d="M20 12H5M11 6l-6 6 6 6" />,
  phone: <path d="M6.6 3.5h2.6l1.6 4.4-2 1.3a12 12 0 0 0 6 6l1.3-2 4.4 1.6v2.6a2 2 0 0 1-2.1 2A17.5 17.5 0 0 1 4.5 5.6a2 2 0 0 1 2.1-2.1Z" />,
  pin: (
    <>
      <path d="M12 21s-6.5-6-6.5-11.5a6.5 6.5 0 0 1 13 0C18.5 15 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  menu: <path d="M4 9h16M4 15h16" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  alert: <path d="M12 3.5 21 19.5H3L12 3.5ZM12 10v4M12 16.8v.2" />,
  calendar: (
    <>
      <rect x="4" y="5.5" width="16" height="14" rx="1.5" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    </>
  ),
  car: <path d="M4 15.5v-3l2-4.5h12l2 4.5v3M4 15.5h16M4 15.5v2.5h3v-2.5M17 15.5v2.5h3v-2.5M7.5 12.5h.01M16.5 12.5h.01" />,
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
    </>
  ),
  route: <path d="M6 19.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM18 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM8.5 17H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5" />,
  copy: (
    <>
      <rect x="8.5" y="8.5" width="11" height="11" rx="1.5" />
      <path d="M15.5 8.5v-3a1 1 0 0 0-1-1h-9a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3" />
    </>
  ),
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, className = 'size-5', ...rest }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
