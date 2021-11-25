import { Grid, MenuItem, Typography } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Alert } from 'generated-sources';
import cx from 'classnames';
import AlertStatusItem from 'components/shared/AlertStatusItem/AlertStatusItem';
import KebabIcon from 'components/shared/Icons/KebabIcon';
import { dataEntityDetailsPath } from 'lib/paths';
import EntityTypeItem from 'components/shared/EntityTypeItem/EntityTypeItem';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import AppTooltip from 'components/shared/AppTooltip/AppTooltip';
import AppPopover from 'components/shared/AppPopover/AppPopover';
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
      justifyContent="space-between"
      wrap="nowrap"
    >
      <div className={classes.alertName}>
        <Link
          to={
            alert?.dataEntity?.id
              ? dataEntityDetailsPath(alert.dataEntity.id)
              : '#'
          }
        >
          <AppTooltip
            title={() =>
              alert.dataEntity?.internalName ||
              alert.dataEntity?.externalName
            }
          >
            <Typography variant="body1" noWrap>
              {alert.dataEntity?.internalName ||
                alert.dataEntity?.externalName}
            </Typography>
          </AppTooltip>
        </Link>
      </div>
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
      justifyContent="center"
    >
      <AlertStatusItem typeName={alert.status} />
    </Grid>
    <Grid item className={cx(classes.col, classes.colCreatedTime)}>
      <Typography variant="body1">
        {alert.createdAt && format(alert.createdAt, 'd MMM yyyy, HH:MM a')}
      </Typography>
    </Grid>
    <Grid item className={cx(classes.col, classes.colUpdatedBy)}>
      {/* <Typography variant="body1" noWrap> */}
      {/*  {alert.statusUpdatedBy?.owner?.name || */}
      {/*    alert.statusUpdatedBy?.identity.username} */}
      {/* </Typography> */}
    </Grid>
    <Grid item className={cx(classes.col, classes.colUpdatedAt)}>
      <Typography variant="body1">
        {alert.statusUpdatedAt &&
          format(alert.statusUpdatedAt, 'd MMM yyyy, HH:MM a')}
      </Typography>
    </Grid>
    <Grid
      item
      className={cx(classes.col, classes.colActionBtn, classes.optionsBtn)}
    >
      <AppPopover
        renderOpenBtn={({ onClick, ariaDescribedBy }) => (
          <AppIconButton
            ariaDescribedBy={ariaDescribedBy}
            size="medium"
            color="primaryLight"
            icon={<KebabIcon />}
            onClick={onClick}
          />
        )}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 100 }}
      >
        <MenuItem onClick={alertStatusHandler}>
          {alert.status === 'OPEN' ? 'Resolve' : 'Reopen'} alert
        </MenuItem>
      </AppPopover>
    </Grid>
  </Grid>
);

export default withStyles(styles)(AlertItem);
