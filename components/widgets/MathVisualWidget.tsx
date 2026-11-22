import React, { useEffect, useState } from 'react';
import { VisualDemoType } from '../../types.ts';

interface MathVisualWidgetProps {
  type: VisualDemoType;
  compact?: boolean;
}

const formatNum = (n: number, digits = 2): string => {
  const fixed = Number(n.toFixed(digits));
  return Number.isInteger(fixed) ? String(fixed) : fixed.toString();
};

// ============================================================================
// 1. Parabola & Trinomial Explorer
// ============================================================================
const ParabolaVisual: React.FC = () => {
  const [a, setA] = useState<number>(1);
  const [b, setB] = useState<number>(-2);
  const [c, setC] = useState<number>(-3);
  const [traceX, setTraceX] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setTraceX((prev) => {
        const next = prev + 0.1;
        return next > 5 ? -5 : Number(next.toFixed(2));
      });
    }, 60);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const effectiveA = a === 0 ? 0.5 : a;
  const discriminant = b * b - 4 * effectiveA * c;
  const vx = -b / (2 * effectiveA);
  const vy = effectiveA * vx * vx + b * vx + c;

  const roots: number[] = [];
  if (discriminant > 0) {
    const sq = Math.sqrt(discriminant);
    roots.push((-b - sq) / (2 * effectiveA), (-b + sq) / (2 * effectiveA));
  } else if (discriminant === 0) {
    roots.push(vx);
  }

  // Coordinate transform: world [-6, 6] x [-7, 7] -> SVG 360 x 240
  const W = 360;
  const H = 240;
  const toSvgX = (x: number) => W / 2 + x * 28;
  const toSvgY = (y: number) => H / 2 - y * 15;

  const pathPoints: string[] = [];
  for (let x = -6; x <= 6.05; x += 0.15) {
    const y = effectiveA * x * x + b * x + c;
    const sx = toSvgX(x);
    const sy = Math.max(-40, Math.min(H + 40, toSvgY(y)));
    pathPoints.push(`${pathPoints.length === 0 ? 'M' : 'L'} ${sx.toFixed(1)} ${sy.toFixed(1)}`);
  }

  const traceY = effectiveA * traceX * traceX + b * traceX + c;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-mono text-sm md:text-base font-bold text-slate-900 dark:text-white" dir="ltr">
          f(x) = {formatNum(effectiveA)}x² {b >= 0 ? `+ ${formatNum(b)}` : `− ${formatNum(Math.abs(b))}`}x{' '}
          {c >= 0 ? `+ ${formatNum(c)}` : `− ${formatNum(Math.abs(c))}`}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => { setA(1); setB(-2); setC(-3); }}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            x²−2x−3
          </button>
          <button
            type="button"
            onClick={() => { setA(-1); setB(0); setC(4); }}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            −x²+4
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="px-3 py-1 rounded-lg bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950 font-semibold"
          >
            {isPlaying ? 'עצור תנועה' : 'הנע נקודה'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.25fr_0.75fr] gap-4 items-center">
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-2 overflow-hidden">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="גרף פרבולה אינטראקטיבי">
            {/* Grid */}
            <g stroke="rgba(148,163,184,0.14)" strokeWidth="1">
              {[-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].map((gx) => (
                <line key={`vx-${gx}`} x1={toSvgX(gx)} y1={0} x2={toSvgX(gx)} y2={H} />
              ))}
              {[-6, -4, -2, 2, 4, 6].map((gy) => (
                <line key={`hy-${gy}`} x1={0} y1={toSvgY(gy)} x2={W} y2={toSvgY(gy)} />
              ))}
            </g>

            {/* Axes */}
            <g stroke="rgba(148,163,184,0.55)" strokeWidth="1.5">
              <line x1={0} y1={toSvgY(0)} x2={W} y2={toSvgY(0)} />
              <line x1={toSvgX(0)} y1={0} x2={toSvgX(0)} y2={H} />
            </g>

            {/* Symmetry axis */}
            <line
              x1={toSvgX(vx)}
              y1={0}
              x2={toSvgX(vx)}
              y2={H}
              stroke="#F59E0B"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity={0.65}
            />

            {/* Parabola Curve */}
            <path
              d={pathPoints.join(' ')}
              fill="none"
              stroke="#38BDF8"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Roots */}
            {roots.map((rx, idx) => (
              <circle
                key={`r-${idx}`}
                cx={toSvgX(rx)}
                cy={toSvgY(0)}
                r="4.5"
                fill="#34D399"
                stroke="#0F172A"
                strokeWidth="1.5"
              />
            ))}

            {/* Vertex */}
            <circle
              cx={toSvgX(vx)}
              cy={Math.max(6, Math.min(H - 6, toSvgY(vy)))}
              r="5"
              fill="#F59E0B"
              stroke="#0F172A"
              strokeWidth="1.5"
            />

            {/* Animated Tracer Point */}
            {Math.abs(traceY) <= 8 && (
              <g>
                <circle
                  cx={toSvgX(traceX)}
                  cy={toSvgY(traceY)}
                  r="6"
                  fill="#F43F5E"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">מקדם a (פתיחה)</span>
              <span className="font-mono tabular-nums font-bold text-blue-600 dark:text-sky-400">{formatNum(effectiveA)}</span>
            </div>
            <input
              type="range"
              min={-3}
              max={3}
              step={0.5}
              value={a}
              onChange={(e) => {
                const v = Number(e.target.value);
                setA(v === 0 ? 0.5 : v);
              }}
              className="w-full accent-blue-600"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">מקדם b (הסטה)</span>
              <span className="font-mono tabular-nums font-bold text-blue-600 dark:text-sky-400">{formatNum(b)}</span>
            </div>
            <input
              type="range"
              min={-6}
              max={6}
              step={1}
              value={b}
              onChange={(e) => setB(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">קבוע c (חיתוך עם y)</span>
              <span className="font-mono tabular-nums font-bold text-blue-600 dark:text-sky-400">{formatNum(c)}</span>
            </div>
            <input
              type="range"
              min={-6}
              max={6}
              step={1}
              value={c}
              onChange={(e) => setC(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">קודקוד:</span>
              <span className="font-mono tabular-nums font-semibold text-amber-600 dark:text-amber-400" dir="ltr">
                ({formatNum(vx)}, {formatNum(vy)})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">דיסקרימיננטה (Δ):</span>
              <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white" dir="ltr">
                {formatNum(discriminant)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">שורשים (חיתוך x):</span>
              <span className="font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400" dir="ltr">
                {roots.length === 0
                  ? 'אין שורשים ממשיים'
                  : roots.map((r) => formatNum(r)).join(', ')}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200/70 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">נקודה נעה:</span>
              <span className="font-mono tabular-nums font-semibold text-rose-600 dark:text-rose-400" dir="ltr">
                ({formatNum(traceX, 1)}, {formatNum(traceY, 1)})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. Linear Function & Slope Explorer
// ============================================================================
const LinearVisual: React.FC = () => {
  const [m, setM] = useState<number>(2);
  const [b, setB] = useState<number>(-1);
  const [stepProgress, setStepProgress] = useState<number>(1);

  useEffect(() => {
    const id = window.setInterval(() => {
      setStepProgress((p) => (p >= 2 ? 0.2 : Number((p + 0.05).toFixed(2))));
    }, 80);
    return () => window.clearInterval(id);
  }, []);

  const W = 360;
  const H = 240;
  const toSvgX = (x: number) => W / 2 + x * 28;
  const toSvgY = (y: number) => H / 2 - y * 18;

  const x1 = -6;
  const y1 = m * x1 + b;
  const x2 = 6;
  const y2 = m * x2 + b;

  const basePointX = 0;
  const basePointY = b;
  const runX = Math.min(2, stepProgress);
  const riseY = m * runX;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-mono text-sm md:text-base font-bold text-slate-900 dark:text-white" dir="ltr">
          y = {formatNum(m)}x {b >= 0 ? `+ ${formatNum(b)}` : `− ${formatNum(Math.abs(b))}`}
        </div>
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          {m > 0 ? 'פונקציה עולה (m > 0)' : m < 0 ? 'פונקציה יורדת (m < 0)' : 'פונקציה קבועה (m = 0)'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.25fr_0.75fr] gap-4 items-center">
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-2 overflow-hidden">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="גרף פונקציה קווית ומשולש שיפוע">
            <g stroke="rgba(148,163,184,0.14)" strokeWidth="1">
              {[-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].map((gx) => (
                <line key={`lx-${gx}`} x1={toSvgX(gx)} y1={0} x2={toSvgX(gx)} y2={H} />
              ))}
              {[-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].map((gy) => (
                <line key={`ly-${gy}`} x1={0} y1={toSvgY(gy)} x2={W} y2={toSvgY(gy)} />
              ))}
            </g>

            <g stroke="rgba(148,163,184,0.55)" strokeWidth="1.5">
              <line x1={0} y1={toSvgY(0)} x2={W} y2={toSvgY(0)} />
              <line x1={toSvgX(0)} y1={0} x2={toSvgX(0)} y2={H} />
            </g>

            {/* Animated Slope Triangle */}
            <line
              x1={toSvgX(basePointX)}
              y1={toSvgY(basePointY)}
              x2={toSvgX(basePointX + runX)}
              y2={toSvgY(basePointY)}
              stroke="#34D399"
              strokeWidth="2.5"
              strokeDasharray="4 2"
            />
            <line
              x1={toSvgX(basePointX + runX)}
              y1={toSvgY(basePointY)}
              x2={toSvgX(basePointX + runX)}
              y2={toSvgY(basePointY + riseY)}
              stroke="#F59E0B"
              strokeWidth="2.5"
              strokeDasharray="4 2"
            />

            {/* Main Line */}
            <line
              x1={toSvgX(x1)}
              y1={toSvgY(y1)}
              x2={toSvgX(x2)}
              y2={toSvgY(y2)}
              stroke="#38BDF8"
              strokeWidth="2.8"
            />

            {/* Y-Intercept */}
            <circle cx={toSvgX(0)} cy={toSvgY(b)} r="5" fill="#F59E0B" stroke="#0F172A" strokeWidth="1.5" />
            {/* X-Intercept */}
            {m !== 0 && Math.abs(-b / m) <= 6 && (
              <circle cx={toSvgX(-b / m)} cy={toSvgY(0)} r="4.5" fill="#34D399" stroke="#0F172A" strokeWidth="1.5" />
            )}
          </svg>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">שיפוע (m)</span>
              <span className="font-mono tabular-nums font-bold text-blue-600 dark:text-sky-400">{formatNum(m)}</span>
            </div>
            <input
              type="range"
              min={-4}
              max={4}
              step={0.5}
              value={m}
              onChange={(e) => setM(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">חיתוך עם ציר y (b)</span>
              <span className="font-mono tabular-nums font-bold text-amber-600 dark:text-amber-400">{formatNum(b)}</span>
            </div>
            <input
              type="range"
              min={-5}
              max={5}
              step={0.5}
              value={b}
              onChange={(e) => setB(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">חיתוך עם ציר y:</span>
              <span className="font-mono tabular-nums font-semibold text-amber-600 dark:text-amber-400" dir="ltr">
                (0, {formatNum(b)})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">חיתוך עם ציר x:</span>
              <span className="font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400" dir="ltr">
                {m === 0 ? (b === 0 ? 'כל הישר' : 'אין חיתוך') : `(${formatNum(-b / m)}, 0)`}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/70 dark:border-slate-800">
              לכל צעד של יחידה אחת ימינה, הישר {m >= 0 ? 'עולה' : 'יורד'} ב-{formatNum(Math.abs(m))} יחידות.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. Pythagorean Theorem Area Proof
// ============================================================================
const PythagorasVisual: React.FC = () => {
  const [a, setA] = useState<number>(3);
  const [b, setB] = useState<number>(4);
  const [highlightMode, setHighlightMode] = useState<number>(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setHighlightMode((prev) => (prev + 1) % 3);
    }, 1800);
    return () => window.clearInterval(id);
  }, []);

  const c = Math.sqrt(a * a + b * b);
  const scale = 16;
  const originX = 135;
  const originY = 145;
  const pxA = a * scale;
  const pxB = b * scale;

  // Triangle vertices: right angle at (originX, originY), top at (originX, originY - pxA), right at (originX + pxB, originY)
  const Ax = originX;
  const Ay = originY - pxA;
  const Bx = originX + pxB;
  const By = originY;

  // Hypotenuse outward normal for square on c
  const dx = Bx - Ax;
  const dy = By - Ay;
  // Outward square points from A->B rotated -90 deg (dy, -dx)
  const C1x = Bx + dy;
  const C1y = By - dx;
  const C2x = Ax + dy;
  const C2y = Ay - dx;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-mono text-sm md:text-base font-bold text-slate-900 dark:text-white" dir="ltr">
          {a}² + {b}² = {a * a} + {b * b} = {a * a + b * b} = ({formatNum(c, 2)})²
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => { setA(3); setB(4); }}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
          >
            3-4-5
          </button>
          <button
            type="button"
            onClick={() => { setA(5); setB(6); }}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
          >
            5-6-√61
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.25fr_0.75fr] gap-4 items-center">
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-2 overflow-hidden">
          <svg viewBox="0 0 360 250" className="w-full h-auto" role="img" aria-label="הדגמה גיאומטרית של משפט פיתגורס">
            {/* Square on side a (left) */}
            <rect
              x={originX - pxA}
              y={originY - pxA}
              width={pxA}
              height={pxA}
              fill={highlightMode === 0 ? 'rgba(56,189,248,0.35)' : 'rgba(56,189,248,0.18)'}
              stroke="#38BDF8"
              strokeWidth="1.8"
            />
            <text
              x={originX - pxA / 2}
              y={originY - pxA / 2 + 4}
              textAnchor="middle"
              fill="#7DD3FC"
              fontSize="11"
              fontFamily="monospace"
            >
              a²={a * a}
            </text>

            {/* Square on side b (bottom) */}
            <rect
              x={originX}
              y={originY}
              width={pxB}
              height={pxB}
              fill={highlightMode === 1 ? 'rgba(52,211,153,0.35)' : 'rgba(52,211,153,0.18)'}
              stroke="#34D399"
              strokeWidth="1.8"
            />
            <text
              x={originX + pxB / 2}
              y={originY + pxB / 2 + 4}
              textAnchor="middle"
              fill="#6EE7B7"
              fontSize="11"
              fontFamily="monospace"
            >
              b²={b * b}
            </text>

            {/* Square on hypotenuse c */}
            <polygon
              points={`${Ax},${Ay} ${Bx},${By} ${C1x},${C1y} ${C2x},${C2y}`}
              fill={highlightMode === 2 ? 'rgba(245,158,11,0.38)' : 'rgba(245,158,11,0.18)'}
              stroke="#F59E0B"
              strokeWidth="1.8"
            />
            <text
              x={(Ax + Bx + C1x + C2x) / 4}
              y={(Ay + By + C1y + C2y) / 4 + 4}
              textAnchor="middle"
              fill="#FCD34D"
              fontSize="11"
              fontFamily="monospace"
            >
              c²={a * a + b * b}
            </text>

            {/* Right Triangle */}
            <polygon
              points={`${originX},${originY} ${Ax},${Ay} ${Bx},${By}`}
              fill="rgba(255,255,255,0.1)"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
            {/* Right angle marker */}
            <polyline
              points={`${originX},${originY - 10} ${originX + 10},${originY - 10} ${originX + 10},${originY}`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">ניצב a</span>
              <span className="font-mono tabular-nums font-bold text-sky-600 dark:text-sky-400">{a}</span>
            </div>
            <input
              type="range"
              min={2}
              max={6}
              step={1}
              value={a}
              onChange={(e) => setA(Number(e.target.value))}
              className="w-full accent-sky-500"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">ניצב b</span>
              <span className="font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">{b}</span>
            </div>
            <input
              type="range"
              min={2}
              max={6}
              step={1}
              value={b}
              onChange={(e) => setB(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">שטח ריבוע a²:</span>
              <span className="font-mono tabular-nums font-bold text-sky-600 dark:text-sky-400">{a * a}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">שטח ריבוע b²:</span>
              <span className="font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">{b * b}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-1.5">
              <span className="text-slate-500 dark:text-slate-400">שטח היתר c²:</span>
              <span className="font-mono tabular-nums font-bold text-amber-600 dark:text-amber-400">{a * a + b * b}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">אורך היתר c:</span>
              <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">{formatNum(c, 2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. Calculus Derivative Secant-to-Tangent Limit
// ============================================================================
const CalculusVisual: React.FC = () => {
  const [x0, setX0] = useState<number>(1.2);
  const [h, setH] = useState<number>(1.4);
  const [animating, setAnimating] = useState<boolean>(false);

  const f = (x: number) => 0.45 * x * x;
  const fPrime = (x: number) => 0.9 * x;

  useEffect(() => {
    if (!animating) return;
    const id = window.setInterval(() => {
      setH((prev) => {
        const next = prev - 0.05;
        if (next <= 0.05) {
          setAnimating(false);
          return 0.05;
        }
        return Number(next.toFixed(2));
      });
    }, 60);
    return () => window.clearInterval(id);
  }, [animating]);

  const y0 = f(x0);
  const x1 = x0 + h;
  const y1 = f(x1);
  const secantSlope = (y1 - y0) / h;
  const tangentSlope = fPrime(x0);

  const W = 360;
  const H = 240;
  const toSvgX = (x: number) => 150 + x * 46;
  const toSvgY = (y: number) => 200 - y * 34;

  const curvePts: string[] = [];
  for (let x = -3; x <= 4.2; x += 0.1) {
    curvePts.push(`${curvePts.length === 0 ? 'M' : 'L'} ${toSvgX(x).toFixed(1)} ${toSvgY(f(x)).toFixed(1)}`);
  }

  // Secant extended line
  const sxA = -2.5;
  const syA = y0 + secantSlope * (sxA - x0);
  const sxB = 4;
  const syB = y0 + secantSlope * (sxB - x0);

  // Tangent extended line
  const txA = -2.5;
  const tyA = y0 + tangentSlope * (txA - x0);
  const txB = 4;
  const tyB = y0 + tangentSlope * (txB - x0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-mono text-sm font-bold text-slate-900 dark:text-white" dir="ltr">
          f(x) = 0.45x² | f&apos;(x₀) = {formatNum(tangentSlope, 2)}
        </div>
        <button
          type="button"
          onClick={() => {
            setH(1.8);
            setAnimating(true);
          }}
          className="px-3 py-1.5 rounded-lg bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold"
        >
          הקטן Δx → 0 (התקרבות למשיק)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.25fr_0.75fr] gap-4 items-center">
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-2 overflow-hidden">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="הדגמת נגזרת ומיתר המתכנס למשיק">
            <g stroke="rgba(148,163,184,0.45)" strokeWidth="1.5">
              <line x1={0} y1={toSvgY(0)} x2={W} y2={toSvgY(0)} />
              <line x1={toSvgX(0)} y1={0} x2={toSvgX(0)} y2={H} />
            </g>

            <path d={curvePts.join(' ')} fill="none" stroke="#38BDF8" strokeWidth="2.5" />

            {/* True Tangent */}
            <line
              x1={toSvgX(txA)}
              y1={toSvgY(tyA)}
              x2={toSvgX(txB)}
              y2={toSvgY(tyB)}
              stroke="#34D399"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Secant Line */}
            <line
              x1={toSvgX(sxA)}
              y1={toSvgY(syA)}
              x2={toSvgX(sxB)}
              y2={toSvgY(syB)}
              stroke="#F59E0B"
              strokeWidth="2.2"
            />

            <circle cx={toSvgX(x0)} cy={toSvgY(y0)} r="5" fill="#34D399" stroke="#0F172A" strokeWidth="1.5" />
            <circle cx={toSvgX(x1)} cy={toSvgY(y1)} r="5" fill="#F59E0B" stroke="#0F172A" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">נקודה x₀</span>
              <span className="font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">{formatNum(x0)}</span>
            </div>
            <input
              type="range"
              min={-1.5}
              max={2.4}
              step={0.1}
              value={x0}
              onChange={(e) => setX0(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">מרווח Δx</span>
              <span className="font-mono tabular-nums font-bold text-amber-600 dark:text-amber-400">{formatNum(h)}</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={2}
              step={0.05}
              value={h}
              onChange={(e) => {
                setAnimating(false);
                setH(Number(e.target.value));
              }}
              className="w-full accent-amber-500"
            />
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">שיפוע המיתר (כתום):</span>
              <span className="font-mono tabular-nums font-bold text-amber-600 dark:text-amber-400">
                {formatNum(secantSlope, 3)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">שיפוע המשיק f&apos;(x₀):</span>
              <span className="font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                {formatNum(tangentSlope, 3)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/70 dark:border-slate-800">
              ככל ש-Δx קטן ושואף ל-0, המיתר מתלכד עם המשיק בנקודה.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 5. Trigonometry Unit Circle & Sine/Cosine Wave
// ============================================================================
const TrigonometryVisual: React.FC = () => {
  const [angleDeg, setAngleDeg] = useState<number>(45);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(() => {
      setAngleDeg((deg) => (deg + 2) % 360);
    }, 45);
    return () => window.clearInterval(id);
  }, [isPlaying]);

  const rad = (angleDeg * Math.PI) / 180;
  const cosVal = Math.cos(rad);
  const sinVal = Math.sin(rad);

  // Circle center (85, 115), radius 65
  const cx = 85;
  const cy = 115;
  const r = 65;
  const px = cx + r * cosVal;
  const py = cy - r * sinVal;

  // Wave plot area x: 175 -> 345 (width 170), center y: 115, amplitude 55
  const waveStart = 175;
  const waveWidth = 170;
  const sinPts: string[] = [];
  const cosPts: string[] = [];
  for (let d = 0; d <= 360; d += 10) {
    const dr = (d * Math.PI) / 180;
    const wx = waveStart + (d / 360) * waveWidth;
    sinPts.push(`${d === 0 ? 'M' : 'L'} ${wx.toFixed(1)} ${(cy - 55 * Math.sin(dr)).toFixed(1)}`);
    cosPts.push(`${d === 0 ? 'M' : 'L'} ${wx.toFixed(1)} ${(cy - 55 * Math.cos(dr)).toFixed(1)}`);
  }
  const activeWaveX = waveStart + (angleDeg / 360) * waveWidth;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-mono text-sm font-bold text-slate-900 dark:text-white" dir="ltr">
          θ = {angleDeg}° | sin(θ) = {formatNum(sinVal)} | cos(θ) = {formatNum(cosVal)}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[30, 45, 60, 90, 180].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setAngleDeg(preset);
              }}
              className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 font-mono text-slate-600 dark:text-slate-300"
            >
              {preset}°
            </button>
          ))}
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="px-3 py-1 rounded-lg bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950 font-semibold"
          >
            {isPlaying ? 'עצור' : 'סובב'}
          </button>
        </div>
      </div>

      <div className="bg-slate-950 rounded-xl border border-slate-800 p-2 overflow-hidden">
        <svg viewBox="0 0 360 230" className="w-full h-auto" role="img" aria-label="מעגל היחידה וגלי סינוס וקוסינוס">
          {/* Unit Circle Axes */}
          <g stroke="rgba(148,163,184,0.4)" strokeWidth="1">
            <line x1={cx - r - 12} y1={cy} x2={cx + r + 12} y2={cy} />
            <line x1={cx} y1={cy - r - 12} x2={cx} y2={cy + r + 12} />
            {/* Wave Axes */}
            <line x1={waveStart} y1={cy} x2={waveStart + waveWidth} y2={cy} />
            <line x1={waveStart} y1={cy - 65} x2={waveStart} y2={cy + 65} />
          </g>

          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(148,163,184,0.45)" strokeWidth="1.5" />

          {/* Cosine horizontal leg & Sine vertical leg */}
          <line x1={cx} y1={cy} x2={px} y2={cy} stroke="#34D399" strokeWidth="3" />
          <line x1={px} y1={cy} x2={px} y2={py} stroke="#38BDF8" strokeWidth="3" />
          <line x1={cx} y1={cy} x2={px} y2={py} stroke="#F59E0B" strokeWidth="2" />
          <circle cx={px} cy={py} r="4.5" fill="#F59E0B" />

          {/* Waves */}
          <path d={cosPts.join(' ')} fill="none" stroke="#34D399" strokeWidth="1.8" opacity={0.75} />
          <path d={sinPts.join(' ')} fill="none" stroke="#38BDF8" strokeWidth="2.2" />

          {/* Sync line & dots */}
          <line x1={activeWaveX} y1={cy - 60} x2={activeWaveX} y2={cy + 60} stroke="rgba(255,255,255,0.25)" strokeDasharray="3 3" />
          <circle cx={activeWaveX} cy={cy - 55 * sinVal} r="4.5" fill="#38BDF8" />
          <circle cx={activeWaveX} cy={cy - 55 * cosVal} r="4.5" fill="#34D399" />
        </svg>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="font-semibold text-slate-700 dark:text-slate-300">זווית θ (במעלות)</span>
          <span className="font-mono tabular-nums font-bold text-blue-600 dark:text-sky-400">{angleDeg}°</span>
        </div>
        <input
          type="range"
          min={0}
          max={360}
          step={1}
          value={angleDeg}
          onChange={(e) => {
            setIsPlaying(false);
            setAngleDeg(Number(e.target.value));
          }}
          className="w-full accent-blue-600"
        />
        <div className="flex flex-wrap gap-4 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-400 inline-block" />
            sin(θ) — גובה אנכי
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" />
            cos(θ) — היטל אופקי
          </span>
          <span>sin²(θ) + cos²(θ) = 1</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 6. Fractions Pie & Bar Comparison Visualizer
// ============================================================================
const FractionsVisual: React.FC = () => {
  const [numA, setNumA] = useState<number>(3);
  const [denA, setDenA] = useState<number>(4);
  const [numB, setNumB] = useState<number>(2);
  const [denB, setDenB] = useState<number>(3);

  const valA = numA / denA;
  const valB = numB / denB;
  const cmpSymbol = Math.abs(valA - valB) < 0.0001 ? '=' : valA > valB ? '>' : '<';

  const renderPie = (num: number, den: number, fillHex: string) => {
    const cx = 56;
    const cy = 56;
    const r = 46;
    const slices = [];

    for (let i = 0; i < den; i++) {
      const startAngle = (i / den) * 2 * Math.PI - Math.PI / 2;
      const endAngle = ((i + 1) / den) * 2 * Math.PI - Math.PI / 2;
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const largeArc = 1 / den > 0.5 ? 1 : 0;
      const d =
        den === 1
          ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
          : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      slices.push(
        <path
          key={i}
          d={d}
          fill={i < num ? fillHex : 'rgba(148,163,184,0.16)'}
          stroke="#0F172A"
          strokeWidth="1.5"
        />
      );
    }

    return (
      <svg viewBox="0 0 112 112" className="w-28 h-28 mx-auto" role="img" aria-label={`ייצוג שבר ${num}/${den}`}>
        {slices}
      </svg>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-center">
        {/* Fraction A */}
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">שבר ראשון</span>
            <span className="font-mono tabular-nums font-bold text-base text-blue-600 dark:text-sky-400" dir="ltr">
              {numA}/{denA} ({Math.round(valA * 100)}%)
            </span>
          </div>

          {renderPie(numA, denA, '#38BDF8')}

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>מונה: {numA}</span>
              <input
                type="range"
                min={0}
                max={denA}
                value={numA}
                onChange={(e) => setNumA(Number(e.target.value))}
                className="w-28 accent-blue-600"
              />
            </div>
            <div className="flex justify-between">
              <span>מכנה: {denA}</span>
              <input
                type="range"
                min={1}
                max={12}
                value={denA}
                onChange={(e) => {
                  const newDen = Number(e.target.value);
                  setDenA(newDen);
                  if (numA > newDen) setNumA(newDen);
                }}
                className="w-28 accent-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Comparison Operator */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-mono text-2xl font-bold flex items-center justify-center">
            {cmpSymbol}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            השוואה
          </span>
        </div>

        {/* Fraction B */}
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">שבר שני</span>
            <span className="font-mono tabular-nums font-bold text-base text-emerald-600 dark:text-emerald-400" dir="ltr">
              {numB}/{denB} ({Math.round(valB * 100)}%)
            </span>
          </div>

          {renderPie(numB, denB, '#34D399')}

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>מונה: {numB}</span>
              <input
                type="range"
                min={0}
                max={denB}
                value={numB}
                onChange={(e) => setNumB(Number(e.target.value))}
                className="w-28 accent-emerald-600"
              />
            </div>
            <div className="flex justify-between">
              <span>מכנה: {denB}</span>
              <input
                type="range"
                min={1}
                max={12}
                value={denB}
                onChange={(e) => {
                  const newDen = Number(e.target.value);
                  setDenB(newDen);
                  if (numB > newDen) setNumB(newDen);
                }}
                className="w-28 accent-emerald-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Unified Wrapper Export
// ============================================================================
const VISUAL_TITLES: Record<VisualDemoType, { title: string; subtitle: string }> = {
  parabola: {
    title: 'הדגמה אינטראקטיבית: פרבולה וטרינום ריבועי',
    subtitle: 'שנו את המקדמים a, b, c וצפו בזמן אמת בשינוי הקודקוד, ציר הסימטריה והשורשים',
  },
  linear: {
    title: 'הדגמה אינטראקטיבית: פונקציה קווית ומשולש שיפוע',
    subtitle: 'הזיזו את השיפוע m ונקודת החיתוך b להבנת קצב השינוי של הישר',
  },
  pythagoras: {
    title: 'הדגמה אינטראקטיבית: משפט פיתגורס והוכחת שטחים',
    subtitle: 'סכום שטחי הריבועים הבנויים על הניצבים שווה תמיד לשטח הריבוע שעל היתר',
  },
  calculus: {
    title: 'הדגמה אינטראקטיבית: נגזרת כהתכנסות מיתר למשיק',
    subtitle: 'הקטינו את Δx וראו כיצד שיפוע המיתר שואף לשיפוע המשיק בנקודה',
  },
  trigonometry: {
    title: 'הדגמה אינטראקטיבית: מעגל היחידה וגלי סינוס וקוסינוס',
    subtitle: 'קשר חי בין סיבוב הרדיוס במעגל היחידה לבין עקומות sin(θ) ו-cos(θ)',
  },
  fractions: {
    title: 'הדגמה אינטראקטיבית: שברים פשוטים והשוואת חלקי השלם',
    subtitle: 'שנו את המונה והמכנה כדי להשוות חזותית בין שברים, אחוזים וחלקי עיגול',
  },
};

const MathVisualWidget: React.FC<MathVisualWidgetProps> = ({ type, compact = false }) => {
  const meta = VISUAL_TITLES[type] || VISUAL_TITLES.parabola;

  return (
    <section
      className={`my-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl ${
        compact ? 'p-4 md:p-5' : 'p-5 md:p-6'
      }`}
    >
      <div className="mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-display text-base md:text-lg font-bold text-slate-900 dark:text-white">
          {meta.title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {meta.subtitle}
        </p>
      </div>

      {type === 'parabola' && <ParabolaVisual />}
      {type === 'linear' && <LinearVisual />}
      {type === 'pythagoras' && <PythagorasVisual />}
      {type === 'calculus' && <CalculusVisual />}
      {type === 'trigonometry' && <TrigonometryVisual />}
      {type === 'fractions' && <FractionsVisual />}
    </section>
  );
};

export default MathVisualWidget;
