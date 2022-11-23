import type { LineageGraphState, NodeSize } from './interfaces';

export const defaultGraphState: LineageGraphState = {
  nodesUp: [],
  linksUp: [],
  crossLinksUp: [],
  replacedCrossLinksUp: [],
  nodesDown: [],
  linksDown: [],
  crossLinksDown: [],
  replacedCrossLinksDown: [],
  depth: { upstream: 0, downstream: 0 },
};

export const defaultDepth = 1;

export const NODE_WIDTH = 200;
export const NODE_HEIGHT = 120;
export const NODE_COMPACT_HEIGHT = 70;
export const NODE_INDENT_LEFT = 12;
export const INFO_HEIGHT = 20;
export const INFO_LABEL_WIDTH = 50;
export const NODE_LINE_HEIGHT = 10;
export const NODE_LINE_MX = 5;

export const LOAD_MORE_LAYER_WIDTH = 60;
export const LOAD_MORE_BUTTON_WIDTH = 91;
export const LOAD_MORE_BUTTON_HEIGHT = 24;

export const nodeSizeInitial: NodeSize = {
  size: {
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    mx: 150,
    my: 24,
    contentWidth: NODE_WIDTH - NODE_INDENT_LEFT * 3,
  },
  content: {
    title: {
      x: NODE_INDENT_LEFT,
      y: NODE_LINE_HEIGHT * 2,
      width: NODE_WIDTH - NODE_INDENT_LEFT * 2,
    },
    hiddenDeps: { x: NODE_INDENT_LEFT, y: NODE_LINE_HEIGHT * 2 + NODE_LINE_MX },
    info: {
      x: NODE_INDENT_LEFT,
      y: NODE_LINE_HEIGHT * 2 + NODE_LINE_MX + NODE_LINE_MX * 5,
      lineHeight: INFO_HEIGHT,
      labelWidth: INFO_LABEL_WIDTH,
      contentWidth: 114,
    },
    classes: { x: NODE_INDENT_LEFT, y: 108, width: 24, height: 16, mx: 2 },
    loadMore: {
      layer: { x: 1, y: 1, width: 1, height: 1 },
      button: { x: 1, y: 1, width: 1, height: 1 },
    },
  },
};
