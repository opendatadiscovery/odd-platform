import type { LineageGraphState, NodeSize, LineageQueryParams } from './interfaces';

export const defaultGraphState: LineageGraphState = {
  nodesUp: [],
  linksUp: [],
  crossLinksUp: [],
  nodesDown: [],
  linksDown: [],
  crossLinksDown: [],
  depth: { upstream: 0, downstream: 0 },
};

export const NODE_WIDTH = 300;
export const NODE_HEIGHT_WITHOUT_TITLE = 125;
export const NODE_COMPACT_HEIGHT_WITHOUT_TITLE = 70;
export const NODE_INDENT_LEFT = 12;
export const INFO_LINE_HEIGHT = 20;
export const INFO_MIN_ODDRN_HEIGHT = 30;
export const INFO_LABEL_WIDTH = 50;
export const NODE_LINE_HEIGHT = 10;
export const NODE_LINE_MX = 5;
export const NODE_MIN_TITLE_HEIGHT = 20;

export const LOAD_MORE_LAYER_WIDTH = 60;
export const LOAD_MORE_BUTTON_WIDTH = 91;
export const LOAD_MORE_BUTTON_HEIGHT = 24;

export const nodeSizeInitial: NodeSize = {
  size: {
    width: NODE_WIDTH,
    height: NODE_HEIGHT_WITHOUT_TITLE,
    mx: 150,
    my: 24,
    contentWidth: NODE_WIDTH - NODE_INDENT_LEFT * 3,
  },
  content: {
    title: {
      x: NODE_INDENT_LEFT,
      y: NODE_LINE_HEIGHT * 2,
      height: 40,
      width: NODE_WIDTH - NODE_INDENT_LEFT * 2,
    },
    hiddenDeps: { x: NODE_INDENT_LEFT, y: NODE_LINE_HEIGHT * 2 + NODE_LINE_MX },
    info: {
      x: NODE_INDENT_LEFT,
      y: NODE_LINE_HEIGHT * 2 + NODE_LINE_MX + NODE_LINE_MX * 5,
      oddrnHeight: INFO_MIN_ODDRN_HEIGHT,
      lineHeight: INFO_LINE_HEIGHT,
      labelWidth: INFO_LABEL_WIDTH,
      contentWidth: 114,
    },
    classes: { x: NODE_INDENT_LEFT, y: 108, width: 24, height: 16, mx: 2 },
    loadMore: {
      layer: {
        x: NODE_WIDTH,
        y: 0,
        width: LOAD_MORE_LAYER_WIDTH,
        height: NODE_HEIGHT_WITHOUT_TITLE,
      },
      button: {
        x: NODE_WIDTH + LOAD_MORE_BUTTON_WIDTH / 2 + 16,
        y: NODE_HEIGHT_WITHOUT_TITLE / 2 + LOAD_MORE_BUTTON_HEIGHT / 6,
        width: LOAD_MORE_BUTTON_WIDTH,
        height: LOAD_MORE_BUTTON_HEIGHT,
      },
    },
  },
};

export const defaultLineageQuery: LineageQueryParams = {
  full: true,
  fn: false,
  d: 1,
  t: '',
};
