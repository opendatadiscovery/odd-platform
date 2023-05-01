import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useDataEntityMetrics } from 'lib/hooks/api';
import { useAppParams } from 'lib/hooks';
import { AppCircularProgress, MetricFamily } from 'components/shared/elements';
import * as S from './OverviewMetricsStyles';

interface OverviewMetricsProps {
  showOverview: boolean;
}

const OverviewMetrics: React.FC<OverviewMetricsProps> = ({ showOverview }) => {
  const { dataEntityId } = useAppParams();
  const { data, isError, isLoading } = useDataEntityMetrics({
    dataEntityId,
    enabled: showOverview,
  });

  const maxHeight = 450;
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  type ContainerState = { open: boolean; visibleHeight: string; showBtn: boolean };
  const [{ open, visibleHeight, showBtn }, setState] = React.useState<ContainerState>({
    open: false,
    visibleHeight: `fit-content`,
    showBtn: false,
  });

  React.useEffect(() => {
    if (containerRef.current && containerRef.current?.scrollHeight > maxHeight) {
      setState(prev => ({ ...prev, visibleHeight: `${maxHeight}px`, showBtn: true }));
    }
  }, [containerRef.current]);

  const handleOnClick = React.useCallback(() => {
    if (!open && containerRef.current && containerRef.current?.scrollHeight) {
      const height = containerRef.current?.scrollHeight;
      setState(prev => ({ ...prev, visibleHeight: `${height}px`, open: true }));
    } else {
      setState(prev => ({ ...prev, visibleHeight: `${maxHeight}px`, open: false }));
    }
  }, [open, containerRef.current]);

  if (!showOverview || isError || data?.metricFamilies.length === 0) return null;
  if (!showOverview || isError || data?.metricFamilies.length === 0) return null;

  return (
    <>
      <Typography variant='h2' sx={{ mt: 3, mb: 1 }}>
        Metrics
      </Typography>
      <S.Container
        ref={containerRef}
        $visibleHeight={visibleHeight}
        $open={open}
        $showBtn={showBtn}
        square
        elevation={0}
      >
        {isLoading ? (
          <Grid container justifyContent='center'>
            <AppCircularProgress background='transparent' size={40} />
          </Grid>
        ) : (
          <>
            {data?.metricFamilies.map(family => (
              <MetricFamily key={family.name} family={family} />
            ))}
            {showBtn && (
              <S.ViewButton
                text={open ? 'Hide' : `View All`}
                buttonType='tertiary-m'
                onClick={handleOnClick}
              />
            )}
          </>
        )}
      </S.Container>
    </>
  );
};

export default OverviewMetrics;
