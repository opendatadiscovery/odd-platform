import React from 'react';
import { type DataSource, Permission } from 'generated-sources';
import { regenerateDataSourceToken } from 'redux/thunks';
import { Button, ConfirmationDialog, CopyButton } from 'components/shared/elements';
import { Typography } from '@mui/material';
import { useAppDispatch } from 'redux/lib/hooks';
import { WithPermissions } from 'components/shared/contexts';
import { Token, TokenContainer } from './DataSourceItemTokenStyles';

interface DataSourceItemProps {
  dataSource: DataSource;
}

const DataSourceItemToken: React.FC<DataSourceItemProps> = ({ dataSource }) => {
  const dispatch = useAppDispatch();

  const [isHidden, setIsHidden] = React.useState<boolean>(true);

  React.useEffect(() => {
    setIsHidden(dataSource.token.value.substring(0, 6) === '******');
  }, [dataSource.token.value]);

  const onTokenRegenerate = React.useCallback(
    () => dispatch(regenerateDataSourceToken({ dataSourceId: dataSource.id })),
    [dataSource]
  );

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
