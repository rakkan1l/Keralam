import { useMemo, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trash2, Upload } from 'lucide-react';
import Button from '../../components/ui/Button';
import Chips from '../../components/ui/Chips';
import { endpoints, errorMessage, errorDetails } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const NULLABLE_NUMBERS = new Set(['entryFee.amount', 'priceFrom']);

export const getPath = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
function setPath(obj, path, value) {
  const keys = path.split('.');
  let cur = obj;
  keys.slice(0, -1).forEach((k) => {
    if (cur[k] == null || typeof cur[k] !== 'object') cur[k] = {};
    cur = cur[k];
  });
  cur[keys.at(-1)] = value;
}
const pad = (n) => String(n).padStart(2, '0');
const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** API document → form values */
function toForm(fields, doc = {}) {
  const values = {};
  for (const f of fields) {
    if (!f.name) continue;
    const v = getPath(doc, f.name);
    let out;
    switch (f.type) {
      case 'tags':
        out = Array.isArray(v) ? v.join(', ') : '';
        break;
      case 'multi':
        out = Array.isArray(v) ? v : [];
        break;
      case 'bool':
        out = Boolean(v);
        break;
      case 'tri':
        out = v || 'unknown';
        break;
      case 'number':
        out = v ?? '';
        break;
      case 'point':
        out = v?.coordinates ? { lng: v.coordinates[0], lat: v.coordinates[1], approximate: Boolean(v.approximate) } : { lng: '', lat: '', approximate: false };
        break;
      case 'datetime':
        out = toLocalInput(v);
        break;
      case 'date':
        out = v ? String(v).slice(0, 10) : '';
        break;
      case 'images':
        out = Array.isArray(v) ? v.map((i) => ({ url: i.url || '', alt: i.alt || '', credit: i.credit || '' })) : [];
        break;
      case 'links':
        out = Array.isArray(v) ? v.map((l) => ({ label: l.label || '', url: l.url || '' })) : [];
        break;
      case 'sources':
        out = Array.isArray(v) ? v.map((s) => ({ label: s.label || '', url: s.url || '' })) : [];
        break;
      case 'hours':
        out = {
          ...Object.fromEntries(DAYS.map((d) => [d, !Array.isArray(v?.[d]) ? '' : v[d].length ? v[d].join(', ') : 'closed'])),
          open24h: Boolean(v?.open24h),
          verified: Boolean(v?.verified),
          notes: v?.notes || '',
        };
        break;
      default:
        out = v ?? '';
    }
    setPath(values, f.name, out);
  }
  return values;
}

/** Form values → API payload (empty values omitted, types converted). */
function toPayload(fields, values) {
  const out = {};
  for (const f of fields) {
    if (!f.name) continue;
    const v = getPath(values, f.name);
    let res;
    switch (f.type) {
      case 'tags':
        res = String(v || '').split(',').map((s) => s.trim()).filter(Boolean);
        if (f.numeric) res = res.map(Number).filter(Number.isFinite);
        break;
      case 'multi':
        res = v || [];
        break;
      case 'bool':
        res = Boolean(v);
        break;
      case 'number':
        res = v === '' || v == null ? (NULLABLE_NUMBERS.has(f.name) ? null : undefined) : Number(v);
        break;
      case 'point': {
        const lat = Number(v?.lat);
        const lng = Number(v?.lng);
        res = v?.lat !== '' && v?.lng !== '' && Number.isFinite(lat) && Number.isFinite(lng) ? { type: 'Point', coordinates: [lng, lat], approximate: Boolean(v.approximate) } : undefined;
        break;
      }
      case 'datetime':
        res = v ? new Date(v).toISOString() : undefined;
        break;
      case 'date':
        res = v || undefined;
        break;
      case 'images':
        res = (v || []).filter((i) => i.url).map((i) => ({ url: i.url.trim(), alt: i.alt || undefined, credit: i.credit || undefined }));
        break;
      case 'links':
      case 'sources':
        res = (v || []).filter((l) => l.url || l.label).map((l) => ({ label: l.label || undefined, url: l.url || undefined }));
        if (f.type === 'links') res = res.filter((l) => l.url);
        break;
      case 'hours': {
        if (!v) break;
        const hours = { open24h: Boolean(v.open24h), verified: Boolean(v.verified), notes: v.notes || undefined };
        for (const d of DAYS) {
          const s = String(v[d] || '').trim();
          if (!s) continue;
          hours[d] = s.toLowerCase() === 'closed' ? [] : s.split(',').map((x) => x.trim()).filter(Boolean);
        }
        res = hours;
        break;
      }
      default:
        res = typeof v === 'string' ? (v.trim() === '' ? undefined : v.trim()) : v;
    }
    if (res !== undefined) setPath(out, f.name, res);
  }
  return out;
}

function ArrayField({ control, register, name, columns, uploads }) {
  const { fields, append, remove } = useFieldArray({ control, name });
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const res = await endpoints.upload(file);
      append({ url: res.url, alt: '', credit: '' });
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };
  return (
    <div className="space-y-2">
      {fields.map((f, i) => (
        <div key={f.id} className="flex gap-2">
          {columns.map((c) => (
            <input key={c} aria-label={c} placeholder={c} className="input" {...register(`${name}.${i}.${c}`)} />
          ))}
          <button type="button" onClick={() => remove(i)} className="grid size-11 shrink-0 place-items-center rounded-xl hover:bg-sand-100" aria-label="Remove">
            <Trash2 className="size-4 text-laterite-600" />
          </button>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => append(Object.fromEntries(columns.map((c) => [c, ''])))}>
          <Plus className="size-4" aria-hidden /> Add
        </Button>
        {uploads !== undefined && (
          <label className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-sm font-medium ${uploads ? 'text-forest-800 hover:bg-forest-50' : 'cursor-not-allowed text-muted'}`} title={uploads ? '' : 'Configure Cloudinary on the server to enable uploads'}>
            <Upload className="size-4" aria-hidden /> {busy ? 'Uploading…' : 'Upload image'}
            <input type="file" accept="image/*" className="sr-only" disabled={!uploads || busy} onChange={upload} />
          </label>
        )}
        {uploads === false && <span className="text-xs text-muted">Uploads need Cloudinary — paste image URLs instead.</span>}
      </div>
    </div>
  );
}

export default function ResourceForm({ config, doc, onSubmit, submitting }) {
  const toast = useToast();
  const defaults = useMemo(() => toForm(config.fields, doc), [config, doc]);
  const { register, control, handleSubmit, setError, formState: { errors } } = useForm({ defaultValues: defaults });
  const { data: meta } = useQuery({ queryKey: ['meta'], queryFn: endpoints.meta, staleTime: 600_000 });

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(toPayload(config.fields, values));
    } catch (err) {
      for (const d of errorDetails(err)) setError(d.path, { message: d.message });
      toast.error(errorMessage(err));
    }
  });

  const err = (name) => getPath(errors, name)?.message;
  const fieldId = (name) => `f-${name.replace(/\./g, '-')}`;

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
        {config.fields.map((f, idx) => {
          if (f.type === 'section') return <h3 key={`s${idx}`} className="border-b border-sand-200 pb-1 pt-4 font-sans text-sm font-semibold uppercase tracking-wide text-forest-700 md:col-span-2">{f.label}</h3>;
          const id = fieldId(f.name);
          const wide = ['textarea', 'images', 'links', 'sources', 'hours', 'multi', 'point'].includes(f.type);
          const labelEl = (
            <label className="label" htmlFor={id}>
              {f.label}
              {f.required && <span className="text-laterite-600"> *</span>}
            </label>
          );
          let input;
          switch (f.type) {
            case 'textarea':
              input = <textarea id={id} rows={f.rows || 3} maxLength={f.maxLength} className="input" {...register(f.name, { required: f.required && 'Required' })} />;
              break;
            case 'number':
              input = <input id={id} type="number" step="any" className="input" {...register(f.name)} />;
              break;
            case 'select':
              input = (
                <select id={id} className="input" {...register(f.name, { required: f.required && 'Required' })}>
                  {!f.required && !f.options.includes('') && <option value="">—</option>}
                  {f.required && <option value="">Select…</option>}
                  {f.options.map((o) => <option key={o} value={o}>{o || '—'}</option>)}
                </select>
              );
              break;
            case 'tri':
              input = (
                <select id={id} className="input" {...register(f.name)}>
                  {['unknown', 'yes', 'no', 'partial'].map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              );
              break;
            case 'bool':
              return (
                <div key={f.name} className="flex items-start gap-2 self-end py-2">
                  <input id={id} type="checkbox" className="mt-0.5 size-4 accent-forest-700" {...register(f.name)} />
                  <div>
                    <label htmlFor={id} className="text-sm font-medium">{f.label}</label>
                    {f.help && <p className="text-xs text-muted">{f.help}</p>}
                  </div>
                </div>
              );
            case 'multi':
              input = <Controller name={f.name} control={control} render={({ field }) => <Chips options={f.options} value={field.value} multiple onChange={field.onChange} ariaLabel={f.label} />} />;
              break;
            case 'point':
              input = (
                <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
                  <input id={id} type="number" step="any" placeholder="Latitude" aria-label="Latitude" className="input" {...register(`${f.name}.lat`, { required: f.required && 'Required' })} />
                  <input type="number" step="any" placeholder="Longitude" aria-label="Longitude" className="input" {...register(`${f.name}.lng`, { required: f.required && 'Required' })} />
                  <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" className="accent-forest-700" {...register(`${f.name}.approximate`)} />approx.</label>
                </div>
              );
              break;
            case 'datetime':
              input = <input id={id} type="datetime-local" className="input" {...register(f.name, { required: f.required && 'Required' })} />;
              break;
            case 'date':
              input = <input id={id} type="date" className="input" {...register(f.name)} />;
              break;
            case 'images':
              input = <ArrayField control={control} register={register} name={f.name} columns={['url', 'alt', 'credit']} uploads={meta?.features?.uploads ?? false} />;
              break;
            case 'links':
            case 'sources':
              input = <ArrayField control={control} register={register} name={f.name} columns={['label', 'url']} />;
              break;
            case 'hours':
              input = (
                <div className="rounded-xl bg-sand-50 p-3 ring-1 ring-sand-200">
                  <p className="mb-2 text-xs text-muted">Per day: “09:00-17:00, 18:00-21:00”, “closed”, or leave blank for unknown.</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {DAYS.map((d) => (
                      <label key={d} className="flex items-center gap-2 text-sm">
                        <span className="w-10 capitalize text-muted">{d}</span>
                        <input className="input" {...register(`${f.name}.${d}`)} />
                      </label>
                    ))}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm">
                    <label className="flex items-center gap-1.5"><input type="checkbox" className="accent-forest-700" {...register(`${f.name}.open24h`)} />Open 24h</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" className="accent-forest-700" {...register(`${f.name}.verified`)} />Hours verified</label>
                  </div>
                  <input placeholder="Notes" aria-label="Opening hours notes" className="input mt-2" {...register(`${f.name}.notes`)} />
                </div>
              );
              break;
            default:
              input = <input id={id} type="text" className="input" {...register(f.name, { required: f.required && 'Required' })} />;
          }
          return (
            <div key={f.name} className={wide ? 'md:col-span-2' : ''}>
              {labelEl}
              {input}
              {f.help && <p className="mt-1 text-xs text-muted">{f.help}</p>}
              {err(f.name) && <p role="alert" className="mt-1 text-xs text-laterite-700">{err(f.name)}</p>}
            </div>
          );
        })}
      </div>
      <div className="sticky bottom-0 -mx-6 flex justify-end gap-2 border-t border-sand-200 bg-white/95 px-6 py-3 backdrop-blur">
        <Button type="submit" loading={submitting}>Save</Button>
      </div>
    </form>
  );
}
