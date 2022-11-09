import React from 'react';
import { Link } from 'react-router-dom';
import { DataEntityClassNameEnum, DataEntityDetails } from 'generated-sources';
import EntityClassItem from 'components/shared/EntityClassItem/EntityClassItem';
import AppButton from 'components/shared/AppButton/AppButton';
import { Grid, Typography } from '@mui/material';
import EntitiesListModal from 'components/shared/EntitiesListModal/EntitiesListModal';
import { useAppPaths } from 'lib/hooks';

interface OverviewDataConsumerStatsProps {
  inputs: DataEntityDetails['inputList'];
  unknownInputsCount: number;
  dataEntityName: string | undefined;
}

const OverviewDataConsumerStats: React.FC<OverviewDataConsumerStatsProps> = ({
  inputs,
  unknownInputsCount,
  dataEntityName,
}) => {
  const displayedEntitiesNumber = 10;
  const { dataEntityDetailsPath } = useAppPaths();

  return (
    <Grid container>
      <Grid sx={{ ml: 0, mb: 1.25 }} item xs={12}>
        <EntityClassItem entityClassName={DataEntityClassNameEnum.CONSUMER} fullName />
      </Grid>
      <Grid item container xs={6} alignItems='flex-start' alignContent='flex-start'>
        <Grid item container xs={12} alignItems='baseline'>
          <Typography variant='h2'>
            {(inputs?.length || 0) + (unknownInputsCount || 0)}
          </Typography>
          <Typography sx={{ ml: 0.5, color: 'texts.hint' }} variant='body1'>
            inputs
          </Typography>
        </Grid>
        <Grid item container xs={12} direction='column' alignItems='flex-start'>
          {inputs?.slice(0, displayedEntitiesNumber).map(input => (
            <AppButton
              key={input.id}
              sx={{ my: 0.25 }}
              size='small'
              color='tertiary'
              onClick={() => {}}
            >
              <Link to={dataEntityDetailsPath(input.id)}>
                {input.internalName || input.externalName}
              </Link>
            </AppButton>
          ))}
          {unknownInputsCount ? (
            <Typography sx={{ ml: 0.5 }} variant='subtitle1'>
              {unknownInputsCount} more source
              {unknownInputsCount === 1 ? '' : 's'} unknown
            </Typography>
          ) : null}
          {inputs && inputs?.length > displayedEntitiesNumber ? (
            <EntitiesListModal
              entities={inputs}
              labelFor='Inputs'
              dataEntityName={dataEntityName}
              openBtnEl={
                <AppButton size='medium' color='tertiary' sx={{ my: 0.25 }}>
                  Show All
                </AppButton>
              }
            />
          ) : null}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default OverviewDataConsumerStats;
