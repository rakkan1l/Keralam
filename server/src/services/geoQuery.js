/**
 * Runs a paginated list query, switching to $geoNear when a reference point is supplied
 * so every result carries `distanceKm` and can be sorted by distance.
 */
export async function geoList(Model, filter, { near, sort = { createdAt: -1 }, skip = 0, limit = 12, project } = {}) {
  if (near) {
    const geoNear = {
      near: { type: 'Point', coordinates: [near.lng, near.lat] },
      distanceField: 'distanceMeters',
      spherical: true,
      query: filter,
      key: 'location',
    };
    if (near.maxKm) geoNear.maxDistance = near.maxKm * 1000;
    const sortStage = near.sortByDistance === false ? sort : { distanceMeters: 1 };
    const pipeline = [
      { $geoNear: geoNear },
      {
        $facet: {
          items: [
            { $sort: sortStage },
            { $skip: skip },
            { $limit: limit },
            ...(project ? [{ $project: project }] : []),
          ],
          total: [{ $count: 'n' }],
        },
      },
    ];
    const [res] = await Model.aggregate(pipeline);
    const items = res.items.map((d) => ({ ...d, distanceKm: Math.round((d.distanceMeters / 1000) * 10) / 10 }));
    return { items, total: res.total[0]?.n || 0 };
  }
  const query = Model.find(filter).sort(sort).skip(skip).limit(limit).lean();
  if (project) query.select(project);
  const [items, total] = await Promise.all([query, Model.countDocuments(filter)]);
  return { items, total };
}

export const CARD_PROJECTION = {
  searchKeys: 0,
  descriptionMl: 0,
  description: 0,
  sources: 0,
  createdBy: 0,
  updatedBy: 0,
  __v: 0,
};
