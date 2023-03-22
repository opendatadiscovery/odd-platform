import { useAtom } from 'jotai';
import { useMemo } from 'react';
import { layerHeight, layerWidth } from '../constants';
import { graphHeightAtom, graphWidthAtom } from '../atoms';

export default function useDEGZoomParams() {
  const [graphWidth] = useAtom(graphHeightAtom);
  const [graphHeight] = useAtom(graphWidthAtom);

  const minRatio = 0.5;
  const maxRatio = 1.8;

  const getScale = (
    layerDimensionSize: number,
    graphDimensionSize: number,
    ratio: number
  ) => Number(((layerDimensionSize * ratio) / graphDimensionSize).toFixed(3));

  const minScaleY = getScale(layerHeight, graphHeight, minRatio);
  const minScaleX = getScale(layerWidth, graphWidth, minRatio);

  const maxScaleY = getScale(layerHeight, graphHeight, maxRatio);
  const maxScaleX = getScale(layerWidth, graphWidth, maxRatio);

  const minScale = Math.min(minScaleY, minScaleX);
  const maxScale = Math.max(maxScaleY, maxScaleX);

  let moveToX = 0;
  let moveToY = 0;
  const zoomToX = layerWidth / 2;
  const zoomToY = layerHeight / 2;
  let scale = 1;

  if (graphWidth <= layerWidth || graphHeight <= layerHeight) {
    moveToX = graphWidth * 1.5;
    moveToY = graphHeight * 0.4;
    const scaleY = getScale(layerHeight, graphHeight, 1);
    const scaleX = getScale(layerWidth, graphWidth, 1);
    scale = Math.min(scaleX, scaleY);
  } else {
    const scaleY = getScale(layerHeight / 2, graphHeight, 1);
    const scaleX = getScale(layerWidth / 2, graphWidth, 1);
    scale = Math.min(scaleX, scaleY);
    moveToX = -layerWidth / 2;
    moveToY = -layerWidth * 4.5;
  }

  return useMemo(
    () => ({
      scale,
      maxScale,
      minScale,
      moveToX,
      moveToY,
      zoomToX,
      zoomToY,
    }),
    [scale, maxScale, minScale, moveToX, moveToY, zoomToX, zoomToY]
  );
}
