import { END_ANGLE, START_ANGLE } from '@/constants';

import { describeArc } from './arcs';

describe('describeArc', () => {
  const r = 10;
  const center = 5;

  // polarToCartesian uses (angleDeg - 90) so SVG 0° is at 12 o'clock.
  // START_ANGLE (-135): (-225°) → cos = -√2/2, sin = √2/2
  // END_ANGLE (135): (45°) → cos = √2/2, sin = √2/2
  const halfDiagonal = (r * Math.SQRT2) / 2;
  const expectedStartX = center - halfDiagonal;
  const expectedStartY = center + halfDiagonal;
  const expectedEndX = center + halfDiagonal;
  const expectedEndY = center + halfDiagonal;

  const parseArcPath = (result: string) => {
    const match = result.match(
      /^M (-?\d+\.?\d*) (-?\d+\.?\d*) A (\d+\.?\d*) (\d+\.?\d*) 0 1 1 (-?\d+\.?\d*) (-?\d+\.?\d*)$/,
    );

    if (!match) {
      throw new Error(`Unexpected arc path: ${result}`);
    }

    const [, startX, startY, rx, ry, endX, endY] = match;
    return {
      startX: Number(startX),
      startY: Number(startY),
      rx: Number(rx),
      ry: Number(ry),
      endX: Number(endX),
      endY: Number(endY),
    };
  };

  it('uses START_ANGLE and END_ANGLE when angles are omitted', () => {
    const path = parseArcPath(describeArc(r, center));

    expect(path.rx).toBe(r);
    expect(path.ry).toBe(r);
    expect(path.startX).toBeCloseTo(expectedStartX);
    expect(path.startY).toBeCloseTo(expectedStartY);
    expect(path.endX).toBeCloseTo(expectedEndX);
    expect(path.endY).toBeCloseTo(expectedEndY);
  });

  it('builds an SVG arc path from the configured start and end angles', () => {
    const path = parseArcPath(describeArc(r, center, START_ANGLE, END_ANGLE));

    expect(path.rx).toBe(r);
    expect(path.ry).toBe(r);
    expect(path.startX).toBeCloseTo(expectedStartX);
    expect(path.startY).toBeCloseTo(expectedStartY);
    expect(path.endX).toBeCloseTo(expectedEndX);
    expect(path.endY).toBeCloseTo(expectedEndY);
  });

  it('matches the two-argument call used by gauges', () => {
    expect(describeArc(r, center)).toBe(describeArc(r, center, START_ANGLE, END_ANGLE));
  });
});
