import { useAtom } from 'jotai';
import { useMemo } from 'react';
import { LAYER_HEIGHT, LAYER_WIDTH } from '../constants';
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

  const minScaleY = getScale(LAYER_HEIGHT, graphHeight, minRatio);
  const minScaleX = getScale(LAYER_WIDTH, graphWidth, minRatio);

  const maxScaleY = getScale(LAYER_HEIGHT, graphHeight, maxRatio);
  const maxScaleX = getScale(LAYER_WIDTH, graphWidth, maxRatio);

  const minScale = Math.min(minScaleY, minScaleX);
  const maxScale = Math.max(maxScaleY, maxScaleX);

  let moveToX = 0;
  let moveToY = 0;
  const zoomToX = LAYER_WIDTH / 2;
  const zoomToY = LAYER_HEIGHT / 2;
  let scale = 1;

  if (graphWidth <= LAYER_WIDTH || graphHeight <= LAYER_HEIGHT) {
    moveToX = graphWidth * 1.5;
    moveToY = graphHeight * 0.4;
    const scaleY = getScale(LAYER_HEIGHT, graphHeight, 1);
    const scaleX = getScale(LAYER_WIDTH, graphWidth, 1);
    scale = Math.min(scaleX, scaleY);
  } else {
    const scaleY = getScale(LAYER_HEIGHT / 2, graphHeight, 1);
    const scaleX = getScale(LAYER_WIDTH / 2, graphWidth, 1);
    scale = Math.min(scaleX, scaleY);
    moveToX = -LAYER_WIDTH / 2;
    moveToY = -LAYER_WIDTH * 4.5;
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
