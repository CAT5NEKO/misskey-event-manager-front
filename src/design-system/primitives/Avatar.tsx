import { cn } from '../lib/cn';

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: AvatarSize;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'h-6 w-6 text-[0.6rem]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-[38px] w-[38px] text-sm',
};

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const initial = name?.trim().charAt(0) || '?';

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={cn(
          'shrink-0 rounded-ds-full bg-ds-surface-active object-cover',
          sizeClasses[size],
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-ds-full bg-ds-surface-active font-bold text-ds-text-muted',
        sizeClasses[size],
        className,
      )}
    >
      {initial}
    </div>
  );
}
