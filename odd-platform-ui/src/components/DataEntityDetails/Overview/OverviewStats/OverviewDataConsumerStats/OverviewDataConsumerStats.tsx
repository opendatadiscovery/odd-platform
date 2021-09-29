import React from 'react';
import { Grid, Typography, withStyles } from '@material-ui/core';
import { Link } from 'react-router-dom';
import {
  DataEntityDetails,
  DataEntityTypeNameEnum,
} from 'generated-sources';
import { dataEntityDetailsPath } from 'lib/paths';
import EntityTypeItem from 'components/shared/EntityTypeItem/EntityTypeItem';
import AppButton from 'components/shared/AppButton/AppButton';
import { styles, StylesType } from './OverviewDataConsumerStatsStyles';

interface OverviewDataConsumerStatsProps extends StylesType {
  inputs: DataEntityDetails['inputList'];
}

const OverviewDataConsumerStats: React.FC<OverviewDataConsumerStatsProps> = ({
  classes,
  inputs,
}) => (
  <Grid container>
    <Grid item xs={12} className={classes.typeLabel}>
      <EntityTypeItem
        typeName={DataEntityTypeNameEnum.CONSUMER}
        fullName
      />
    </Grid>
    <Grid item container xs={6} className={classes.statsItem}>
      <Grid item container xs={12} alignItems="baseline">
        <Typography variant="h2" className={classes.statCount}>
          {inputs?.length || 0}
        </Typography>
        <Typography variant="body1" className={classes.statLabel}>
          inputs
        </Typography>
      </Grid>
      <Grid
        item
        container
        xs={12}
        direction="column"
        alignItems="flex-start"
      >
        {inputs?.map(input => (
          <AppButton
            key={input.id}
            className={classes.refItem}
            size="small"
            color="tertiary"
            onClick={() => {}}
          >
            <Link to={dataEntityDetailsPath(input.id)}>
              {input.internalName || input.externalName}
            </Link>
          </AppButton>
        ))}
      </Grid>
    </Grid>
  </Grid>
);

export default withStyles(styles)(OverviewDataConsumerStats);
