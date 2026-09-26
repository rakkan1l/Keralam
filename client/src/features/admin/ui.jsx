import { cx } from '../../utils/format';

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({ label, value, tone = 'default', hint }) {
  return (
    <div className={cx('card p-5', tone === 'warn' && 'ring-turmeric-400/50')}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl text-forest-950">{value ?? '—'}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

const STATUS_TONE = {
  draft: 'bg-sand-200 text-forest-900',
  needs_verification: 'bg-turmeric-100 text-turmeric-600',
  verified: 'bg-lagoon-50 text-lagoon-700',
  published: 'bg-forest-100 text-forest-800',
  needs_update: 'bg-turmeric-100 text-turmeric-600',
  temporarily_closed: 'bg-laterite-100 text-laterite-700',
  archived: 'bg-sand-300 text-muted',
  open: 'bg-laterite-100 text-laterite-700',
  in_review: 'bg-turmeric-100 text-turmeric-600',
  resolved: 'bg-forest-100 text-forest-800',
  dismissed: 'bg-sand-200 text-muted',
  pending: 'bg-turmeric-100 text-turmeric-600',
  approved: 'bg-forest-100 text-forest-800',
  rejected: 'bg-laterite-100 text-laterite-700',
};
export function StatusPill({ status }) {
  return <span className={cx('inline-block rounded-full px-2.5 py-0.5 text-xs font-medium', STATUS_TONE[status] || 'bg-sand-200')}>{String(status).replace(/_/g, ' ')}</span>;
}

export function Table({ columns, rows, empty = 'Nothing here yet.' }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-sand-200 bg-sand-50 text-xs uppercase tracking-wide text-muted">
          <tr>{columns.map((c) => <th key={c.key} scope="col" className="px-4 py-3 font-medium">{c.label}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-sand-200">
          {rows.length ? rows.map((r, i) => <tr key={r._id || i} className="hover:bg-sand-50">{columns.map((c) => <td key={c.key} className="px-4 py-3 align-top">{c.render ? c.render(r) : String(r[c.key] ?? '—')}</td>)}</tr>) : (
            <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-muted">{empty}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
