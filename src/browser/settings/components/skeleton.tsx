import React from 'react';
import { cn } from '../../../lib/utils/render';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-primary/10', className)}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  );
}

export { Skeleton };
