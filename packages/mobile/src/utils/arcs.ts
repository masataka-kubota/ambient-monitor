import { END_ANGLE, START_ANGLE } from '@/constants';

/**
 * Build an SVG arc path string for the configured start and end angles.
 *
 * @param r - The radius of the arc.
 * @param center - The center coordinate for the arc.
 * @param startAngle - Optional start angle in degrees. Defaults to the shared start angle constant.
 * @param endAngle - Optional end angle in degrees. Defaults to the shared end angle constant.
 * @returns An SVG path string describing the arc.
 *
 * @example
 * ```ts
 * const path = describeArc(10, 5);
 * // "M ... A 10 10 0 1 1 ..."
 * ```
 */
export const describeArc = (
  r: number,
  center: number,
  startAngle = START_ANGLE,
  endAngle = END_ANGLE,
) => {
  /**
   * Convert a degree-based angle into SVG coordinates.
   *
   * @param angleDeg - The angle in degrees.
   * @returns The Cartesian coordinates for the given angle.
   */
  const polarToCartesian = (angleDeg: number) => {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180.0;
    return {
      x: center + r * Math.cos(angleRad),
      y: center + r * Math.sin(angleRad),
    };
  };

  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(endAngle);

  return `M ${start.x} ${start.y} A ${r} ${r} 0 1 1 ${end.x} ${end.y}`;
};
