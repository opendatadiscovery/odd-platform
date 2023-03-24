import type { LayoutOptions } from 'elkjs/lib/elk-api';
import type { DEGLineageQueryParams } from './interfaces';

export const LAYER_HEIGHT = 780;
export const LAYER_WIDTH = 1408;
export const NODE_WIDTH = 300;
export const NODE_HEIGHT = 300;

export const layoutOptions: LayoutOptions = {
  'elk.algorithm': 'layered',
  'elk.direction': 'RIGHT',
  'elk.layered.spacing.edgeNodeBetweenLayers': '50',
  'elk.layered.spacing.nodeNodeBetweenLayers': '50',
};

export const defaultDEGLineageQuery: DEGLineageQueryParams = {
  full: true,
  x: 0,
  y: 0,
  s: 0,
};
