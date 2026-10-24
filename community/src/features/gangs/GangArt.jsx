import CityScene from '../../components/art/CityScene.jsx';

/** Supplied photography when available, otherwise deterministic generated art. */
export default function GangArt({ gang, focus = 'center', className = '' }) {
  if (gang.image) {
    return <img className={`gang-art ${className}`} src={gang.image} alt="" loading="lazy" decoding="async" />;
  }
  return (
    <div className={`gang-art ${className}`}>
      <CityScene seed={gang.art?.seed ?? 1} variant={gang.art?.variant ?? 'night'} focus={focus} layers={false} />
    </div>
  );
}

/** Emblem slot. Shows the official emblem, or an explicit empty frame. */
export function Emblem({ gang, numeral }) {
  return (
    <div className="emblem" aria-hidden={gang.emblem ? undefined : 'true'}>
      {gang.emblem ? (
        <img src={gang.emblem} alt={`${gang.name} emblem`} loading="lazy" decoding="async" />
      ) : (
        <span className="emblem__empty display">{numeral}</span>
      )}
    </div>
  );
}
