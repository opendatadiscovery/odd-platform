import { Grid, Typography, withStyles } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Alert } from 'generated-sources';
import { dataEntityDetailsPath } from 'lib/paths';
import EntityTypeItem from 'components/shared/EntityTypeItem/EntityTypeItem';
import { styles, StylesType } from './AlertItemStyles';

interface AlertItemProps extends StylesType {
  alert: Alert;
}

const AlertItem: React.FC<AlertItemProps> = ({ classes, alert }) => (
  <Grid container className={classes.container} wrap="nowrap" spacing={2}>
    <Grid item xs={3} container wrap="nowrap" justify="space-between">
      <Link
        to={
          alert?.dataEntity?.id
            ? dataEntityDetailsPath(alert.dataEntity.id)
            : '#'
        }
      >
        <Typography
          variant="body1"
          noWrap
          title={
            alert.dataEntity?.internalName ||
            alert.dataEntity?.externalName
          }
        >
          {alert.dataEntity?.internalName ||
            alert.dataEntity?.externalName}
        </Typography>
      </Link>
      <div className={classes.typesList}>
        {alert.dataEntity?.types?.map(type => (
          <EntityTypeItem key={type.id} typeName={type.name} />
        ))}
      </div>
    </Grid>
    <Grid item xs={7} container wrap="nowrap">
      <Typography variant="body1" noWrap>
        {alert.description}
      </Typography>
    </Grid>
    <Grid item xs={2} container wrap="nowrap">
      <Typography variant="body1" noWrap>
        {alert.createdAt
          ? format(alert.createdAt, 'd MMM yyyy, hh:mm a')
          : null}
      </Typography>
    </Grid>
  </Grid>
);

export default withStyles(styles)(AlertItem);
