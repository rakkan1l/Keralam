import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Plus, Search, ExternalLink, Star, Archive, BadgeCheck } from 'lucide-react';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import { ErrorState } from '../../components/ui/States';
import { PageLoader } from '../../components/ui/PageLoader';
import ResourceForm, { getPath } from './ResourceForm';
import { PageHeader, StatusPill, Table } from './ui';
import { RESOURCES } from './resources';
import { adminApi, errorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CONTENT_STATUSES } from '../../utils/constants';
import { formatDate } from '../../utils/format';

function cell(row, key) {
  const v = getPath(row, key);
  if (key === 'status') return <StatusPill status={v} />;
  if (typeof v === 'boolean') return v ? '✓' : '—';
  if (Array.isArray(v)) return v.slice(0, 3).join(', ');
  if (/Date$|At$/.test(key) && v) return formatDate(v);
  return v ?? '—';
}

export function ResourceList() {
  const { resource } = useParams();
  const config = RESOURCES[resource];
  const { isAdmin } = useAuth();
  const [filters, setFilters] = useState({ page: 1 });
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', resource, filters],
    queryFn: () => adminApi.list(resource, filters),
    enabled: Boolean(config),
    placeholderData: keepPreviousData,
  });
  if (!config) return <ErrorState error={{ message: 'Unknown resource' }} />;
  const nameField = config.nameField || 'name';
  const canWrite = !config.adminOnly || isAdmin;

  const columns = config.columns.map((key) => ({
    key,
    label: key.replace(/([A-Z])/g, ' $1'),
    render: key === nameField ? (r) => <Link to={`/admin/r/${resource}/${r._id}`} className="font-medium text-forest-800 hover:underline">{r[key]}</Link> : (r) => cell(r, key),
  }));
  if (config.publicPath) columns.push({ key: '_view', label: '', render: (r) => (r.slug ? <a href={config.publicPath(r)} target="_blank" rel="noreferrer" aria-label="View on site"><ExternalLink className="size-4 text-muted" /></a> : null) });

  const set = (patch) => setFilters((f) => ({ ...f, ...patch, page: patch.page || 1 }));
  return (
    <div>
      <PageHeader
        title={config.title}
        subtitle={config.workflow ? 'New items start as drafts. Admins verify and publish from the edit screen.' : undefined}
        actions={!config.noCreate && canWrite && <Button to={`/admin/r/${resource}/new`}><Plus className="size-4" aria-hidden />New {config.singular}</Button>}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <label className="relative">
          <span className="sr-only">Search</span>
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input className="input w-64 pl-9" placeholder="Search…" onChange={(e) => set({ q: e.target.value || undefined })} />
        </label>
        {config.workflow && (
          <select className="input w-52" aria-label="Status" onChange={(e) => set({ status: e.target.value || undefined })}>
            <option value="">All statuses</option>
            {CONTENT_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        )}
        {Object.entries(config.filters || {}).map(([key, options]) => (
          <select key={key} className="input w-48" aria-label={key} onChange={(e) => set({ [key]: e.target.value || undefined })}>
            <option value="">All {key}s</option>
            {options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}
      </div>
      {error ? <ErrorState error={error} onRetry={refetch} /> : isLoading ? <PageLoader /> : (
        <>
          <p className="mb-2 text-xs text-muted">{data.meta.total} total</p>
          <Table columns={columns} rows={data.data} />
          <Pagination meta={data.meta} onPage={(page) => set({ ...filters, page })} />
        </>
      )}
    </div>
  );
}

function WorkflowPanel({ resource, doc, onChanged }) {
  const toast = useToast();
  const [status, setStatus] = useState(doc.status);
  const [note, setNote] = useState('');
  const [rank, setRank] = useState(doc.editorialRank || 0);
  const change = useMutation({
    mutationFn: (body) => adminApi.setStatus(resource, doc._id, body),
    onSuccess: (d) => {
      toast.success(`Status: ${d.status.replace(/_/g, ' ')}`);
      onChanged(d);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const feature = useMutation({
    mutationFn: (body) => adminApi.feature(resource, doc._id, body),
    onSuccess: (d) => {
      toast.success('Saved');
      onChanged(d);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <div className="card space-y-4 p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-base font-semibold">Verification & publishing</h2>
        <StatusPill status={doc.status} />
      </div>
      {doc.verification?.verifiedAt ? (
        <p className="flex items-center gap-1.5 text-sm text-forest-700"><BadgeCheck className="size-4" aria-hidden />Verified {formatDate(doc.verification.verifiedAt)}{doc.verification.notes ? ` — ${doc.verification.notes}` : ''}</p>
      ) : (
        <p className="text-sm text-muted">Not yet verified.</p>
      )}
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="New status">
          {CONTENT_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <input className="input" placeholder="Note (e.g. checked with DTPC)" value={note} onChange={(e) => setNote(e.target.value)} aria-label="Verification note" />
        <Button onClick={() => change.mutate({ status, note: note || undefined })} loading={change.isPending}>Apply</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={() => change.mutate({ status: 'published', markVerified: true, note: note || undefined })}><BadgeCheck className="size-4" aria-hidden />Verify & publish</Button>
        <Button size="sm" variant="ghost" onClick={() => change.mutate({ status: 'archived' })}><Archive className="size-4" aria-hidden />Archive</Button>
      </div>
      {doc.featured !== undefined && (
        <div className="flex flex-wrap items-center gap-2 border-t border-sand-200 pt-4">
          <Button size="sm" variant={doc.featured ? 'primary' : 'secondary'} onClick={() => feature.mutate({ featured: !doc.featured })}><Star className="size-4" aria-hidden />{doc.featured ? 'Featured' : 'Feature'}</Button>
          <label className="flex items-center gap-2 text-sm">Editorial rank
            <input type="number" min={0} max={1000} className="input w-24" value={rank} onChange={(e) => setRank(Number(e.target.value))} />
          </label>
          <Button size="sm" variant="ghost" onClick={() => feature.mutate({ editorialRank: rank })}>Save rank</Button>
        </div>
      )}
    </div>
  );
}

export function ResourceEdit() {
  const { resource, id } = useParams();
  const config = RESOURCES[resource];
  const isNew = id === 'new';
  const { isAdmin } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: doc, isLoading, error, refetch } = useQuery({ queryKey: ['admin', resource, 'doc', id], queryFn: () => adminApi.get(resource, id), enabled: !isNew && Boolean(config) });

  const save = useMutation({
    mutationFn: (payload) => (isNew ? adminApi.create(resource, payload) : adminApi.update(resource, id, payload)),
    onSuccess: (saved) => {
      toast.success('Saved');
      qc.invalidateQueries({ queryKey: ['admin', resource] });
      if (isNew) navigate(`/admin/r/${resource}/${saved._id}`, { replace: true });
      else qc.setQueryData(['admin', resource, 'doc', id], saved);
    },
  });
  const remove = useMutation({
    mutationFn: () => adminApi.remove(resource, id, !config.workflow),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', resource] });
      navigate(`/admin/r/${resource}`);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  if (!config) return <ErrorState error={{ message: 'Unknown resource' }} />;
  if (!isNew && isLoading) return <PageLoader />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  const canWrite = !config.adminOnly || isAdmin;
  const title = isNew ? `New ${config.singular}` : doc[config.nameField || 'name'];

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <div className="card p-6">
        <PageHeader
          title={title}
          subtitle={<Link to={`/admin/r/${resource}`} className="hover:underline">← {config.title}</Link>}
          actions={!isNew && config.publicPath && doc.slug && <Button size="sm" variant="secondary" href={config.publicPath(doc)}><ExternalLink className="size-4" aria-hidden />View</Button>}
        />
        {canWrite ? (
          <ResourceForm key={doc?.updatedAt || 'new'} config={config} doc={doc} submitting={save.isPending} onSubmit={(payload) => save.mutateAsync(payload)} />
        ) : (
          <p className="text-sm text-muted">Only administrators can edit this resource.</p>
        )}
      </div>
      {!isNew && (
        <div className="space-y-4">
          {config.workflow && isAdmin && <WorkflowPanel resource={resource} doc={doc} onChanged={(d) => qc.setQueryData(['admin', resource, 'doc', id], d)} />}
          {config.workflow && !isAdmin && <div className="card p-5 text-sm text-muted">Status: <StatusPill status={doc.status} />. An administrator must verify and publish this item.</div>}
          <div className="card p-5 text-xs text-muted">
            <p>Created {formatDate(doc.createdAt)} · Updated {formatDate(doc.updatedAt)}</p>
            {!config.noCreate && canWrite && (
              <Button size="sm" variant="danger" className="mt-3" onClick={() => window.confirm(config.workflow ? 'Archive this item?' : 'Delete permanently?') && remove.mutate()}>
                {config.workflow ? 'Archive' : 'Delete'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
