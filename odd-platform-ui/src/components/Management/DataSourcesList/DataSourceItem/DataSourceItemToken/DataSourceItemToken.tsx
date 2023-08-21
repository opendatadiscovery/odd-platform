import React, { useEffect, type Dispatch, type FC, type SetStateAction } from 'react';
import { Typography } from '@mui/material';
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
            actionTitle='Are you sure you want to regenerate token for this datasource?'
            actionName='Regenerate'
            actionText={
              <Typography variant='subtitle1'>
                Regenerate token for &quot;{dataSource.name}&quot;?
              </Typography>
            }
            onConfirm={onTokenRegenerate}
            actionBtn={<Button text='Regenerate' buttonType='secondary-m' />}
          />
        </WithPermissions>
      ) : (
        <CopyButton stringToCopy={dataSource.token.value} text='Copy' />
      )}
    </TokenContainer>
  );
};

export default DataSourceItemToken;
