import { useState } from 'react';
import SceneArt, { sceneFor } from './SceneArt';
import { cx } from '../../utils/format';

/** Lazy-loaded image that falls back to illustrated scene art when missing or broken. */
export default function SmartImage({ image, alt, categories, kind, seed, className = '', sizes, eager = false }) {
  const [failed, setFailed] = useState(false);
  const url = image?.url;
  if (!url || failed) {
    return <SceneArt scene={sceneFor(categories, kind)} seed={seed || alt} className={cx('h-full w-full', className)} label={alt} />;
  }
  return (
    <img
      src={url}
      alt={image.alt || alt || ''}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      sizes={sizes}
      onError={() => setFailed(true)}
      className={cx('h-full w-full object-cover', className)}
    />
  );
}
