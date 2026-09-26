import { cx } from '../../utils/format';

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <div className="mt-1 max-w-2xl text-sm text-muted">{subtitle}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({ label, value, tone = 'default', hint }) {
  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <p className="text-[13px] text-muted">{label}</p>
      <p className={cx('mt-1.5 text-3xl font-semibold tracking-tight tabular-nums', tone === 'warn' && value ? 'text-turmeric-600' : 'text-ink')}>{value ?? '—'}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

const STATUS_TONE = {
  draft: 'bg-sand-200 text-ink-soft',
  needs_verification: 'bg-turmeric-100 text-turmeric-600',
  verified: 'bg-lagoon-50 text-lagoon-700',
  published: 'bg-forest-50 text-forest-700',
  needs_update: 'bg-turmeric-100 text-turmeric-600',
  temporarily_closed: 'bg-laterite-50 text-laterite-700',
  archived: 'bg-sand-200 text-muted',
  open: 'bg-laterite-50 text-laterite-700',
  in_review: 'bg-turmeric-100 text-turmeric-600',
  resolved: 'bg-forest-50 text-forest-700',
  dismissed: 'bg-sand-200 text-muted',
  pending: 'bg-turmeric-100 text-turmeric-600',
  approved: 'bg-forest-50 text-forest-700',
  rejected: 'bg-laterite-50 text-laterite-700',
};
export function StatusPill({ status }) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap capitalize', STATUS_TONE[status] || 'bg-sand-200')}>
      <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {String(status).replace(/_/g, ' ')}
    </span>
  );
}

export function Table({ columns, rows, empty = 'Nothing here yet.' }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-line text-xs text-muted">
          <tr>{columns.map((c) => <th key={c.key} scope="col" className="px-4 py-3 font-medium capitalize">{c.label}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.length ? (
            rows.map((r, i) => (
              <tr key={r._id || i} className="transition-colors hover:bg-sand-50">
                {columns.map((c) => <td key={c.key} className="px-4 py-3 align-middle">{c.render ? c.render(r) : String(r[c.key] ?? '—')}</td>)}
              </tr>
            ))
          ) : (
            <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-muted">{empty}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/** Pill tabs used inside admin pages. */
export function Tabs({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded-lg bg-sand-200 p-0.5" role="tablist">
      {options.map(([v, l]) => (
        <button key={v} type="button" role="tab" aria-selected={value === v} onClick={() => onChange(v)} className={cx('h-8 rounded-md px-3 text-sm font-medium', value === v ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink')}>
          {l}
        </button>
      ))}
    </div>
  );
}
