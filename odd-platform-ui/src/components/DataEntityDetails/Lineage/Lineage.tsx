import React from 'react';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  getDataEntityLineage,
  getDownstreamLineageFetchingError,
  getDownstreamLineageFetchingStatuses,
  getUpstreamLineageFetchingError,
  getUpstreamLineageFetchingStatuses,
} from 'redux/selectors';
import { useAppParams, useQueryParams } from 'lib/hooks';
import { AppCircularProgress, AppErrorPage } from 'components/shared';
import { Zoom } from '@visx/zoom';
import {
  fetchDataEntityDownstreamLineage,
  fetchDataEntityUpstreamLineage,
} from 'redux/thunks';
import { expandAllGroups } from 'redux/slices/dataEntityLineage/dataEntityLineage.slice';
import type { LineageQueryParams } from './lineageLib/interfaces';
import ZoomableLineage from './ZoomableLineage/ZoomableLineage';
import { defaultLineageQuery } from './lineageLib/constants';
import LineageProvider from './lineageLib/LineageContext/LineageProvider';
import * as S from './LineageStyles';

const Lineage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dataEntityId } = useAppParams();

  const {
    queryParams: { d },
  } = useQueryParams<LineageQueryParams>(defaultLineageQuery);

  const [isLineageFetching, setIsLineageFetching] = React.useState(true);

  const [expandGroups, setExpandGroups] = React.useState(false);

  React.useEffect(() => {
    const params = {
      dataEntityId,
      lineageDepth: d,
      rootNodeId: dataEntityId,
      expandGroups,
    };

    if (!expandGroups) {
      dispatch(fetchDataEntityDownstreamLineage(params)).then(() =>
        dispatch(fetchDataEntityUpstreamLineage(params)).then(() =>
          setIsLineageFetching(false)
        )
      );
    }
  }, [d, dataEntityId, expandGroups]);

  const data = useAppSelector(getDataEntityLineage(dataEntityId));
  const { isNotLoaded: isUpstreamNotFetched } = useAppSelector(
    getUpstreamLineageFetchingStatuses
  );
  const { isNotLoaded: isDownstreamNotFetched } = useAppSelector(
    getDownstreamLineageFetchingStatuses
  );
  const upstreamError = useAppSelector(getUpstreamLineageFetchingError);
  const downstreamError = useAppSelector(getDownstreamLineageFetchingError);

  const isLineageNotFetched = React.useMemo(
    () => isUpstreamNotFetched || isDownstreamNotFetched,
    [isUpstreamNotFetched, isDownstreamNotFetched]
  );

  React.useEffect(() => {
    const rootNodeId = data?.rootNode.id;

    dispatch(expandAllGroups({ rootNodeId, isExpanded: expandGroups }));
  }, [expandGroups]);

  const height = 780;
  const width = 1408;
  const initialTransformMatrix = {
    scaleX: 0.75,
    scaleY: 0.75,
    translateX: width / 2.3,
    translateY: height / 2.5,
    skewX: 0,
    skewY: 0,
  };

  return (
    <S.Container>
      {isLineageFetching ? (
        <S.LoaderContainer>
          <AppCircularProgress size={16} text='Loading lineage' />
        </S.LoaderContainer>
      ) : null}

      {!isLineageFetching && !isLineageNotFetched && (
        <LineageProvider expandGroups={expandGroups} setExpandGroups={setExpandGroups}>
          <Zoom<SVGSVGElement>
            width={width}
            height={height}
            scaleXMin={0.2}
            scaleXMax={2}
            scaleYMin={0.2}
            scaleYMax={2}
            initialTransformMatrix={initialTransformMatrix}
          >
            {zoom => (
              <ZoomableLineage
                data={data}
                width={width}
                height={height}
                zoom={zoom}
                dataEntityId={dataEntityId}
              />
            )}
          </Zoom>
        </LineageProvider>
      )}

      <AppErrorPage
        isNotContentLoaded={isLineageNotFetched}
        error={upstreamError || downstreamError}
        offsetTop={132}
      />
    </S.Container>
  );
};

export default Lineage;
