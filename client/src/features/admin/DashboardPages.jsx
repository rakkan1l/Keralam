import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Star, Check, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import { ErrorState } from '../../components/ui/States';
import { PageLoader } from '../../components/ui/PageLoader';
import { PageHeader, Stat, StatusPill, Table } from './ui';
import { adminApi, errorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate, cx } from '../../utils/format';

function useAdminQuery(key, fn) {
  return useQuery({ queryKey: ['admin', ...key], queryFn: fn });
}
function Guard({ q, children }) {
  if (q.error) return <ErrorState error={q.error} onRetry={q.refetch} />;
  if (q.isLoading) return <PageLoader />;
  return children(q.data);
}

export function Overview() {
  const q = useAdminQuery(['overview'], adminApi.overview);
  return (
    <Guard q={q}>
      {(d) => (
        <div>
          <PageHeader title="Dashboard" subtitle="Live counts from the database." />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Total destinations" value={d.totals.totalPlaces} />
            <Stat label="Published destinations" value={d.totals.published} />
            <Stat label="Pending verification" value={d.totals.pendingVerification} tone={d.totals.pendingVerification ? 'warn' : 'default'} hint="Needs verification or update" />
            <Stat label="Users" value={d.totals.users} />
            <Stat label="Events" value={d.totals.events} />
            <Stat label="Reviews" value={d.totals.reviews} hint={`${d.totals.pendingReviews} awaiting moderation`} />
            <Stat label="Open reports" value={d.totals.openReports} tone={d.totals.openReports ? 'warn' : 'default'} />
            <Stat label="Searches (7 days)" value={d.searchActivity.last7Days} hint={`${d.searchActivity.zeroResultLast7Days} returned no results`} />
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="card p-5">
              <h2 className="mb-3 font-sans text-base font-semibold">Destinations by status</h2>
              <ul className="space-y-2 text-sm">
                {Object.entries(d.statusBreakdown).map(([s, n]) => (
                  <li key={s} className="flex items-center justify-between"><Link to={`/admin/r/places`} className="hover:underline"><StatusPill status={s} /></Link><span className="font-medium">{n}</span></li>
                ))}
              </ul>
            </div>
            <div className="card p-5">
              <div className="mb-3 flex items-center justify-between"><h2 className="font-sans text-base font-semibold">Recent reports</h2><Link to="/admin/reports" className="text-sm text-forest-700 hover:underline">All reports</Link></div>
              <ul className="divide-y divide-sand-200 text-sm">
                {d.recentReports.map((r) => (
                  <li key={r._id} className="flex items-start justify-between gap-3 py-2">
                    <span><strong>{r.kind}</strong> · {r.targetName || '—'}<br /><span className="text-muted">{r.message.slice(0, 90)}</span></span>
                    <StatusPill status={r.status} />
                  </li>
                ))}
                {!d.recentReports.length && <li className="py-2 text-muted">No reports.</li>}
              </ul>
            </div>
          </div>
        </div>
      )}
    </Guard>
  );
}

export function Reports() {
  const toast = useToast();
  const qc = useQueryClient();
  const [status, setStatus] = useState('open');
  const q = useQuery({ queryKey: ['admin', 'reports', status], queryFn: () => adminApi.list('reports', { status: status || undefined, limit: 50 }) });
  const update = useMutation({
    mutationFn: ({ id, status: s }) => adminApi.moderate('reports', id, { status: s }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'reports'] }),
    onError: (e) => toast.error(errorMessage(e)),
  });
  const hrefs = { place: 'places', business: 'businesses', stay: 'stays', event: 'events', dish: 'dishes' };
  return (
    <div>
      <PageHeader title="Reports" subtitle="Incorrect information, duplicates, closures and safety reports from users." actions={
        <select className="input w-44" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          {['', 'open', 'in_review', 'resolved', 'dismissed'].map((s) => <option key={s} value={s}>{s || 'All'}</option>)}
        </select>
      } />
      <Guard q={q}>
        {(d) => (
          <Table
            rows={d.data}
            columns={[
              { key: 'kind', label: 'Kind', render: (r) => <strong>{r.kind}</strong> },
              { key: 'target', label: 'Item', render: (r) => (r.targetId && hrefs[r.targetType] ? <Link className="text-forest-700 hover:underline" to={`/admin/r/${hrefs[r.targetType]}/${r.targetId}`}>{r.targetName || r.targetId}</Link> : r.targetName || '—') },
              { key: 'message', label: 'Message', render: (r) => <span className="block max-w-md">{r.message}{r.evidenceUrl && <a className="ml-1 text-forest-700 underline" href={r.evidenceUrl} target="_blank" rel="noreferrer">source</a>}</span> },
              { key: 'reporter', label: 'From', render: (r) => r.reporter?.email || r.reporterEmail || 'Guest' },
              { key: 'createdAt', label: 'Date', render: (r) => formatDate(r.createdAt) },
              { key: 'status', label: 'Status', render: (r) => <StatusPill status={r.status} /> },
              { key: 'actions', label: '', render: (r) => (
                <div className="flex gap-1">
                  {['in_review', 'resolved', 'dismissed'].filter((s) => s !== r.status).map((s) => <Button key={s} size="sm" variant="ghost" onClick={() => update.mutate({ id: r._id, status: s })}>{s.replace('_', ' ')}</Button>)}
                </div>
              ) },
            ]}
          />
        )}
      </Guard>
    </div>
  );
}

export function Moderation() {
  const toast = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = useState('reviews');
  const [status, setStatus] = useState('pending');
  const q = useQuery({ queryKey: ['admin', tab, status], queryFn: () => adminApi.list(tab, { status, limit: 50 }) });
  const act = useMutation({
    mutationFn: ({ id, s }) => adminApi.moderate(tab, id, { status: s }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', tab] }),
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <div>
      <PageHeader title="Community moderation" subtitle="Approve reviews before they appear. Community updates publish immediately (labelled unverified) and can be hidden here." />
      <div className="mb-4 flex flex-wrap gap-2">
        {[['reviews', 'Reviews'], ['community-updates', 'Community updates']].map(([k, l]) => <button key={k} type="button" className={cx('chip', tab === k && 'chip-active')} onClick={() => { setTab(k); setStatus(k === 'reviews' ? 'pending' : 'approved'); }}>{l}</button>)}
        <select className="input w-40" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          {['pending', 'approved', 'rejected'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <Guard q={q}>
        {(d) => (
          <Table
            rows={d.data}
            columns={[
              { key: 'user', label: 'User', render: (r) => r.user?.email || '—' },
              { key: 'target', label: 'Target', render: (r) => `${r.targetType}` },
              tab === 'reviews'
                ? { key: 'content', label: 'Review', render: (r) => <span className="block max-w-md">{'★'.repeat(r.rating)} <strong>{r.title}</strong> {r.text}{r.photos?.length ? ` (+${r.photos.length} photos)` : ''}</span> }
                : { key: 'content', label: 'Update', render: (r) => <span>{r.kind}: {r.level} {r.note && `— ${r.note}`}</span> },
              { key: 'createdAt', label: 'Date', render: (r) => formatDate(r.createdAt) },
              { key: 'status', label: 'Status', render: (r) => <StatusPill status={r.status} /> },
              { key: 'a', label: '', render: (r) => (
                <div className="flex gap-1">
                  {r.status !== 'approved' && <Button size="sm" variant="secondary" onClick={() => act.mutate({ id: r._id, s: 'approved' })}><Check className="size-4" aria-hidden />Approve</Button>}
                  {r.status !== 'rejected' && <Button size="sm" variant="ghost" onClick={() => act.mutate({ id: r._id, s: 'rejected' })}><X className="size-4" aria-hidden />Reject</Button>}
                </div>
              ) },
            ]}
          />
        )}
      </Guard>
    </div>
  );
}

export function Trending() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const [resource, setResource] = useState('places');
  const q = useQuery({ queryKey: ['admin', resource, 'trending'], queryFn: () => adminApi.list(resource, { status: 'published', limit: 100 }) });
  const feature = useMutation({
    mutationFn: ({ id, body }) => adminApi.feature(resource, id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', resource] }),
    onError: (e) => toast.error(errorMessage(e)),
  });
  const nameKey = resource === 'events' ? 'title' : 'name';
  const rows = [...(q.data?.data || [])].sort((a, b) => Number(b.featured) - Number(a.featured) || (b.editorialRank || 0) - (a.editorialRank || 0));
  return (
    <div>
      <PageHeader title="Trending & editorial picks" subtitle="Trending = recent views + saves + searches + event interest, plus an editorial boost for featured items and editorial rank. Social-media popularity is not used." />
      <div className="mb-4 flex gap-2">{['places', 'businesses', 'events', 'stays', 'dishes'].map((r) => <button key={r} type="button" className={cx('chip', resource === r && 'chip-active')} onClick={() => setResource(r)}>{r}</button>)}</div>
      {!isAdmin && <p className="mb-3 text-sm text-muted">Only administrators can change featured items.</p>}
      <Guard q={q}>
        {() => (
          <Table
            rows={rows}
            columns={[
              { key: nameKey, label: 'Name', render: (r) => <Link to={`/admin/r/${resource}/${r._id}`} className="font-medium hover:underline">{r[nameKey]}</Link> },
              { key: 'district', label: 'District' },
              { key: 'views', label: 'Views', render: (r) => r.stats?.views ?? 0 },
              { key: 'saves', label: 'Saves', render: (r) => r.stats?.saves ?? 0 },
              { key: 'rank', label: 'Editorial rank', render: (r) => r.editorialRank || 0 },
              { key: 'featured', label: 'Featured', render: (r) => (
                <Button size="sm" disabled={!isAdmin} variant={r.featured ? 'primary' : 'secondary'} onClick={() => feature.mutate({ id: r._id, body: { featured: !r.featured } })}><Star className={cx('size-4', r.featured && 'fill-current')} aria-hidden />{r.featured ? 'Featured' : 'Feature'}</Button>
              ) },
            ]}
          />
        )}
      </Guard>
    </div>
  );
}

export function UsersPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const q = useQuery({ queryKey: ['admin', 'users', search], queryFn: () => adminApi.list('users', { q: search || undefined, limit: 50 }) });
  const update = useMutation({
    mutationFn: ({ id, body }) => adminApi.moderate('users', id, body),
    onSuccess: () => { toast.success('Updated'); qc.invalidateQueries({ queryKey: ['admin', 'users'] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <div>
      <PageHeader title="Users" subtitle="Roles: user, contributor, editor (content editing), admin (verification, publishing, users)." actions={<input className="input w-64" placeholder="Search name or email" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search users" />} />
      <Guard q={q}>
        {(d) => (
          <Table
            rows={d.data}
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'createdAt', label: 'Joined', render: (r) => formatDate(r.createdAt) },
              { key: 'lastLoginAt', label: 'Last login', render: (r) => (r.lastLoginAt ? formatDate(r.lastLoginAt) : '—') },
              { key: 'role', label: 'Role', render: (r) => (
                <select className="input h-9 w-36 py-0" value={r.role} onChange={(e) => update.mutate({ id: r._id, body: { role: e.target.value } })} aria-label={`Role for ${r.email}`}>
                  {['user', 'contributor', 'editor', 'admin'].map((x) => <option key={x}>{x}</option>)}
                </select>
              ) },
              { key: 'isActive', label: 'Active', render: (r) => <input type="checkbox" className="size-4 accent-forest-700" checked={r.isActive} onChange={(e) => update.mutate({ id: r._id, body: { isActive: e.target.checked } })} aria-label={`Active: ${r.email}`} /> },
            ]}
          />
        )}
      </Guard>
    </div>
  );
}

const METRICS = [
  ['search', 'Searches'],
  ['view', 'Destination views'],
  ['save', 'Saves'],
  ['route_request', 'Route requests'],
  ['trip_created', 'Trips created'],
  ['zero_result_search', 'Zero-result searches'],
];

/** Single-series daily bar chart with per-bar hover values. */
function DailyBars({ daily, type, days }) {
  const byDate = Object.fromEntries(daily.filter((d) => d.type === type).map((d) => [d.date, d.count]));
  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() - (days - 1 - i) * 86400000);
    return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  });
  const values = dates.map((d) => byDate[d] || 0);
  const max = Math.max(1, ...values);
  return (
    <div>
      <div className="flex h-40 items-end gap-[2px] border-b border-sand-300" role="img" aria-label={`Daily ${type} counts`}>
        {values.map((v, i) => (
          <div key={dates[i]} className="group relative flex h-full flex-1 items-end">
            <div className="w-full rounded-t-[4px] bg-forest-600 transition-colors group-hover:bg-forest-800" style={{ height: `${(v / max) * 100}%`, minHeight: v ? 2 : 0 }} />
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-forest-950 px-2 py-1 text-xs text-white group-hover:block">{dates[i]}: {v}</span>
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted"><span>{dates[0]}</span><span>max {max}</span><span>{dates.at(-1)}</span></div>
    </div>
  );
}

export function Analytics() {
  const [days, setDays] = useState(30);
  const [metric, setMetric] = useState('search');
  const q = useQuery({ queryKey: ['admin', 'analytics', days], queryFn: () => adminApi.analytics(days) });
  return (
    <div>
      <PageHeader title="Analytics" subtitle="First-party events stored in MongoDB (kept 180 days)." actions={
        <select className="input w-40" value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label="Range">
          {[7, 30, 90, 180].map((d) => <option key={d} value={d}>Last {d} days</option>)}
        </select>
      } />
      <Guard q={q}>
        {(d) => (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-6">
              {METRICS.map(([k, l]) => <Stat key={k} label={l} value={d.totals[k] || 0} />)}
            </div>
            <div className="card p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-sans text-base font-semibold">{METRICS.find(([k]) => k === metric)[1]} per day</h2>
                <div className="flex flex-wrap gap-1.5">{METRICS.map(([k, l]) => <button key={k} type="button" className={cx('chip py-1 text-xs', metric === k && 'chip-active')} onClick={() => setMetric(k)}>{l}</button>)}</div>
              </div>
              <DailyBars daily={d.daily} type={metric} days={days} />
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <div>
                <h2 className="mb-2 font-sans text-base font-semibold">Top searches</h2>
                <Table rows={d.topSearches} columns={[{ key: 'query', label: 'Query' }, { key: 'count', label: 'Count' }]} />
              </div>
              <div>
                <h2 className="mb-2 font-sans text-base font-semibold">Zero-result searches</h2>
                <Table rows={d.zeroResultSearches} columns={[{ key: 'query', label: 'Query' }, { key: 'count', label: 'Count' }]} empty="None — great." />
              </div>
              <div>
                <h2 className="mb-2 font-sans text-base font-semibold">Most viewed destinations</h2>
                <Table rows={d.topViewed} columns={[{ key: 'name', label: 'Place', render: (r) => <Link className="hover:underline" to={`/places/${r.slug}`}>{r.name}</Link> }, { key: 'views', label: 'Views' }]} />
              </div>
            </div>
          </div>
        )}
      </Guard>
    </div>
  );
}

export function AiKnowledge() {
  const q = useAdminQuery(['ai'], adminApi.ai);
  return (
    <Guard q={q}>
      {(d) => (
        <div>
          <PageHeader title="AI knowledge management" subtitle="The trip builder and assistant only retrieve published records and approved knowledge notes." actions={<Button to="/admin/r/knowledge">Manage knowledge notes</Button>} />
          <div className="card mb-6 p-5 text-sm">
            <p><strong>Provider:</strong> {d.provider}</p>
            <p className="mt-1 text-muted">Set AI_PROVIDER=anthropic and ANTHROPIC_API_KEY on the server to enable AI planning. Keys never reach the browser.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Retrievable places" value={d.retrievableRecords.places} />
            <Stat label="Verified places" value={d.verification.verifiedPlaces} hint={`${d.verification.demoPlaces} are demo content`} />
            <Stat label="Places with verified hours" value={d.verification.withVerifiedHours} tone={d.verification.withVerifiedHours ? 'default' : 'warn'} />
            <Stat label="Places with verified fees" value={d.verification.withVerifiedFees} tone={d.verification.withVerifiedFees ? 'default' : 'warn'} />
            <Stat label="Food listings" value={d.retrievableRecords.food} />
            <Stat label="Stays" value={d.retrievableRecords.stays} />
            <Stat label="Approved knowledge notes" value={`${d.knowledgeNotes.approved} / ${d.knowledgeNotes.total}`} />
            <Stat label="Saved trips" value={d.savedTrips} />
          </div>
        </div>
      )}
    </Guard>
  );
}
