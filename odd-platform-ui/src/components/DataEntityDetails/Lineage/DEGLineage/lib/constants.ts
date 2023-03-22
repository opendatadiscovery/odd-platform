import type { LayoutOptions } from 'elkjs/lib/elk-api';

export const LAYER_HEIGHT = 780;
export const LAYER_WIDTH = 1408;
export const NODE_WIDTH = 300;

export const layoutOptions: LayoutOptions = {
  'elk.algorithm': 'layered',
  'elk.direction': 'RIGHT',
  'nodePlacement.strategy': 'SIMPLE',
};
