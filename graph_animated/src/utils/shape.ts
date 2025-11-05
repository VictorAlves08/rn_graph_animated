import * as d3 from "d3-shape";
import { svgPathProperties } from "svg-path-properties";

export type Point = { x: number; y: number };

export function makePath(points: Point[]) {
  const line = d3
    .line<Point>()
    .x((p) => p.x)
    .y((p) => p.y)
    .curve(d3.curveMonotoneX);
  return line(points) || "";
}

/**
 * Amostra um path SVG em n pontos igualmente espaçados em comprimento.
 * Retorna arrays planos (x[], y[]) e o comprimento total len.
 * -> Seguro para ser capturado por worklets do Reanimated.
 */
export function samplePath(d: string, n = 160) {
  if (!d) return { xs: [] as number[], ys: [] as number[], len: 0 };
  const props = new svgPathProperties(d);
  const len = props.getTotalLength();
  const xs = new Array<number>(n);
  const ys = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    const p = props.getPointAtLength((i / (n - 1)) * len);
    xs[i] = p.x;
    ys[i] = p.y;
  }
  return { xs, ys, len };
}
