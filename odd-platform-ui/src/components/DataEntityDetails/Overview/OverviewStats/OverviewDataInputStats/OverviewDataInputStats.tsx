import React from 'react';
import { DataEntityClassNameEnum, type DataEntityDetails } from 'generated-sources';
import { Button, EntitiesListModal, EntityClassItem } from 'components/shared/elements';
import { Grid, Typography } from '@mui/material';
import { useAppPaths } from 'lib/hooks';

interface OverviewDataInputStatsProps {
  outputs: DataEntityDetails['outputList'];
  unknownOutputsCount: number;
  dataEntityName: string | undefined;
}

const OverviewDataInputStats: React.FC<OverviewDataInputStatsProps> = ({
  outputs,
  unknownOutputsCount,
  dataEntityName,
}) => {
  const displayedEntitiesNumber = 10;
  const { dataEntityOverviewPath } = useAppPaths();

  return (
    <Grid container>
      <Grid item xs={12} sx={{ ml: 0, mb: 1.25 }}>
        <EntityClassItem entityClassName={DataEntityClassNameEnum.INPUT} fullName />
      </Grid>
      <Grid item container xs={6} alignItems='flex-start' alignContent='flex-start'>
        <Grid item container xs={12} alignItems='baseline'>
          <Typography variant='h2' sx={{ mr: 0.5 }}>
            {(outputs?.length || 0) + (unknownOutputsCount || 0)}
          </Typography>
          <Typography variant='h4'>outputs</Typography>
        </Grid>
        <Grid item container xs={12} direction='column' alignItems='flex-start'>
          {outputs?.slice(0, displayedEntitiesNumber).map(output => (
            <Button
              text={output.internalName || output.externalName}
              to={dataEntityOverviewPath(output.id)}
              key={output.id}
              sx={{ my: 0.25 }}
              buttonType='tertiary-m'
            />
          ))}
          {unknownOutputsCount ? (
            <Typography variant='subtitle1' sx={{ ml: 0.5 }}>
              {unknownOutputsCount} more output
              {unknownOutputsCount === 1 ? '' : 's'} unknown
            </Typography>
          ) : null}
          {outputs && outputs?.length > displayedEntitiesNumber ? (
            <EntitiesListModal
              entities={outputs}
              labelFor='Outputs'
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

export default OverviewDataInputStats;
