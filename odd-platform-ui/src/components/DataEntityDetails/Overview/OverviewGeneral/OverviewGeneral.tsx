import React from 'react';
import { Box, Grid } from '@mui/material';
import {
  AppTooltip,
  CopyButton,
  DatasourceLogo,
  LabeledInfoItem,
} from 'components/shared/elements';
import { useAppSelector } from 'redux/lib/hooks';
import { getDataEntityDetails } from 'redux/selectors';
import { useAppDateTime, useAppParams } from 'lib/hooks';
import * as S from './OverviewGeneralStyles';
import OwnersSection from './OwnersSection/OwnersSection';

const OverviewGeneral: React.FC = () => {
  const { dataEntityId } = useAppParams();
  const { dataEntityFormattedDateTime } = useAppDateTime();

  const dataEntityDetails = useAppSelector(getDataEntityDetails(dataEntityId));

  const createdAt =
    dataEntityDetails.createdAt &&
    dataEntityFormattedDateTime(dataEntityDetails.createdAt.getTime());

  return (
    <Grid container>
      <Grid item container sm={12}>
        <Grid item sm={12}>
          <LabeledInfoItem inline label='Namespace' labelWidth={4}>
            {dataEntityDetails.dataSource?.namespace?.name}
          </LabeledInfoItem>
        </Grid>
        {!dataEntityDetails.manuallyCreated && dataEntityDetails.dataSource?.oddrn && (
          <Grid item sm={12}>
            <LabeledInfoItem inline label='Datasource' labelWidth={4}>
              <Grid container flexWrap='nowrap' alignItems='center'>
                <DatasourceLogo
                  width={24}
                  padding={0}
                  backgroundColor='transparent'
                  name={dataEntityDetails.dataSource?.oddrn}
                />
                <AppTooltip title={dataEntityDetails.dataSource?.name}>
                  <Box sx={{ ml: 0.5, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {dataEntityDetails.dataSource?.name}
                  </Box>
                </AppTooltip>
              </Grid>
            </LabeledInfoItem>
          </Grid>
        )}
        <Grid item sm={12}>
          <LabeledInfoItem inline label='Created' labelWidth={4}>
            {createdAt}
          </LabeledInfoItem>
        </Grid>
        <Grid item sm={12}>
          <LabeledInfoItem inline label='View count' labelWidth={4}>
            {dataEntityDetails.viewCount}
          </LabeledInfoItem>
        </Grid>
        <Grid item sm={12} sx={{ mt: 2 }}>
          <LabeledInfoItem
            labelWidth={12}
            label={
              <Grid container justifyContent='space-between'>
                <Grid item>ODDRN</Grid>
                <Grid item>
                  <CopyButton text='Copy' stringToCopy={dataEntityDetails.oddrn} />
                </Grid>
              </Grid>
            }
          >
            <S.OddrnValue>{dataEntityDetails.oddrn}</S.OddrnValue>
          </LabeledInfoItem>
        </Grid>
        <OwnersSection />
      </Grid>
    </Grid>
  );
};

export default OverviewGeneral;
