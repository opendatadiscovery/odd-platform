import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import { addSeconds, formatDistanceToNowStrict } from 'date-fns';
import {
  DataSource,
  DataSourceApiDeleteDataSourceRequest,
} from 'generated-sources';
import cx from 'classnames';
import LabeledInfoItem from 'components/shared/LabeledInfoItem/LabeledInfoItem';
import ConfirmationDialog from 'components/shared/ConfirmationDialog/ConfirmationDialog';
import BooleanFormatted from 'components/shared/BooleanFormatted/BooleanFormatted';
import EditIcon from 'components/shared/Icons/EditIcon';
import DeleteIcon from 'components/shared/Icons/DeleteIcon';
import DataSourceFormDialogContainer from 'components/Management/DataSourcesList/DataSourceFormDialog/DataSourceFormDialogContainer';
import AppButton2 from 'components/shared/AppButton2/AppButton2';
import { styles, StylesType } from './DataSourceItemStyles';

interface DataSourceItemProps extends StylesType {
  dataSource: DataSource;
  deleteDataSource: (
    params: DataSourceApiDeleteDataSourceRequest
  ) => Promise<void>;
}

const DataSourceItem: React.FC<DataSourceItemProps> = ({
  classes,
  dataSource,
  deleteDataSource,
}) => {
  const onDelete = React.useCallback(
    () => deleteDataSource({ dataSourceId: dataSource.id }),
    [dataSource]
  );

  return (
    <Paper elevation={0} className={classes.container}>
      <Grid container alignItems="flex-start" spacing={2}>
        <Grid item xs={8} className={classes.nameContainer}>
          <Typography variant="h4" title={dataSource.name}>
            {dataSource.name}
          </Typography>
        </Grid>
        <Grid item sm={4} className={classes.actionsContainer}>
          <DataSourceFormDialogContainer
            dataSource={dataSource}
            btnCreateEl={
              <AppButton2
                size="medium"
                color="primaryLight"
                startIcon={<EditIcon />}
                sx={{ mr: 1 }}
              >
                Edit
              </AppButton2>
            }
          />
          <ConfirmationDialog
            actionTitle="Are you sure you want to delete this datasource?"
            actionName="Delete"
            actionText={
              <Typography variant="subtitle1">
                Delete &quot;{dataSource.name}&quot; datasource?
              </Typography>
            }
            onConfirm={onDelete}
            actionBtn={
              <AppButton2
                size="medium"
                color="primaryLight"
                startIcon={<DeleteIcon />}
              >
                Delete
              </AppButton2>
            }
          />
        </Grid>
        <Grid
          item
          sm={6}
          container
          className={classes.descriptionContainer}
        >
          <LabeledInfoItem
            variant="body2"
            inline
            label="ODDRN"
            labelWidth={4}
          >
            {dataSource.oddrn}
          </LabeledInfoItem>
          <LabeledInfoItem
            variant="body2"
            inline
            label="Description"
            labelWidth={4}
          >
            {dataSource.description}
          </LabeledInfoItem>
          <LabeledInfoItem
            variant="body2"
            inline
            label="Namespace"
            labelWidth={4}
          >
            {dataSource.namespace?.name}
          </LabeledInfoItem>
        </Grid>

        <Grid
          item
          sm={6}
          container
          className={classes.descriptionContainer}
        >
          <LabeledInfoItem
            variant="body2"
            inline
            label="Receive Data"
            classes={{
              value: cx({ [classes.pullingValue]: dataSource.active }),
            }}
            labelWidth={4}
          >
            <BooleanFormatted value={dataSource.active} />
          </LabeledInfoItem>
          <LabeledInfoItem
            variant="body2"
            inline
            label="Pulling Interval"
            labelWidth={4}
          >
            {dataSource.active && dataSource.pullingInterval
              ? formatDistanceToNowStrict(
                  addSeconds(Date.now(), dataSource.pullingInterval)
                )
              : null}
          </LabeledInfoItem>
          <LabeledInfoItem
            variant="body2"
            inline
            label="Connection Url"
            labelWidth={4}
          >
            {dataSource.connectionUrl}
          </LabeledInfoItem>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default withStyles(styles)(DataSourceItem);
