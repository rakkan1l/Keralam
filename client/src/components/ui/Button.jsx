import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cx } from '../../utils/format';

const VARIANTS = {
  primary: 'bg-forest-800 text-white hover:bg-forest-900 active:bg-forest-950',
  secondary: 'bg-white text-ink border border-line hover:border-forest-300 hover:text-forest-800',
  ghost: 'text-ink-soft hover:bg-sand-200/70 hover:text-ink',
  light: 'bg-white text-ink hover:bg-sand-50 shadow-[var(--shadow-soft)]',
  glass: 'bg-white/15 text-white border border-white/30 backdrop-blur-md hover:bg-white/25',
  danger: 'bg-laterite-500 text-white hover:bg-laterite-600',
  // kept for backwards compatibility; maps to the primary style
  accent: 'bg-forest-800 text-white hover:bg-forest-900',
};
const SIZES = {
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-[15px] gap-2',
  icon: 'size-10 justify-center',
};

export default function Button({ as, to, href, variant = 'primary', size = 'md', loading = false, className = '', children, disabled, ...props }) {
  const classes = cx(
    'inline-flex shrink-0 items-center justify-center rounded-full font-medium whitespace-nowrap transition-[background-color,color,border-color,transform] duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    className,
  );
  const content = (
    <>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </>
  );
  if (to) return <Link to={to} className={classes} {...props}>{content}</Link>;
  if (href) return <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...props}>{content}</a>;
  const Comp = as || 'button';
  return (
    <Comp className={classes} disabled={disabled || loading} type={Comp === 'button' ? props.type || 'button' : undefined} {...props}>
      {content}
    </Comp>
  );
}
