import { useAtom } from 'jotai';
import { useMemo } from 'react';
import { LAYER_HEIGHT, LAYER_WIDTH, NODE_WIDTH } from '../constants';
import { graphHeightAtom, graphWidthAtom } from '../atoms';

export default function useDEGZoomParams() {
  const [graphWidth] = useAtom(graphHeightAtom);
  const [graphHeight] = useAtom(graphWidthAtom);

  let moveToX = 0;
  let moveToY = 0;

  let initialZoom = 1;

  if (
    graphWidth <= LAYER_WIDTH &&
    graphHeight <= LAYER_HEIGHT &&
    graphWidth <= graphHeight
  ) {
    initialZoom = 1;
    moveToX = (initialZoom * (LAYER_WIDTH - graphWidth - NODE_WIDTH / 2)) / 2;
    moveToY = (initialZoom * (LAYER_HEIGHT - graphHeight)) / 2;
  }

  if (
    graphWidth <= LAYER_WIDTH &&
    graphHeight <= LAYER_HEIGHT &&
    graphWidth > graphHeight
  ) {
    initialZoom = 1;
    moveToX = (initialZoom * (LAYER_WIDTH - graphWidth + NODE_WIDTH / 2)) / 2;
    moveToY = (initialZoom * (LAYER_HEIGHT * 0.8 - graphHeight)) / 2;
  }

  if (
    graphWidth <= LAYER_WIDTH &&
    graphHeight > LAYER_HEIGHT &&
    graphWidth <= graphHeight
  ) {
    initialZoom = Math.min(graphWidth / LAYER_WIDTH, graphHeight / LAYER_HEIGHT);
    moveToX = (initialZoom * (LAYER_WIDTH + graphWidth * 0.5)) / 2;
    moveToY = (initialZoom * (LAYER_HEIGHT + graphHeight * 0.2)) / 2;
  }

  if (
    graphWidth <= LAYER_WIDTH &&
    graphHeight > LAYER_HEIGHT &&
    graphWidth > graphHeight
  ) {
    initialZoom = Math.max(graphWidth / LAYER_WIDTH, graphHeight / LAYER_HEIGHT);
    moveToX = (initialZoom * LAYER_WIDTH) / 2;
    moveToY = -(initialZoom * LAYER_HEIGHT) / 2;
  }

  if (graphWidth > LAYER_WIDTH && graphHeight <= LAYER_HEIGHT) {
    initialZoom = graphWidth / LAYER_WIDTH;
  }

  if (
    graphWidth > LAYER_WIDTH &&
    graphHeight > LAYER_HEIGHT &&
    graphWidth <= graphHeight
  ) {
    initialZoom = Math.min(LAYER_WIDTH / graphWidth, LAYER_HEIGHT / graphWidth);
    moveToX = (initialZoom * LAYER_WIDTH) / 2;
    moveToY = -(initialZoom * LAYER_HEIGHT) / 2;
  }

  if (
    graphWidth > LAYER_WIDTH &&
    graphHeight > LAYER_HEIGHT &&
    graphWidth > graphHeight
  ) {
    initialZoom = Math.min(LAYER_WIDTH / graphWidth, LAYER_HEIGHT / graphWidth);
  }

  return useMemo(
    () => ({ moveToX, moveToY, initialZoom }),
    [moveToX, moveToY, initialZoom]
  );
}
