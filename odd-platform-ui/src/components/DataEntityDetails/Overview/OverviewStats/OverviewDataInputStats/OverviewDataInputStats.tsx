import React from 'react';
import { Link } from 'react-router-dom';
import {
  DataEntityDetails,
  DataEntityTypeNameEnum,
} from 'generated-sources';
import { dataEntityDetailsPath } from 'lib/paths';
import EntityTypeItem from 'components/shared/EntityTypeItem/EntityTypeItem';
import AppButton from 'components/shared/AppButton/AppButton';
import { Grid, Typography } from '@mui/material';
import EntitiesListModal from 'components/shared/EntitiesListModal/EntitiesListModal';

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

  return (
    <Grid container>
      <Grid item xs={12} sx={{ ml: 0, mb: 1.25 }}>
        <EntityTypeItem typeName={DataEntityTypeNameEnum.INPUT} fullName />
      </Grid>
      <Grid
        item
        container
        xs={6}
        alignItems="flex-start"
        alignContent="flex-start"
      >
        <Grid item container xs={12} alignItems="baseline">
          <Typography variant="h2" sx={{ mr: 0.5 }}>
            {(outputs?.length || 0) + (unknownOutputsCount || 0)}
          </Typography>
          <Typography variant="body1" color="texts.hint">
            outputs
          </Typography>
        </Grid>
        <Grid
          item
          container
          xs={12}
          direction="column"
          alignItems="flex-start"
        >
          {outputs?.slice(0, displayedEntitiesNumber).map(output => (
            <AppButton
              key={output.id}
              sx={{ my: 0.25 }}
              size="small"
              color="tertiary"
              onClick={() => {}}
            >
              <Link to={dataEntityDetailsPath(output.id)}>
                {output.internalName || output.externalName}
              </Link>
            </AppButton>
          ))}
          {unknownOutputsCount ? (
            <Typography variant="subtitle1" sx={{ ml: 0.5 }}>
              {unknownOutputsCount} more output
              {unknownOutputsCount === 1 ? '' : 's'} unknown
            </Typography>
          ) : null}
          {outputs && outputs?.length > displayedEntitiesNumber ? (
            <EntitiesListModal
              entities={outputs}
              labelFor="Outputs"
              dataEntityName={dataEntityName}
              openBtnEl={
                <AppButton
                  size="medium"
                  color="tertiary"
                  sx={{ my: 0.25 }}
                >
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
