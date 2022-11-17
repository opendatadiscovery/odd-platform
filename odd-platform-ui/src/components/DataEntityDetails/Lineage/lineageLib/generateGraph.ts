import { hierarchy, tree as d3tree } from 'd3-hierarchy';
import {
  DataEntityLineageById,
  DataEntityLineageStreamById,
  TreeLinkDatum,
  TreeNodeDatum,
} from 'redux/interfaces';
import maxBy from 'lodash/maxBy';
import {
  GenerateGraphProps,
  LineageGraphState,
  LineageParsedData,
} from 'components/DataEntityDetails/Lineage/lineageLib/interfaces';
import { DataEntityLineageNode } from 'generated-sources';
import { v4 as uuidv4 } from 'uuid';
import entries from 'lodash/entries';

export const parseData = (data: DataEntityLineageById): LineageParsedData | undefined => {
  const assignUuidToNode = (nodeData: DataEntityLineageNode): TreeNodeDatum => ({
    ...nodeData,
    d3attrs: { id: uuidv4() },
  });

  const assignUuidToNodes = (
    rawData: DataEntityLineageStreamById['nodesById']
  ): DataEntityLineageStreamById<TreeNodeDatum>['nodesById'] =>
    entries(rawData).reduce<DataEntityLineageStreamById<TreeNodeDatum>['nodesById']>(
      (acc, [nodeId, nodeData]) => ({ ...acc, [nodeId]: assignUuidToNode(nodeData) }),
      {}
    );

  if (!data) return undefined;

  return {
    root: assignUuidToNode(data.rootNode),
    upstream: {
      ...data.upstream,
      nodesById: assignUuidToNodes(data.upstream?.nodesById),
      crossEdges: data?.upstream?.crossEdges,
    },
    downstream: {
      ...data.downstream,
      nodesById: assignUuidToNodes(data.downstream?.nodesById),
      crossEdges: data?.downstream?.crossEdges,
    },
  };
};

export const generateTree = ({
  parsedData,
  defaultGraphState,
  separation,
  nodeSize,
}: GenerateGraphProps): LineageGraphState => {
  if (!parsedData) return defaultGraphState;

  const treeUp = d3tree<TreeNodeDatum>()
    .nodeSize([nodeSize.y + nodeSize.my, -(nodeSize.x + nodeSize.mx)])
    .separation((a, b) =>
      a.parent?.data.d3attrs.id === b.parent?.data.d3attrs.id
        ? separation.siblings || 1
        : separation.nonSiblings || 2
    );

  const rootNodeUp = treeUp(
    hierarchy(
      parsedData.root,
      d =>
        parsedData.upstream.edgesById[d.id]?.map(
          edge => parsedData.upstream.nodesById[edge.sourceId]
        ) || []
    )
  );

  const nUp = rootNodeUp.descendants();
  const lUp = rootNodeUp.links();

  const replacedCrossLinksUp: TreeLinkDatum[] = [];

  const crossLUp = parsedData.upstream.crossEdges?.reduce<TreeLinkDatum[]>(
    (memo, edge) => {
      const sourceNode = nUp.find(node => node.data.id === edge.sourceId);
      const targetNode = nUp.find(node => node.data.id === edge.targetId);

      if (sourceNode && targetNode) {
        const crossLink = {
          source: sourceNode,
          target: targetNode,
        };
        const replacedCrossLink = {
          source: targetNode,
          target: sourceNode,
        };

        if (sourceNode.depth < targetNode.depth) {
          replacedCrossLinksUp.push(replacedCrossLink);
          memo.push(replacedCrossLink);
          return memo;
        }

        memo.push(crossLink);
      }

      return memo;
    },
    []
  );

  const treeDown = d3tree<TreeNodeDatum>()
    .nodeSize([nodeSize.y + nodeSize.my, nodeSize.x + nodeSize.mx])
    .separation((a, b) =>
      a.parent?.data.d3attrs.id === b.parent?.data.d3attrs.id
        ? separation.siblings || 1
        : separation.nonSiblings || 2
    );

  const rootNodeDown = treeDown(
    hierarchy(
      parsedData.root,
      d =>
        parsedData.downstream.edgesById[d.id]?.map(
          edge => parsedData.downstream.nodesById[edge.targetId]
        ) || []
    )
  );

  const nDown = rootNodeDown.descendants();
  const lDown = rootNodeDown.links();

  const replacedCrossLinksDown: TreeLinkDatum[] = [];

  const crossLDown = parsedData.downstream.crossEdges?.reduce<TreeLinkDatum[]>(
    (memo, edge) => {
      const sourceNode = nDown.find(node => node.data.id === edge.sourceId);
      const targetNode = nDown.find(node => node.data.id === edge.targetId);

      if (sourceNode && targetNode) {
        const crossLink = {
          source: sourceNode,
          target: targetNode,
        };
        const replacedCrossLink = {
          source: targetNode,
          target: sourceNode,
        };

        if (sourceNode.depth < targetNode.depth) {
          replacedCrossLinksDown.push(replacedCrossLink);
          memo.push(replacedCrossLink);
          return memo;
        }

        memo.push(crossLink);
      }

      return memo;
    },
    []
  );

  return {
    nodesUp: nUp,
    linksUp: lUp,
    crossLinksUp: crossLUp,
    replacedCrossLinksUp,
    nodesDown: nDown,
    linksDown: lDown,
    crossLinksDown: crossLDown,
    replacedCrossLinksDown,
    depth: {
      upstream: maxBy(nUp, node => node.depth)?.depth || 0,
      downstream: maxBy(nDown, node => node.depth)?.depth || 0,
    },
  };
};
