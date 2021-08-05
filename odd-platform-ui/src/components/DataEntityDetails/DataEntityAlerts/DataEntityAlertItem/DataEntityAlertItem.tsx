import React from 'react';
import { Grid, MenuItem, Typography, withStyles } from '@material-ui/core';
import { Alert } from 'generated-sources';
import cx from 'classnames';
import { format } from 'date-fns';
import AlertTypeItem from 'components/shared/AlertTypeItem/AlertTypeItem';
import PopUpMenuByClick from 'components/shared/PopUpMenuByClick/PopUpMenuByClick';
import AppButton from 'components/shared/AppButton/AppButton';
import KebabIcon from 'components/shared/Icons/KebabIcon';
import { styles, StylesType } from './DataEntityAlertItemStyles';

interface DataEntityAlertItemProps extends StylesType {
  alert: Alert;
  alertStatusHandler: () => void;
}

const DataEntityAlertItem: React.FC<DataEntityAlertItemProps> = ({
  classes,
  alert,
  alertStatusHandler,
}) => (
  <Grid container className={classes.container}>
    <Grid item className={cx(classes.col, classes.colDate)}>
      <Typography variant="body1">
        {alert.createdAt && format(alert.createdAt, 'd MMM yyyy, HH:MM a')}
      </Typography>
    </Grid>
    <Grid item className={cx(classes.col, classes.colType)}>
      <Typography variant="body1" title={alert.type} noWrap>
        {alert.type}
      </Typography>
    </Grid>
    <Grid item className={cx(classes.col, classes.colDescription)}>
      <Typography variant="body1" title={alert.description} noWrap>
        {alert.description}
      </Typography>
    </Grid>
    <Grid item className={cx(classes.col, classes.colStatus)}>
      <AlertTypeItem typeName={alert.status} />
    </Grid>
    <Grid item className={cx(classes.col, classes.colUpdatedBy)}>
      <Typography variant="body1">
        {alert.statusUpdatedBy?.owner?.name ||
          alert.statusUpdatedBy?.identity.username}
      </Typography>
    </Grid>
    <Grid item className={cx(classes.col, classes.colUpdatedTime)}>
      <Typography variant="body1">
        {alert.statusUpdatedAt &&
          format(alert.statusUpdatedAt, 'd MMM yyyy, HH:MM a')}
      </Typography>
    </Grid>
    <Grid item className={cx(classes.col, classes.colActionBtn)}>
      <PopUpMenuByClick
        renderOpeningContent={({ toggleOpen }) => (
          <AppButton
            className={classes.optionsBtn}
            size="medium"
            color="primaryLight"
            icon={<KebabIcon />}
            onClick={toggleOpen}
          />
        )}
        renderChildren={({ handleClose }) => (
          <MenuItem onClick={alertStatusHandler}>
            {alert.status === 'OPEN' ? 'Resolve' : 'Reopen'} alert
          </MenuItem>
        )}
      />
    </Grid>
  </Grid>
);

export default withStyles(styles)(DataEntityAlertItem);
