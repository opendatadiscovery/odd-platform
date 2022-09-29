import React from 'react';
import { Grid, Typography } from '@mui/material';
import { addSeconds, formatDistanceToNowStrict } from 'date-fns';
import { DataSource } from 'generated-sources';
import { deleteDataSource } from 'redux/thunks';
import {
  LabeledInfoItem,
  ConfirmationDialog,
  BooleanFormatted,
  AppButton,
  AppTooltip,
} from 'components/shared';
import { EditIcon, DeleteIcon } from 'components/shared/Icons';
import { usePermissions } from 'lib/hooks';
import { useAppDispatch } from 'redux/lib/hooks';
import DataSourceFormDialog from '../DataSourceForm/DataSourceForm';
import DataSourceItemToken from './DataSourceItemToken/DataSourceItemToken';
import * as S from './DataSourceItemStyles';

interface DataSourceItemProps {
  dataSource: DataSource;
}

const DataSourceItem: React.FC<DataSourceItemProps> = ({ dataSource }) => {
  const dispatch = useAppDispatch();
  const { isAdmin } = usePermissions({});

  const onDelete = React.useCallback(
    () => dispatch(deleteDataSource({ dataSourceId: dataSource.id })),
    [dataSource]
  );

  return (
    <S.Container elevation={0}>
      <Grid container alignItems='flex-start' spacing={2}>
        <Grid item xs={8}>
          <Typography variant='h4' title={dataSource.name}>
            {dataSource.name}
          </Typography>
        </Grid>
        <S.ActionsContainer item sm={4}>
          <DataSourceFormDialog
            dataSource={dataSource}
            btnCreateEl={
              <AppButton
                size='medium'
                color='primaryLight'
                startIcon={<EditIcon />}
                sx={{ mr: 1 }}
                disabled={!isAdmin}
              >
                Edit
              </AppButton>
            }
          />
          <ConfirmationDialog
            actionTitle='Are you sure you want to delete this datasource?'
            actionName='Delete'
            actionText={
              <Typography variant='subtitle1'>
                Delete &quot;{dataSource.name}&quot; datasource?
              </Typography>
            }
            onConfirm={onDelete}
            actionBtn={
              <AppButton
                size='medium'
                color='primaryLight'
                startIcon={<DeleteIcon />}
                disabled={!isAdmin}
              >
                Delete
              </AppButton>
            }
          />
        </S.ActionsContainer>
        <S.DescriptionContainer item sm={6} container>
          <LabeledInfoItem
            variant='body2'
            inline
            label='ODDRN'
            labelWidth={4}
            valueComponent='div'
          >
            <AppTooltip title={() => dataSource.oddrn}>{dataSource.oddrn}</AppTooltip>
          </LabeledInfoItem>
          <LabeledInfoItem variant='body2' inline label='Description' labelWidth={4}>
            {dataSource.description}
          </LabeledInfoItem>
          <LabeledInfoItem variant='body2' inline label='Namespace' labelWidth={4}>
            {dataSource.namespace?.name}
          </LabeledInfoItem>
          {dataSource.token?.value && (
            <LabeledInfoItem
              variant='body2'
              inline
              label='Token'
              labelWidth={4}
              valueSx={{ ml: 0 }}
            >
              <DataSourceItemToken dataSource={dataSource} />
            </LabeledInfoItem>
          )}
        </S.DescriptionContainer>

        <S.DescriptionContainer item sm={6} container>
          <LabeledInfoItem
            variant='body2'
            inline
            label='Receive Data'
            valueColor={dataSource.active ? 'green' : ''}
            labelWidth={4}
          >
            <BooleanFormatted value={dataSource.active} />
          </LabeledInfoItem>
          <LabeledInfoItem variant='body2' inline label='Pulling Interval' labelWidth={4}>
            {dataSource.active && dataSource.pullingInterval
              ? formatDistanceToNowStrict(
                  addSeconds(Date.now(), dataSource.pullingInterval)
                )
              : null}
          </LabeledInfoItem>
          <LabeledInfoItem variant='body2' inline label='Connection Url' labelWidth={4}>
            {dataSource.connectionUrl}
          </LabeledInfoItem>
        </S.DescriptionContainer>
      </Grid>
    </S.Container>
  );
};

export default DataSourceItem;
