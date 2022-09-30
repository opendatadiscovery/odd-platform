import React from 'react';
import {
  hierarchy,
  HierarchyPointLink,
  HierarchyPointNode,
  tree as d3tree,
} from 'd3-hierarchy';
import { select, selectAll } from 'd3-selection';
import { zoom as d3zoom, zoomIdentity } from 'd3-zoom';
import entries from 'lodash/entries';
import maxBy from 'lodash/maxBy';
import { v4 as uuidv4 } from 'uuid';
import { SelectChangeEvent, Typography } from '@mui/material';
import { DataEntityLineageStreamById } from 'redux/interfaces/dataentityLineage';
import { Point, TreeLinkDatum, TreeNodeDatum } from 'redux/interfaces/graph';
import { DataEntityLineageEdge, DataEntityLineageNode } from 'generated-sources';
import AppTabs from 'components/shared/AppTabs/AppTabs';
import TargetIcon from 'components/shared/Icons/TargetIcon';
import AppButton from 'components/shared/AppButton/AppButton';
import AppCircularProgress from 'components/shared/AppCircularProgress/AppCircularProgress';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  fetchDataEntityDownstreamLineage,
  fetchDataEntityUpstreamLineage,
} from 'redux/thunks';
import AppGraphCrossLink from 'components/shared/AppGraph/AppGraphCrossLink/AppGraphCrossLink';
import { getDataEntityLineage } from 'redux/selectors';
import { useAppParams } from 'lib/hooks';
import AppSelect from '../AppSelect/AppSelect';
import AppGraphLink from './AppGraphLink/AppGraphLink';
import AppGraphNode from './AppGraphNode/AppGraphNode';
import * as S from './AppGraphStyles';

const AppGraph: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dataEntityId } = useAppParams();

  const data = useAppSelector(state => getDataEntityLineage(state, dataEntityId));

  const svgInstanceRef = `rd3t-svg-${uuidv4()}`;
  const gInstanceRef = `rd3t-g-${uuidv4()}`;
  const [compactView, setCompactView] = React.useState<boolean>(false);
  const d3Zoom = d3zoom<SVGSVGElement, unknown>();
  const transitionDuration = 800;
  const zoomable = true;
  const separation = { siblings: 1, nonSiblings: 1 };
  const enableLegacyTransitions = false;
  const scaleExtent = { min: 0.1, max: 3 };
  const defaultDepth = 1;
  const [selectedDepth, setSelectedDepth] = React.useState<number>(defaultDepth);

  const setInitialDepth = React.useCallback(
    (depth: number) => setSelectedDepth(depth),
    [setSelectedDepth]
  );

  const [isLineageFetching, setIsLineageFetching] = React.useState<boolean>(true);

  const [parsedData, setParsedData] = React.useState<{
    root: TreeNodeDatum;
    upstream: {
      nodesById: {
        [nodeId: number]: TreeNodeDatum;
      };
      edgesById: {
        [entityId: number]: DataEntityLineageEdge[];
      };
      crossEdges: DataEntityLineageEdge[];
    };
    downstream: {
      nodesById: {
        [nodeId: number]: TreeNodeDatum;
      };
      edgesById: {
        [entityId: number]: DataEntityLineageEdge[];
      };
      crossEdges: DataEntityLineageEdge[];
    };
  }>();

  const defaultTreeState = {
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
  const [
    {
      nodesUp,
      linksUp,
      crossLinksUp,
      replacedCrossLinksUp,
      nodesDown,
      linksDown,
      crossLinksDown,
      replacedCrossLinksDown,
      depth,
    },
    setTreeState,
  ] = React.useState<{
    nodesUp: HierarchyPointNode<TreeNodeDatum>[];
    linksUp: TreeLinkDatum[];
    crossLinksUp: HierarchyPointLink<TreeNodeDatum>[];
    replacedCrossLinksUp: TreeLinkDatum[];
    nodesDown: HierarchyPointNode<TreeNodeDatum>[];
    linksDown: HierarchyPointLink<TreeNodeDatum>[];
    crossLinksDown: HierarchyPointLink<TreeNodeDatum>[];
    replacedCrossLinksDown: TreeLinkDatum[];
    depth: {
      upstream: number;
      downstream: number;
    };
  }>(defaultTreeState);

  const nodeSizeInitial = {
    x: 200,
    y: 160,
    mx: 150,
    my: 24,
  };

  const [nodeSize, setNodeSize] = React.useState(nodeSizeInitial);

  React.useEffect(() => {
    setNodeSize({ ...nodeSizeInitial, y: compactView ? 56 : 160 });
  }, [compactView]);

  React.useEffect(() => {
    const params = {
      dataEntityId,
      lineageDepth: selectedDepth,
      rootNodeId: dataEntityId,
    };
    dispatch(fetchDataEntityDownstreamLineage(params)).then(() =>
      setIsLineageFetching(false)
    );
    dispatch(fetchDataEntityUpstreamLineage(params)).then(() =>
      setIsLineageFetching(false)
    );
  }, [selectedDepth, dataEntityId]);

  const assignInternalProps = (nodeData: DataEntityLineageNode): TreeNodeDatum => ({
    ...nodeData,
    d3attrs: {
      id: uuidv4(),
    },
  });

  const parseData = (
    rawData: DataEntityLineageStreamById['nodesById']
  ): DataEntityLineageStreamById<TreeNodeDatum>['nodesById'] =>
    entries(rawData).reduce<DataEntityLineageStreamById<TreeNodeDatum>['nodesById']>(
      (acc, [nodeId, nodeData]) => ({
        ...acc,
        [nodeId]: assignInternalProps(nodeData),
      }),
      {}
    );

  const generateTree = () => {
    if (!parsedData) return defaultTreeState;

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

  const handleDepthChange = (event: SelectChangeEvent<unknown>) =>
    setSelectedDepth(event.target.value as unknown as number);

  const transformation: { translate: Point; scale: number } = {
    translate: { x: 0, y: 0 },
    scale: 1,
  };

  const ref = React.useRef<HTMLHeadingElement>(null);

  const centerRoot = () => {
    const g = select(`.${gInstanceRef}`);
    if (ref?.current?.offsetWidth && ref?.current?.offsetHeight) {
      transformation.scale = Math.min(
        ref.current.offsetWidth /
          (depth.downstream + depth.upstream + 1) /
          (nodeSize.x + nodeSize.mx),
        1
      );

      const upstreamWidth = (nodeSize.x + nodeSize.mx) * depth.upstream;
      const downstreamWidth = (nodeSize.x + nodeSize.mx) * depth.downstream;
      transformation.translate = {
        x:
          upstreamWidth * transformation.scale +
          (ref.current.offsetWidth -
            (upstreamWidth + downstreamWidth + nodeSize.x) * transformation.scale) /
            2,
        y: (ref.current.offsetHeight - nodeSize.y * transformation.scale) / 2,
      };
    }
    g.attr(
      'transform',
      `translate(${transformation.translate.x}, ${transformation.translate.y})scale(${transformation.scale})`
    );
  };

  const bindZoomListener = () => {
    const svg = select<SVGSVGElement, unknown>(`.${svgInstanceRef}`);
    const g = select(`.${gInstanceRef}`);
    if (zoomable) {
      svg
        .call(
          d3Zoom.transform,
          zoomIdentity
            .translate(transformation.translate.x, transformation.translate.y)
            .scale(transformation.scale)
        )
        .call(
          d3Zoom
            .scaleExtent([scaleExtent.min || 0, scaleExtent.max || 1])
            .on('zoom', event => {
              g.attr('transform', event.transform);
            })
        );
    }
  };

  const wrapLabels = () => {
    selectAll('.wrap-text').call(text =>
      text.each(function () {
        const txt = select(this);
        const chars = txt.select('title').text().split('');
        const numChars = chars.length;

        const ellipsis = txt.select<SVGTSpanElement>('tspan.ellip');
        const width =
          parseFloat(txt.attr('width')) - (ellipsis.node()?.getComputedTextLength() || 0);

        const tspan = txt
          .select<SVGTSpanElement>('tspan.visible-text')
          .text(chars.join(''));
        while ((tspan.node()?.getComputedTextLength() || 0) > width && chars.length) {
          chars.pop();
          tspan.text(chars.join(''));
        }
        if (chars.length === numChars) {
          ellipsis.style('display', 'none');
        }
      })
    );
  };

  React.useEffect(() => {
    if (!data) return;
    setParsedData({
      root: assignInternalProps(data.rootNode),
      upstream: {
        ...data.upstream,
        nodesById: parseData(data.upstream?.nodesById),
        crossEdges: data?.upstream?.crossEdges,
      },
      downstream: {
        ...data.downstream,
        nodesById: parseData(data.downstream?.nodesById),
        crossEdges: data?.downstream?.crossEdges,
      },
    });
  }, [data]);

  React.useEffect(() => {
    setTreeState(generateTree());
  }, [parsedData, nodeSize]);

  React.useEffect(() => {
    wrapLabels();
  }, [nodesUp]);

  React.useEffect(() => {
    centerRoot();
    bindZoomListener();
  }, [ref.current]);

  return isLineageFetching ? (
    <S.LoaderContainer>
      <AppCircularProgress size={16} text='Loading lineage' />
    </S.LoaderContainer>
  ) : (
    <S.Container className={zoomable ? 'rd3t-grabbable' : ''} ref={ref}>
      <S.ActionsContainer>
        <AppButton
          color='primaryLight'
          size='medium'
          startIcon={<TargetIcon />}
          onClick={centerRoot}
        >
          Main
        </AppButton>
        <AppTabs
          type='secondarySmall'
          orientation='horizontal'
          items={[{ name: 'Full' }, { name: 'Compact' }]}
          selectedTab={compactView ? 1 : 0}
          handleTabChange={(newViewIndex: number) => setCompactView(newViewIndex > 0)}
        />
        <Typography variant='subtitle2'>Depth:</Typography>
        <AppSelect
          sx={{ width: 48 }}
          native
          fullWidth={false}
          size='small'
          type='number'
          value={selectedDepth}
          onChange={handleDepthChange}
        >
          {new Array(20).fill(0).map((_, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </AppSelect>
      </S.ActionsContainer>
      <S.Layer className={svgInstanceRef}>
        <g className={gInstanceRef}>
          {crossLinksDown?.map((linkData, idx) => (
            <AppGraphCrossLink
              // eslint-disable-next-line react/no-array-index-key
              key={`link-${linkData.source.data.id}/${idx}-${linkData.target.data.id}/${idx}`}
              linkData={linkData}
              nodeSize={nodeSize}
              enableLegacyTransitions={enableLegacyTransitions}
              transitionDuration={transitionDuration}
              replacedCrossLinks={replacedCrossLinksDown}
            />
          ))}
          {crossLinksUp?.map((linkData, idx) => (
            <AppGraphCrossLink
              // eslint-disable-next-line react/no-array-index-key
              key={`link-${linkData.source.data.id}/${idx}-${linkData.target.data.id}/${idx}`}
              reverse
              linkData={linkData}
              nodeSize={nodeSize}
              enableLegacyTransitions={enableLegacyTransitions}
              transitionDuration={transitionDuration}
              replacedCrossLinks={replacedCrossLinksUp}
            />
          ))}
          {nodesUp?.map(node => (
            <AppGraphNode
              appGraphNodeType='upstream'
              rootNodeId={dataEntityId}
              key={`node-${node.x}${node.y}`}
              reverse
              data={node.data}
              position={{ x: node.x, y: node.y }}
              parent={node.parent}
              nodeSize={nodeSize}
              compactView={compactView}
              enableLegacyTransitions={enableLegacyTransitions}
              transitionDuration={transitionDuration}
              hasChildren={!!node.children?.length}
              nodeDepth={node.depth}
              setInitialDepth={setInitialDepth}
            />
          ))}
          {nodesDown?.map(node => (
            <AppGraphNode
              appGraphNodeType='downstream'
              rootNodeId={dataEntityId}
              key={`node-${node.x}${node.y}`}
              data={node.data}
              position={{ x: node.x, y: node.y }}
              parent={node.parent}
              nodeSize={nodeSize}
              compactView={compactView}
              enableLegacyTransitions={enableLegacyTransitions}
              transitionDuration={transitionDuration}
              hasChildren={!!node.children?.length}
              nodeDepth={node.depth}
              setInitialDepth={setInitialDepth}
            />
          ))}

          {linksUp?.map((linkData, idx) => (
            <AppGraphLink
              // eslint-disable-next-line react/no-array-index-key
              key={`link-${linkData.source.data.id}/${idx}-${linkData.target.data.id}/${idx}`}
              reverse
              linkData={linkData}
              nodeSize={nodeSize}
              enableLegacyTransitions={enableLegacyTransitions}
              transitionDuration={transitionDuration}
            />
          ))}
          {linksDown?.map((linkData, idx) => (
            <AppGraphLink
              // eslint-disable-next-line react/no-array-index-key
              key={`link-${linkData.source.data.id}/${idx}-${linkData.target.data.id}/${idx}`}
              linkData={linkData}
              nodeSize={nodeSize}
              enableLegacyTransitions={enableLegacyTransitions}
              transitionDuration={transitionDuration}
            />
          ))}
        </g>
      </S.Layer>
    </S.Container>
  );
};

export default AppGraph;
