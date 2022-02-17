import React from 'react';
import { Grid, Typography } from '@mui/material';
import { addSeconds, formatDistanceToNowStrict } from 'date-fns';
import {
  DataSource,
  DataSourceApiDeleteDataSourceRequest,
} from 'generated-sources';
import LabeledInfoItem from 'components/shared/LabeledInfoItem/LabeledInfoItem';
import ConfirmationDialog from 'components/shared/ConfirmationDialog/ConfirmationDialog';
import BooleanFormatted from 'components/shared/BooleanFormatted/BooleanFormatted';
import EditIcon from 'components/shared/Icons/EditIcon';
import DeleteIcon from 'components/shared/Icons/DeleteIcon';
import AppButton from 'components/shared/AppButton/AppButton';
import DataSourceFormDialogContainer from 'components/Management/DataSourcesList/DataSourceForm/DataSourceFormContainer';
import DataSourceItemTokenContainer from './DataSourceItemToken/DataSourceItemTokenContainer';
import * as S from './DataSourceItemStyles';

interface DataSourceItemProps {
  dataSource: DataSource;
  deleteDataSource: (
    params: DataSourceApiDeleteDataSourceRequest
  ) => Promise<void>;
}

const DataSourceItem: React.FC<DataSourceItemProps> = ({
  dataSource,
  deleteDataSource,
}) => {
  const onDelete = React.useCallback(
    () => deleteDataSource({ dataSourceId: dataSource.id }),
    [dataSource]
  );

  return (
    <S.Container elevation={0}>
      <Grid container alignItems="flex-start" spacing={2}>
        <Grid item xs={8}>
          <Typography variant="h4" title={dataSource.name}>
            {dataSource.name}
          </Typography>
        </Grid>
        <S.ActionsContainer item sm={4}>
          <DataSourceFormDialogContainer
            dataSource={dataSource}
            btnCreateEl={
              <AppButton
                size="medium"
                color="primaryLight"
                startIcon={<EditIcon />}
                sx={{ mr: 1 }}
              >
                Edit
              </AppButton>
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
              <AppButton
                size="medium"
                color="primaryLight"
                startIcon={<DeleteIcon />}
              >
                Delete
              </AppButton>
            }
          />
        </S.ActionsContainer>
        <S.DescriptionContainer item sm={6} container>
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
          <LabeledInfoItem
            variant="body2"
            inline
            label="Token"
            labelWidth={4}
          >
            <DataSourceItemTokenContainer dataSource={dataSource} />
          </LabeledInfoItem>
        </S.DescriptionContainer>

        <S.DescriptionContainer item sm={6} container>
          <LabeledInfoItem
            variant="body2"
            inline
            label="Receive Data"
            valueColor={dataSource.active ? 'green' : ''}
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
        </S.DescriptionContainer>
      </Grid>
    </S.Container>
  );
};

export default DataSourceItem;
