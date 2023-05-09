import React from 'react';
import { DataEntityClassNameEnum, type DataEntityDetails } from 'generated-sources';
import { Grid, Typography } from '@mui/material';
import { EntitiesListModal, Button, EntityClassItem } from 'components/shared/elements';
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
  const { dataEntityOverviewPath } = useAppPaths();

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
          <Typography sx={{ ml: 0.5 }} variant='h4'>
            inputs
          </Typography>
        </Grid>
        <Grid item container xs={12} direction='column' alignItems='flex-start'>
          {inputs?.slice(0, displayedEntitiesNumber).map(input => (
            <Button
              text={input.internalName || input.externalName}
              to={dataEntityOverviewPath(input.id)}
              key={input.id}
              sx={{ my: 0.25 }}
              buttonType='tertiary-m'
              onClick={() => {}}
            />
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
                <Button text='Show All' buttonType='tertiary-m' sx={{ my: 0.25 }} />
              }
            />
          ) : null}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default OverviewDataConsumerStats;
