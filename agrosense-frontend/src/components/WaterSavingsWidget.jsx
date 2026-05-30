import { useEffect, useRef, useState } from 'react';

export default function WaterSavingsWidget({ value = 0 }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    const start = performance.now();
    const duration = 1400;
    const from = 0;
    const to = Number(value);
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);

  return (
    <span className="value" style={{ color: 'var(--accent-primary)', fontVariantNumeric: 'tabular-nums' }}>
      {display.toLocaleString()}
    </span>
  );
}
