import { type TreeNodeDatum } from 'redux/interfaces';
import { type HierarchyPointNode } from 'd3-hierarchy';
import { NODE_INDENT_LEFT, NODE_MIN_TITLE_HEIGHT, NODE_WIDTH } from './constants';

export const getMaxTitleHeight = (
  nodes: HierarchyPointNode<TreeNodeDatum>[],
  fullTitles: boolean
): number => {
  if (nodes.length === 0 || !fullTitles) return NODE_MIN_TITLE_HEIGHT;

  const titles = nodes.map(node => node.data.internalName || node.data.externalName);
  const heights = titles.map(title => {
    if (!title) return NODE_MIN_TITLE_HEIGHT;

    const el = document.createElement('div');
    const content = document.createTextNode(title);
    el.appendChild(content);

    el.style.fontFamily = 'Roboto';
    el.style.fontSize = '14px';
    el.style.fontWeight = '500';
    el.style.lineHeight = '20px';
    el.style.visibility = 'hidden';
    el.style.width = `${NODE_WIDTH - NODE_INDENT_LEFT * 2}px`;
    el.style.height = 'auto';
    el.style.wordBreak = 'break-all';

    document.body.appendChild(el);

    const height = el.offsetHeight;

    el?.parentNode?.removeChild(el);

    return height;
  });

  return Math.max(...heights);
};
