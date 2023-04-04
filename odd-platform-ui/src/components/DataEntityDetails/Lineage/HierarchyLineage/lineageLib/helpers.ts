import type { StreamType, TreeLinkDatum, TreeNodeDatum } from 'redux/interfaces';
import type { HierarchyPointLink, HierarchyPointNode } from 'd3-hierarchy';
import {
  INFO_MIN_ODDRN_HEIGHT,
  NODE_INDENT_LEFT,
  NODE_MIN_TITLE_HEIGHT,
  NODE_WIDTH,
} from 'components/DataEntityDetails/Lineage/HierarchyLineage/lineageLib/constants';

const getContentHeights = (
  content: Array<string | undefined>,
  defaultHeight: number
): number[] =>
  content?.map(text => {
    if (!text) return defaultHeight;

    const el = document.createElement('div');
    const textContent = document.createTextNode(text);
    el.appendChild(textContent);

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
  }) || [];

export const getMaxTitleHeight = (
  nodes: HierarchyPointNode<TreeNodeDatum>[],
  fullTitles: boolean
): number => {
  if (nodes.length === 0 || !fullTitles) return NODE_MIN_TITLE_HEIGHT;

  const titles = nodes.map(node => node.data.internalName || node.data.externalName);
  const heights = getContentHeights(titles, NODE_MIN_TITLE_HEIGHT);

  return Math.max(...heights);
};

export const getMaxODDRNHeight = (nodes: HierarchyPointNode<TreeNodeDatum>[]): number => {
  if (nodes.length === 0 || nodes.every(node => node.data.externalName))
    return INFO_MIN_ODDRN_HEIGHT;

  const oddrns = nodes.map(node => (node.data.externalName ? '' : node.data.oddrn));

  const heights = getContentHeights(oddrns, INFO_MIN_ODDRN_HEIGHT);

  return Math.max(...heights);
};

export const getHighLightedChildLinks = (
  currentNode: HierarchyPointNode<TreeNodeDatum>,
  links: HierarchyPointLink<TreeNodeDatum>[],
  streamType: StreamType,
  highLightedLinks: HierarchyPointLink<TreeNodeDatum>[]
) => {
  const targetKey: keyof TreeLinkDatum =
    streamType === 'downstream' ? 'target' : 'source';
  const sourceKey: keyof TreeLinkDatum =
    streamType === 'downstream' ? 'source' : 'target';

  if (links.length > 0) {
    links.forEach(link => {
      if (currentNode.data.id === link[sourceKey].data.id) {
        highLightedLinks.push({ source: currentNode, target: link[targetKey] });
      }
    });
  }
};

export const getHighLightedParentLinks = (
  currentNode: HierarchyPointNode<TreeNodeDatum>,
  links: HierarchyPointLink<TreeNodeDatum>[],
  streamType: StreamType,
  highLightedLinks: HierarchyPointLink<TreeNodeDatum>[]
) => {
  const targetKey: keyof TreeLinkDatum =
    streamType === 'downstream' ? 'target' : 'source';
  const sourceKey: keyof TreeLinkDatum =
    streamType === 'downstream' ? 'source' : 'target';

  if (links.length > 0) {
    links.forEach(link => {
      if (currentNode.data.id === link[targetKey].data.id) {
        highLightedLinks.push({ source: link[sourceKey], target: currentNode });
      }
    });
  }
};

export const getHighLightedLinks = (
  currentNode: HierarchyPointNode<TreeNodeDatum>,
  links: HierarchyPointLink<TreeNodeDatum>[],
  streamType: StreamType,
  setHighLightedLinks: (links: HierarchyPointLink<TreeNodeDatum>[]) => void
) => {
  const highLightedLinks: HierarchyPointLink<TreeNodeDatum>[] = [];

  getHighLightedChildLinks(currentNode, links, streamType, highLightedLinks);
  getHighLightedParentLinks(currentNode, links, streamType, highLightedLinks);

  setHighLightedLinks(highLightedLinks);
};

export const isLinkHighLighted = (
  linksToHighlight: TreeLinkDatum[],
  link: TreeLinkDatum,
  reverse: boolean
) =>
  linksToHighlight.find(linkToHighlight =>
    reverse
      ? (linkToHighlight.source.data.id === link.target.data.id &&
          linkToHighlight.target.data.id === link.source.data.id) ||
        (linkToHighlight.target.data.id === link.target.data.id &&
          linkToHighlight.source.data.id === link.source.data.id)
      : linkToHighlight.source.data.id === link.source.data.id &&
        linkToHighlight.target.data.id === link.target.data.id
  );

export const setHighlightedLinksFirst = (
  links: TreeLinkDatum[],
  linksToHighlight: TreeLinkDatum[],
  reverse: boolean
): TreeLinkDatum[] =>
  [
    ...links.filter(link => !isLinkHighLighted(linksToHighlight, link, reverse)),
    ...links.filter(link => isLinkHighLighted(linksToHighlight, link, reverse)),
  ].map(link =>
    isLinkHighLighted(linksToHighlight, link, reverse)
      ? { ...link, isHighlighted: true }
      : link
  );
