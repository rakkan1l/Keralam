import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cx } from '../../utils/format';

const VARIANTS = {
  primary: 'bg-forest-800 text-white hover:bg-forest-700 shadow-sm',
  accent: 'bg-laterite-500 text-white hover:bg-laterite-600 shadow-sm',
  secondary: 'bg-white text-forest-900 ring-1 ring-sand-300 hover:bg-sand-50 hover:ring-forest-300',
  ghost: 'text-forest-800 hover:bg-forest-50',
  danger: 'bg-laterite-700 text-white hover:bg-laterite-600',
  light: 'bg-white/95 text-forest-900 hover:bg-white shadow-sm backdrop-blur',
};
const SIZES = {
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  icon: 'size-10 justify-center',
};

export default function Button({ as, to, href, variant = 'primary', size = 'md', loading = false, className = '', children, disabled, ...props }) {
  const classes = cx(
    'inline-flex items-center justify-center rounded-full font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap',
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
