import React from 'react';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  fetchDataEntityDownstreamLineage,
  fetchDataEntityUpstreamLineage,
} from 'redux/thunks';
import type { StreamType } from 'redux/interfaces';
import {
  getDownstreamLineageFetchingStatuses,
  getUpstreamLineageFetchingStatuses,
} from 'redux/selectors';
import { Group } from '@visx/group';
import { useQueryParams } from 'lib/hooks';
import LineageContext from 'components/DataEntityDetails/Lineage/HierarchyLineage/lineageLib/LineageContext/LineageContext';
import * as S from 'components/DataEntityDetails/Lineage/HierarchyLineage/ZoomableLineage/LineageGraph/Node/LoadMoreButton/LoadMoreButtonStyles';
import type { LineageQueryParams } from 'components/DataEntityDetails/Lineage/HierarchyLineage/lineageLib/interfaces';
import { defaultLineageQuery } from 'components/DataEntityDetails/Lineage/HierarchyLineage/lineageLib/constants';

interface LoadMoreButtonProps {
  rootNodeId: number;
  dataEntityId: number;
  streamType: StreamType;
  reverse?: boolean;
  loadMoreCount?: number;
  hideLoadMore: () => void;
}

const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({
  rootNodeId,
  dataEntityId,
  streamType,
  reverse,
  loadMoreCount,
  hideLoadMore,
}) => {
  const dispatch = useAppDispatch();
  const { nodeSize } = React.useContext(LineageContext);
  const {
    queryParams: { eag },
    setQueryParams,
  } = useQueryParams<LineageQueryParams>(defaultLineageQuery);

  const { isLoading: isUpstreamFetching } = useAppSelector(
    getUpstreamLineageFetchingStatuses
  );
  const { isLoading: isDownstreamFetching } = useAppSelector(
    getDownstreamLineageFetchingStatuses
  );

  const isStreamFetching = React.useMemo(
    () => isUpstreamFetching || isDownstreamFetching,
    [isUpstreamFetching, isDownstreamFetching]
  );

  const loadMoreButtonHandler = () => {
    const params = { dataEntityId, lineageDepth: 1, rootNodeId, expandGroups: eag };
    if (streamType === 'downstream') {
      dispatch(fetchDataEntityDownstreamLineage(params)).then(() => hideLoadMore());
      setQueryParams(prev => ({ ...prev, exd: [...prev.exd, dataEntityId] }));
    }

    if (streamType === 'upstream') {
      dispatch(fetchDataEntityUpstreamLineage(params)).then(() => hideLoadMore());
      setQueryParams(prev => ({ ...prev, exu: [...prev.exu, dataEntityId] }));
    }
  };

  const centerX = 0;
  const centerY = -4;
  const radius = 8;
  const strokeWidth = 2;

  return (
    <S.LoadMoreButton
      top={nodeSize.content.loadMore.button.y}
      left={
        reverse
          ? (-nodeSize.content.loadMore.button.width * 2) / 3
          : nodeSize.content.loadMore.button.x
      }
      onClick={loadMoreButtonHandler}
    >
      <rect
        width={nodeSize.content.loadMore.button.width}
        height={nodeSize.content.loadMore.button.height}
        transform={`translate(${-nodeSize.content.loadMore.button.width / 2}, ${
          -nodeSize.content.loadMore.button.height / 1.5
        })`}
        rx={16}
      />
      {isStreamFetching ? (
        <Group>
          <S.LoadMoreSpinnerBackground
            cx={centerX}
            cy={centerY}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <S.LoadMoreSpinner cy={centerY} r={radius} />
        </Group>
      ) : (
        <S.LoadMoreButtonName>{`Load ${loadMoreCount} more`}</S.LoadMoreButtonName>
      )}
    </S.LoadMoreButton>
  );
};

export default LoadMoreButton;
