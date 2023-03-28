import type { DEGLineageQueryParams } from './interfaces';

export const LAYER_HEIGHT = 780;
export const LAYER_WIDTH = 1408;
export const NODE_WIDTH = 300;
export const NODE_HEIGHT = 300;

export const MIN_ZOOM = 0.01;
export const MAX_ZOOM = 2;

export const layoutOptions: { [key: string]: string } = {
  'elk.algorithm': 'layered',
  'elk.direction': 'RIGHT',
  'elk.layered.spacing.edgeNodeBetweenLayers': '20',
  'elk.layered.spacing.nodeNodeBetweenLayers': '50',

  'elk.spacing.componentComponent': '50',
  'elk.layered.nodePlacement.bk.fixedAlignment': 'BALANCED',
  'elk.spacing.edgeNode': '30',
};

export const defaultDEGLineageQuery: DEGLineageQueryParams = {
  full: true,
  x: undefined,
  y: undefined,
  s: undefined,
};
