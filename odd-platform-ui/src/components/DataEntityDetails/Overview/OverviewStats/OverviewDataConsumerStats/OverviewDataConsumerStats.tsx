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
import { StatLabel } from './OverviewDataConsumerStatsStyles';

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

  return (
    <Grid container>
      <Grid sx={{ ml: 0, mb: 1.25 }} item xs={12}>
        <EntityTypeItem
          typeName={DataEntityTypeNameEnum.CONSUMER}
          fullName
        />
      </Grid>
      <Grid
        item
        container
        xs={6}
        alignItems="flex-start"
        alignContent="flex-start"
      >
        <Grid item container xs={12} alignItems="baseline">
          <Typography variant="h2">
            {(inputs?.length || 0) + (unknownInputsCount || 0)}
          </Typography>
          <StatLabel sx={{ ml: 0.5 }} variant="body1">
            inputs
          </StatLabel>
        </Grid>
        <Grid
          item
          container
          xs={12}
          direction="column"
          alignItems="flex-start"
        >
          {inputs?.slice(0, displayedEntitiesNumber).map(input => (
            <AppButton
              key={input.id}
              sx={{ my: 0.25 }}
              size="small"
              color="tertiary"
              onClick={() => {}}
            >
              <Link to={dataEntityDetailsPath(input.id)}>
                {input.internalName || input.externalName}
              </Link>
            </AppButton>
          ))}
          {unknownInputsCount ? (
            <Typography sx={{ ml: 0.5 }} variant="subtitle1">
              {unknownInputsCount} more source
              {unknownInputsCount === 1 ? '' : 's'} unknown
            </Typography>
          ) : null}
          {inputs && inputs?.length > displayedEntitiesNumber ? (
            <EntitiesListModal
              entities={inputs}
              labelFor="Inputs"
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

export default OverviewDataConsumerStats;
