import type { LayoutOptions } from 'elkjs/lib/elk-api';

export const layerHeight = 780;
export const layerWidth = 1408;

export const layoutOptions: LayoutOptions = {
  'elk.algorithm': 'layered',
  'elk.direction': 'RIGHT',
  'nodePlacement.strategy': 'SIMPLE',
};
