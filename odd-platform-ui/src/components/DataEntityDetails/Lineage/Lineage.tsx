import React from 'react';
import AppGraph from 'components/shared/AppGraph/AppGraph';
import * as S from 'components/shared/AppGraph/AppGraphStyles';
import AppCircularProgress from 'components/shared/AppCircularProgress/AppCircularProgress';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  getDataEntityLineage,
  getDownstreamLineageFetchingError,
  getDownstreamLineageFetchingStatuses,
  getUpstreamLineageFetchingError,
  getUpstreamLineageFetchingStatuses,
} from 'redux/selectors';
import { useAppParams } from 'lib/hooks';
import { AppErrorPage } from 'components/shared';
import { Zoom } from '@visx/zoom';
import ZoomableLineage from 'components/DataEntityDetails/Lineage/ZoomableLineage/ZoomableLineage';
import {
  fetchDataEntityDownstreamLineage,
  fetchDataEntityUpstreamLineage,
} from 'redux/thunks';
import { defaultDepth } from 'components/DataEntityDetails/Lineage/lineageLib/constants';
import { SelectChangeEvent } from '@mui/material';
import { Container } from './LineageStyles';

const Lineage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dataEntityId } = useAppParams();

  const [lineageDepth, setLineageDepth] = React.useState(defaultDepth);
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

    dispatch(fetchDataEntityDownstreamLineage(params));
    dispatch(fetchDataEntityUpstreamLineage(params));
  }, [lineageDepth, dataEntityId]);

  const data = useAppSelector(getDataEntityLineage(dataEntityId));
  const {
    isLoading: isUpstreamFetching,
    isLoaded: isUpstreamLoaded,
    isNotLoaded: isUpstreamNotFetched,
  } = useAppSelector(getUpstreamLineageFetchingStatuses);
  const {
    isLoading: isDownstreamFetching,
    isLoaded: isDownstreamLoaded,
    isNotLoaded: isDownstreamNotFetched,
  } = useAppSelector(getDownstreamLineageFetchingStatuses);
  const upstreamError = useAppSelector(getUpstreamLineageFetchingError);
  const downstreamError = useAppSelector(getDownstreamLineageFetchingError);

  const isLineageFetching = React.useMemo(
    () => isUpstreamFetching || isDownstreamFetching,
    [isUpstreamFetching, isDownstreamFetching]
  );
  const isLineageFetched = React.useMemo(
    () => isUpstreamLoaded && isDownstreamLoaded,
    [isUpstreamLoaded, isDownstreamLoaded]
  );
  const isLineageNotFetched = React.useMemo(
    () => isUpstreamNotFetched || isDownstreamNotFetched,
    [isUpstreamNotFetched, isDownstreamNotFetched]
  );

  const height = 780;
  const width = 1408;
  const initialTransformMatrix = {
    scaleX: 1 / 2,
    scaleY: 1 / 2,
    translateX: 0,
    translateY: 0,
    skewX: 0,
    skewY: 0,
  };

  return (
    <Container>
      {isLineageFetching ? (
        <S.LoaderContainer>
          <AppCircularProgress size={16} text='Loading lineage' />
        </S.LoaderContainer>
      ) : null}
      {isLineageFetched && (
        <Zoom<SVGSVGElement>
          width={width}
          height={height}
          scaleXMin={0.05}
          scaleXMax={4}
          scaleYMin={0.05}
          scaleYMax={4}
          initialTransformMatrix={initialTransformMatrix}
        >
          {zoom => (
            <ZoomableLineage
              data={data}
              width={width}
              height={height}
              zoom={zoom}
              dataEntityId={dataEntityId}
              handleDepthChange={handleDepthChange}
              lineageDepth={lineageDepth}
            />
          )}
        </Zoom>
      )}
      <AppErrorPage
        isNotContentLoaded={isLineageNotFetched}
        error={upstreamError || downstreamError}
        offsetTop={132}
      />
    </Container>
  );
};

export default Lineage;
