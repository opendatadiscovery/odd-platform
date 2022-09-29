import React from 'react';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { getDataEntityLineageStreamFetching } from 'redux/selectors';
import { select } from 'd3-selection';
import { interpolateString } from 'd3-interpolate';
import {
  fetchDataEntityDownstreamLineage,
  fetchDataEntityUpstreamLineage,
} from 'redux/thunks';
import { StreamType } from 'redux/interfaces';
import * as S from './LoadMoreButtonStyles';

interface LoadMoreButtonProps {
  rootNodeId: number;
  dataEntityId: number;
  appGraphNodeType: StreamType;
  reverse?: boolean;
  loadMoreLayout: {
    x: number;
    y: number;
    width: number;
    height: number;
    my: number;
    mx: number;
  };
  loadMoreCount?: number;
  hideLoadMore: () => void;
}

const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({
  rootNodeId,
  dataEntityId,
  appGraphNodeType,
  reverse,
  loadMoreLayout,
  loadMoreCount,
  hideLoadMore,
}) => {
  const dispatch = useAppDispatch();

  const isStreamFetching = useAppSelector(getDataEntityLineageStreamFetching);

  const loadMoreButtonHandler = () => {
    const params = { dataEntityId, lineageDepth: 1, rootNodeId };
    if (appGraphNodeType === 'downstream') {
      dispatch(fetchDataEntityDownstreamLineage(params)).then(() => hideLoadMore());
    }

    if (appGraphNodeType === 'upstream') {
      dispatch(fetchDataEntityUpstreamLineage(params)).then(() => hideLoadMore());
    }
  };

  const loadMoreTransformTranslate = `translate(${
    reverse
      ? -loadMoreLayout.mx - loadMoreLayout.width
      : loadMoreLayout.x + loadMoreLayout.mx
  },${loadMoreLayout.y - loadMoreLayout.height / 2})`;

  let loadMoreSpinnerRef: SVGGElement;

  // spinner parameters
  const centerX = 46;
  const centerY = 12;
  const radius = 8;
  const strokeWidth = 2;

  const loadMoreSpinnerTransform = () => {
    select(loadMoreSpinnerRef)
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', radius)
      .attr('stroke-width', strokeWidth)
      .attr('stroke-linecap', 'round')
      .attr('stroke-dasharray', 2 * Math.PI * radius)
      .attr('stroke-dashoffset', 50)
      .transition()
      .duration(2000)
      .attrTween('transform', () =>
        interpolateString(
          `translate(0, 0) rotate(0, ${centerX}, ${centerY})`,
          `translate(0, 0) rotate(360, ${centerX}, ${centerY})`
        )
      )
      .attr('stroke-dashoffset', 0)
      .on('end', loadMoreSpinnerTransform);
  };

  React.useEffect(() => {
    loadMoreSpinnerTransform();
  }, [loadMoreSpinnerTransform]);

  return (
    <S.LoadMoreButton
      transform={loadMoreTransformTranslate}
      onClick={loadMoreButtonHandler}
    >
      <rect width={loadMoreLayout.width} height={loadMoreLayout.height} rx={16} />
      {isStreamFetching ? (
        <g>
          <S.LoadMoreSpinnerBackground
            cx={centerX}
            cy={centerY}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <S.LoadMoreSpinner />
        </g>
      ) : (
        <S.LoadMoreButtonName
          x={loadMoreLayout.width / 2}
          y={loadMoreLayout.height / 2 + loadMoreLayout.my}
        >
          {`Load ${loadMoreCount} more`}
        </S.LoadMoreButtonName>
      )}
    </S.LoadMoreButton>
  );
};

export default LoadMoreButton;
