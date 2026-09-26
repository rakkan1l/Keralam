import { cx } from '../../utils/format';

/** Single- or multi-select chip group backed by values; `labelFor` translates. */
export default function Chips({ options, value, onChange, labelFor = (v) => v, multiple = false, className = '', ariaLabel }) {
  const selected = multiple ? new Set(value || []) : new Set(value ? [value] : []);
  const toggle = (opt) => {
    if (multiple) {
      const next = new Set(selected);
      next.has(opt) ? next.delete(opt) : next.add(opt);
      onChange([...next]);
    } else {
      onChange(selected.has(opt) ? '' : opt);
    }
  };
  return (
    <div className={cx('flex flex-wrap gap-2', className)} role="group" aria-label={ariaLabel}>
      {options.map((opt) => (
        <button key={opt} type="button" aria-pressed={selected.has(opt)} onClick={() => toggle(opt)} className={cx('chip', selected.has(opt) && 'chip-active')}>
          {labelFor(opt)}
        </button>
      ))}
    </div>
  );
}
