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
import { AppCircularProgress, AppErrorPage } from 'components/shared/elements';
import { Zoom } from '@visx/zoom';
import {
  fetchDataEntityDownstreamLineage,
  fetchDataEntityUpstreamLineage,
} from 'redux/thunks';
import {
  expandEntitiesFromDownstreamGroup,
  expandEntitiesFromUpstreamGroup,
} from 'redux/slices/dataEntityLineage/dataEntityLineage.slice';
import type { TransformMatrix } from '@visx/zoom/lib/types';
import type { LineageQueryParams } from './lineageLib/interfaces';
import ZoomableLineage from './ZoomableLineage/ZoomableLineage';
import {
  defaultLineageQuery,
  initialTransformMatrix,
  layerWidth,
  layerHeight,
} from './lineageLib/constants';
import LineageProvider from './lineageLib/LineageContext/LineageProvider';
import * as S from './HierarchyLineage.styles';

const HierarchyLineage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dataEntityId } = useAppParams();

  const {
    queryParams: { d, t, eag, exdg, exug, exd, exu },
  } = useQueryParams<LineageQueryParams>(defaultLineageQuery);

  const [isLineageFetching, setIsLineageFetching] = React.useState(true);

  React.useEffect(() => {
    const baseParams = {
      dataEntityId,
      lineageDepth: d,
      rootNodeId: dataEntityId,
      expandGroups: eag,
    };
    const downstreamParams = { ...baseParams, expandedEntityIds: exd };
    const upstreamParams = { ...baseParams, expandedEntityIds: exu };

    dispatch(fetchDataEntityDownstreamLineage(downstreamParams)).then(() =>
      dispatch(fetchDataEntityUpstreamLineage(upstreamParams)).then(() => {
        if (exdg?.length > 0) {
          const expandGroupParams = { rootNodeId: dataEntityId, idsToExclude: exdg };
          dispatch(expandEntitiesFromDownstreamGroup(expandGroupParams));
        }
        if (exug?.length > 0) {
          const expandGroupParams = { rootNodeId: dataEntityId, idsToExclude: exug };
          dispatch(expandEntitiesFromUpstreamGroup(expandGroupParams));
        }
        setIsLineageFetching(false);
      })
    );
  }, [d, dataEntityId]);

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

  const setInitialTransform = React.useMemo<TransformMatrix>(() => {
    if (t) return JSON.parse(t) as TransformMatrix;

    return initialTransformMatrix;
  }, [t, initialTransformMatrix]);

  const handleWheelDelta = React.useCallback(
    (e: React.WheelEvent | WheelEvent) =>
      -e.deltaY > 0 ? { scaleX: 0.99, scaleY: 0.99 } : { scaleX: 1.01, scaleY: 1.01 },
    []
  );

  return (
    <S.Container>
      {isLineageFetching ? (
        <S.LoaderContainer>
          <AppCircularProgress size={16} text='Loading lineage' />
        </S.LoaderContainer>
      ) : null}

      {!isLineageFetching && !isLineageNotFetched && (
        <LineageProvider>
          <Zoom<SVGSVGElement>
            width={layerWidth}
            height={layerHeight}
            scaleXMin={0.05}
            scaleXMax={2}
            scaleYMin={0.05}
            scaleYMax={2}
            initialTransformMatrix={setInitialTransform}
            wheelDelta={handleWheelDelta}
          >
            {zoom => (
              <ZoomableLineage
                data={data}
                width={layerWidth}
                height={layerHeight}
                zoom={zoom}
                dataEntityId={dataEntityId}
              />
            )}
          </Zoom>
        </LineageProvider>
      )}

      <AppErrorPage
        showError={isLineageNotFetched}
        error={upstreamError || downstreamError}
        offsetTop={132}
      />
    </S.Container>
  );
};

export default HierarchyLineage;
