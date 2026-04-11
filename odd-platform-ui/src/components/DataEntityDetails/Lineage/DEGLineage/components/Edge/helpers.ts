interface SourceCoords {
  sourceX: number;
  sourceY: number;
}

interface TargetCoords {
  targetX: number;
  targetY: number;
}

type PathPoints = SourceCoords & TargetCoords;

function getBezierCenter({
  sourceX,
  sourceY,
  targetX,
  targetY,
}: PathPoints): [number, number, number, number] {
  const xOffset = Math.abs(targetX - sourceX) / 2;
  const centerX = targetX < sourceX ? targetX + xOffset : targetX - xOffset;

  const yOffset = Math.abs(targetY - sourceY) / 2;
  const centerY = targetY < sourceY ? targetY + yOffset : targetY - yOffset;

  return [centerX, centerY, xOffset, yOffset];
}

export function getBezierPath({
  sourceX,
  sourceY,
  targetX,
  targetY,
}: PathPoints): string {
  const [, centerY] = getBezierCenter({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return `M${sourceX},${sourceY} C${sourceX},${centerY} ${targetX},${centerY} ${targetX},${targetY}`;
}
