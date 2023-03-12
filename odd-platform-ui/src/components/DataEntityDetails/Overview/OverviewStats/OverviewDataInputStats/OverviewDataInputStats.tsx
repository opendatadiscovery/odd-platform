import React from 'react';
import { Link } from 'react-router-dom-v5-compat';
import { DataEntityClassNameEnum, type DataEntityDetails } from 'generated-sources';
import EntityClassItem from 'components/shared/EntityClassItem/EntityClassItem';
import AppButton from 'components/shared/AppButton/AppButton';
import { Grid, Typography } from '@mui/material';
import EntitiesListModal from 'components/shared/EntitiesListModal/EntitiesListModal';
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
          <Typography variant='body1' color='texts.hint'>
            outputs
          </Typography>
        </Grid>
        <Grid item container xs={12} direction='column' alignItems='flex-start'>
          {outputs?.slice(0, displayedEntitiesNumber).map(output => (
            <AppButton
              key={output.id}
              sx={{ my: 0.25 }}
              size='small'
              color='tertiary'
              onClick={() => {}}
            >
              <Link to={dataEntityOverviewPath(output.id)}>
                {output.internalName || output.externalName}
              </Link>
            </AppButton>
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

export default OverviewDataInputStats;
