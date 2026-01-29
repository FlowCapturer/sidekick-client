import type { HTMLAttributes } from 'react';

interface ITypographyHeading extends HTMLAttributes<HTMLHeadElement> {
  className?: string;
}

export function TypographyHeading({ className, ...props }: ITypographyHeading) {
  return <h4 className={`scroll-m-20 text-xl font-semibold tracking-tight ${className || ''}`} {...props} />;
}
