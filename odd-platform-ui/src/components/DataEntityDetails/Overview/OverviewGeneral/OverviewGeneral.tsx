import React from 'react';
import { Grid } from '@mui/material';
import { format } from 'date-fns';
import { CopyButton, LabeledInfoItem } from 'components/shared';
import { useAppSelector } from 'redux/lib/hooks';
import { getDataEntityDetails } from 'redux/selectors';
import { useAppParams } from 'lib/hooks';
import * as S from './OverviewGeneralStyles';
import OwnersSection from './OwnersSection/OwnersSection';

const OverviewGeneral: React.FC = () => {
  const { dataEntityId } = useAppParams();

  const dataEntityDetails = useAppSelector(getDataEntityDetails(dataEntityId));

  const createdAt =
    dataEntityDetails.createdAt && format(dataEntityDetails.createdAt, 'd MMM yyyy');

  return (
    <Grid container>
      <Grid item container sm={12}>
        <Grid item sm={12}>
          <LabeledInfoItem inline label='Namespace' labelWidth={4}>
            {dataEntityDetails.dataSource?.namespace?.name}
          </LabeledInfoItem>
        </Grid>
        {!dataEntityDetails?.manuallyCreated && (
          <Grid item sm={12}>
            <LabeledInfoItem inline label='Datasource' labelWidth={4}>
              {dataEntityDetails.dataSource?.name}
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
