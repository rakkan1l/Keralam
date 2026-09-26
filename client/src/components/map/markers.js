export function toMarker(doc, kind = 'place', href) {
  const c = doc?.location?.coordinates;
  if (!c) return null;
  return { id: String(doc._id), lng: c[0], lat: c[1], title: doc.name || doc.title, subtitle: doc.district, href, kind: kind === 'place' && doc.hiddenGem ? 'gem' : kind };
}
