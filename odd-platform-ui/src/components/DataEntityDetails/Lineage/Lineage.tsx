import React from 'react';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  getDataEntityLineage,
  getDownstreamLineageFetchingError,
  getDownstreamLineageFetchingStatuses,
  getUpstreamLineageFetchingError,
  getUpstreamLineageFetchingStatuses,
} from 'redux/selectors';
import { useAppParams } from 'lib/hooks';
import { AppErrorPage, AppCircularProgress } from 'components/shared';
import { Zoom } from '@visx/zoom';
import {
  fetchDataEntityDownstreamLineage,
  fetchDataEntityUpstreamLineage,
} from 'redux/thunks';
import { type SelectChangeEvent } from '@mui/material';
import ZoomableLineage from './ZoomableLineage/ZoomableLineage';
import { defaultDepth } from './lineageLib/constants';
import LineageProvider from './lineageLib/LineageContext/LineageProvider';
import * as S from './LineageStyles';

const Lineage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dataEntityId } = useAppParams();

  const [isLineageFetching, setIsLineageFetching] = React.useState(true);
  const [lineageDepth, setLineageDepth] = React.useState(defaultDepth);
  const [compact, setCompact] = React.useState(false);
  const [fullTitles, setFullTitles] = React.useState(false);

  const setCompactView = React.useCallback(
    (isCompact: boolean) => setCompact(isCompact),
    []
  );
  const setFullTitlesView = React.useCallback(
    (isFullTitle: boolean) => setFullTitles(isFullTitle),
    []
  );

  const handleDepthChange = React.useCallback(
    (depth: SelectChangeEvent<unknown> | number) => {
      if (typeof depth === 'number') {
        return setLineageDepth(depth);
      }

      return setLineageDepth(depth.target.value as number);
    },
    []
  );

  React.useEffect(() => {
    const params = { dataEntityId, lineageDepth, rootNodeId: dataEntityId };

    dispatch(fetchDataEntityDownstreamLineage(params)).then(() =>
      dispatch(fetchDataEntityUpstreamLineage(params)).then(() =>
        setIsLineageFetching(false)
      )
    );
  }, [lineageDepth, dataEntityId]);

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

      {!isLineageFetching && (
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
            <LineageProvider
              compact={compact}
              setCompactView={setCompactView}
              fullTitles={fullTitles}
              setFullTitlesView={setFullTitlesView}
            >
              <ZoomableLineage
                data={data}
                width={width}
                height={height}
                zoom={zoom}
                dataEntityId={dataEntityId}
                handleDepthChange={handleDepthChange}
                lineageDepth={lineageDepth}
              />
            </LineageProvider>
          )}
        </Zoom>
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
