import { Grid, MenuItem, Typography, withStyles } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Alert } from 'generated-sources';
import cx from 'classnames';
import AlertStatusItem from 'components/shared/AlertStatusItem/AlertStatusItem';
import AppButton from 'components/shared/AppButton/AppButton';
import KebabIcon from 'components/shared/Icons/KebabIcon';
import { dataEntityDetailsPath } from 'lib/paths';
import EntityTypeItem from 'components/shared/EntityTypeItem/EntityTypeItem';
import Tooltip from 'components/shared/Tooltip/Tooltip';
import { styles, StylesType } from './AlertItemStyles';

interface AlertItemProps extends StylesType {
  alert: Alert;
  alertStatusHandler: () => void;
}

const AlertItem: React.FC<AlertItemProps> = ({
  classes,
  alert,
  alertStatusHandler,
}) => (
  <Grid container className={classes.container}>
    <Grid
      item
      container
      className={cx(classes.col, classes.colName)}
      justify="space-between"
    >
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
    <Grid item className={cx(classes.col, classes.colDescription)}>
      <Typography variant="body1" title={alert.type} noWrap>
        {alert.description}
      </Typography>
    </Grid>
    <Grid
      item
      container
      className={cx(classes.col, classes.colStatus)}
      justify="center"
    >
      <AlertStatusItem typeName={alert.status} />
    </Grid>
    <Grid item className={cx(classes.col, classes.colCreatedTime)}>
      <Typography variant="body1">
        {alert.createdAt && format(alert.createdAt, 'd MMM yyyy, HH:MM a')}
      </Typography>
    </Grid>
    <Grid item className={cx(classes.col, classes.colUpdatedBy)}>
      <Typography variant="body1" noWrap>
        {alert.statusUpdatedBy?.owner?.name ||
          alert.statusUpdatedBy?.identity.username}
      </Typography>
    </Grid>
    <Grid item className={cx(classes.col, classes.colUpdatedAt)}>
      <Typography variant="body1">
        {alert.statusUpdatedAt &&
          format(alert.statusUpdatedAt, 'd MMM yyyy, HH:MM a')}
      </Typography>
    </Grid>
    <Grid item className={cx(classes.col, classes.colActionBtn)}>
      <Tooltip
        tooltipControl="byClick"
        tooltipContent={
          <MenuItem onClick={alertStatusHandler}>
            {alert.status === 'OPEN' ? 'Resolve' : 'Reopen'} alert
          </MenuItem>
        }
        place="bottom"
        type="light"
      >
        <AppButton
          className={classes.optionsBtn}
          size="medium"
          color="primaryLight"
          icon={<KebabIcon />}
        />
      </Tooltip>
    </Grid>
  </Grid>
);

export default withStyles(styles)(AlertItem);
