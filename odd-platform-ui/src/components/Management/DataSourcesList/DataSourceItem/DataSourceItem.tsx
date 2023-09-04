import React, { type FC, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { type DataSource, Permission } from 'generated-sources';
import { deleteDataSource } from 'redux/thunks';
import {
  AppTooltip,
  Button,
  ConfirmationDialog,
  DatasourceLogo,
  InfoItem,
  LabeledInfoItem,
} from 'components/shared/elements';
import { AlertIcon, DeleteIcon, EditIcon } from 'components/shared/icons';
import { useAppDispatch } from 'redux/lib/hooks';
import { WithPermissions } from 'components/shared/contexts';
import DataSourceFormDialog from '../DataSourceForm/DataSourceForm';
import DataSourceItemToken from './DataSourceItemToken/DataSourceItemToken';
import * as S from './DataSourceItemStyles';

interface DataSourceItemProps {
  dataSource: DataSource;
}

const DataSourceItem: FC<DataSourceItemProps> = ({ dataSource }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [isHidden, setIsHidden] = useState(true);

  const onDelete = () => dispatch(deleteDataSource({ dataSourceId: dataSource.id }));

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
          <S.Actions>
            <WithPermissions permissionTo={Permission.DATA_SOURCE_UPDATE}>
              <DataSourceFormDialog
                dataSource={dataSource}
                btnCreateEl={
                  <Button
                    text={t('Edit')}
                    buttonType='secondary-m'
                    startIcon={<EditIcon />}
                    sx={{ mr: 1 }}
                  />
                }
              />
            </WithPermissions>
            <WithPermissions permissionTo={Permission.DATA_SOURCE_DELETE}>
              <ConfirmationDialog
                actionTitle={t('Are you sure you want to delete this datasource?')}
                actionName={t('Delete')}
                actionText={
                  <Typography variant='subtitle1'>
                    {t('Delete')} &quot;{dataSource.name}&quot; {t('datasource')}?
                  </Typography>
                }
                onConfirm={onDelete}
                actionBtn={
                  <Button
                    text={t('Delete')}
                    buttonType='secondary-m'
                    startIcon={<DeleteIcon />}
                  />
                }
              />
            </WithPermissions>
          </S.Actions>
        </Grid>

        <S.Description>
          <LabeledInfoItem
            variant='body2'
            inline
            label='ODDRN'
            labelWidth={4}
            valueComponent='div'
          >
            <AppTooltip title={dataSource.oddrn}>{dataSource.oddrn}</AppTooltip>
          </LabeledInfoItem>
          <LabeledInfoItem variant='body2' inline label={t('Description')} labelWidth={4}>
            {dataSource.description}
          </LabeledInfoItem>
          <LabeledInfoItem variant='body2' inline label={t('Namespace')} labelWidth={4}>
            {dataSource.namespace?.name}
          </LabeledInfoItem>
          {dataSource.token?.value && (
            <LabeledInfoItem
              variant='body2'
              inline
              label={t('Token')}
              labelWidth={4}
              valueSx={{ ml: 0 }}
            >
              <DataSourceItemToken
                dataSource={dataSource}
                isHidden={isHidden}
                setIsHidden={setIsHidden}
              />
            </LabeledInfoItem>
          )}
          {!isHidden && (
            <InfoItem
              sx={{ p: 1, backgroundColor: 'warning.light', borderRadius: 1 }}
              labelWidth={0.4}
              label={<AlertIcon fill='#E59900' width={24} height={24} />}
              info={
                <Typography variant='body1'>
                  Save token in a secure location. You will not be able to retrieve it
                  again.
                </Typography>
              }
            />
          )}
        </S.Description>
      </Grid>
    </S.Container>
  );
};

export default DataSourceItem;
