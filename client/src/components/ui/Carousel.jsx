import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cx } from '../../utils/format';

/** Horizontal snap carousel with previous/next controls on larger screens. */
export default function Carousel({ children, itemClass = 'w-[78%] sm:w-[46%] lg:w-[31.5%]', label, dark = false }) {
  const ref = useRef(null);
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: 'smooth' });
  const btn = cx('grid size-10 place-items-center rounded-full border transition', dark ? 'border-white/25 text-white hover:bg-white/10' : 'border-line bg-white text-ink hover:border-forest-300');
  return (
    <div role="region" aria-roledescription="carousel" aria-label={label}>
      <div ref={ref} className="scroll-row gap-5">
        {[children].flat().map((child, i) => (
          <div key={child?.key ?? i} className={cx('shrink-0 snap-start', itemClass)}>{child}</div>
        ))}
      </div>
      <div className="mt-5 hidden justify-end gap-2 sm:flex">
        <button type="button" className={btn} onClick={() => scroll(-1)} aria-label="Previous"><ChevronLeft className="size-4" /></button>
        <button type="button" className={btn} onClick={() => scroll(1)} aria-label="Next"><ChevronRight className="size-4" /></button>
      </div>
    </div>
  );
}
