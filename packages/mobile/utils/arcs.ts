import { END_ANGLE, START_ANGLE } from "@/constants";

export const describeArc = (r: number, center: number) => {
  const polarToCartesian = (angleDeg: number) => {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180.0;
    return {
      x: center + r * Math.cos(angleRad),
      y: center + r * Math.sin(angleRad),
    };
  };

  const start = polarToCartesian(START_ANGLE);
  const end = polarToCartesian(END_ANGLE);

  return `M ${start.x} ${start.y} A ${r} ${r} 0 1 1 ${end.x} ${end.y}`;
};
