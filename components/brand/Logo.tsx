import { cn } from '@/lib/utils';

export const LOGO_URL = 'https://onegrasp.com/wp-content/uploads/2026/05/logo.png';

interface LogoMarkProps {
  size?: number;
  className?: string;
}

/** Just the logo image at a given height. */
export function LogoMark({ size = 32, className }: LogoMarkProps) {
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={LOGO_URL}
      alt="OneGrasp"
      style={{ height: size, width: 'auto' }}
      className={cn('shrink-0 object-contain', className)}
    />
  );
}

interface LogoProps {
  /** height of the logo in px */
  size?: number;
  /** light = for dark backgrounds (logo sits on a white pill so it stays legible) */
  variant?: 'default' | 'light';
  className?: string;
}

export default function Logo({ size = 34, variant = 'default', className }: LogoProps) {
  if (variant === 'light') {
    return (
      <span className={cn('inline-flex items-center bg-white rounded-lg px-2.5 py-1.5 shadow-sm', className)}>
        <LogoMark size={size} />
      </span>
    );
  }
  return <LogoMark size={size} className={className} />;
}
