import React, { useEffect, type Dispatch, type FC, type SetStateAction } from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { type DataSource, Permission } from 'generated-sources';
import { regenerateDataSourceToken } from 'redux/thunks';
import { Button, ConfirmationDialog, CopyButton } from 'components/shared/elements';
import { useAppDispatch } from 'redux/lib/hooks';
import { WithPermissions } from 'components/shared/contexts';
import { Token, TokenContainer } from './DataSourceItemTokenStyles';

interface DataSourceItemProps {
  dataSource: DataSource;
  isHidden: boolean;
  setIsHidden: Dispatch<SetStateAction<boolean>>;
}

const DataSourceItemToken: FC<DataSourceItemProps> = ({
  dataSource,
  setIsHidden,
  isHidden,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    setIsHidden(dataSource.token.value.substring(0, 6) === '******');
  }, [dataSource.token.value]);

  const onTokenRegenerate = () =>
    dispatch(regenerateDataSourceToken({ dataSourceId: dataSource.id }));

  return (
    <TokenContainer>
      <Token $isHidden={isHidden}>{dataSource.token.value}</Token>
      {isHidden ? (
        <WithPermissions permissionTo={Permission.DATA_SOURCE_TOKEN_REGENERATE}>
          <ConfirmationDialog
            actionTitle={t(
              'Are you sure you want to regenerate token for this datasource?'
            )}
            actionName={t('Regenerate')}
            actionText={
              <Typography variant='subtitle1'>
                {t('Regenerate token for')} &quot;{dataSource.name}&quot;?
              </Typography>
            }
            onConfirm={onTokenRegenerate}
            actionBtn={<Button text={t('Regenerate')} buttonType='secondary-m' />}
          />
        </WithPermissions>
      ) : (
        <CopyButton stringToCopy={dataSource.token.value} text={t('Copy')} />
      )}
    </TokenContainer>
  );
};

export default DataSourceItemToken;
