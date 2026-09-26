import { useState } from 'react';
import SceneArt, { sceneFor } from './SceneArt';
import { cx } from '../../utils/format';

/** Lazy photo with graceful fallback to editorial scene art when missing or broken. */
export default function SmartImage({ image, alt, categories, kind, scene, seed, className = '', sizes, eager = false }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const url = image?.url;
  if (!url || failed) {
    return <SceneArt scene={scene || sceneFor(categories, kind)} seed={seed || alt} className={cx('h-full w-full', className)} label={alt} />;
  }
  return (
    <img
      src={url}
      alt={image.alt || alt || ''}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      sizes={sizes}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      className={cx('h-full w-full object-cover transition-opacity duration-500', loaded ? 'opacity-100' : 'opacity-0', className)}
    />
  );
}
