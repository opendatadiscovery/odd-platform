import React from 'react';
import { Grid, Typography } from '@mui/material';
import { type DataSource, Permission } from 'generated-sources';
import { deleteDataSource } from 'redux/thunks';
import {
  Button,
  AppTooltip,
  ConfirmationDialog,
  LabeledInfoItem,
  DatasourceLogo,
} from 'components/shared/elements';
import { DeleteIcon, EditIcon } from 'components/shared/icons';
import { useAppDispatch } from 'redux/lib/hooks';
import { WithPermissions } from 'components/shared/contexts';
import DataSourceFormDialog from '../DataSourceForm/DataSourceForm';
import DataSourceItemToken from './DataSourceItemToken/DataSourceItemToken';
import * as S from './DataSourceItemStyles';

interface DataSourceItemProps {
  dataSource: DataSource;
}

const DataSourceItem: React.FC<DataSourceItemProps> = ({ dataSource }) => {
  const dispatch = useAppDispatch();

  const onDelete = React.useCallback(
    () => dispatch(deleteDataSource({ dataSourceId: dataSource.id })),
    [dataSource]
  );

  return (
    <S.Container elevation={0}>
      <Grid container alignItems='flex-start'>
        <Grid container justifyContent='space-between' alignItems='center'>
          <Grid container item xs={8} alignItems='center'>
            <DatasourceLogo width={32} padding={1} rounded name={dataSource.oddrn} />
            <Typography variant='h4' title={dataSource.name} ml={1}>
              {dataSource.name}
            </Typography>
          </Grid>
          <S.ActionsContainer item sm={4}>
            <WithPermissions permissionTo={Permission.DATA_SOURCE_UPDATE}>
              <DataSourceFormDialog
                dataSource={dataSource}
                btnCreateEl={
                  <Button
                    text='Edit'
                    buttonType='secondary-m'
                    startIcon={<EditIcon />}
                    sx={{ mr: 1 }}
                  />
                }
              />
            </WithPermissions>
            <WithPermissions permissionTo={Permission.DATA_SOURCE_DELETE}>
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
                  <Button
                    text='Delete'
                    buttonType='secondary-m'
                    startIcon={<DeleteIcon />}
                  />
                }
              />
            </WithPermissions>
          </S.ActionsContainer>
        </Grid>

        <S.DescriptionContainer item container>
          <LabeledInfoItem
            variant='body2'
            inline
            label='ODDRN'
            labelWidth={4}
            valueComponent='div'
          >
            <AppTooltip title={dataSource.oddrn}>{dataSource.oddrn}</AppTooltip>
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
      </Grid>
    </S.Container>
  );
};

export default DataSourceItem;
