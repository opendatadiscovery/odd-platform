import React from 'react';
import { DataSource } from 'generated-sources';
import { regenerateDataSourceToken } from 'redux/thunks';
import { ConfirmationDialog, AppButton, CopyButton } from 'components/shared';
import { Typography } from '@mui/material';
import { usePermissions } from 'lib/hooks';
import { useAppDispatch } from 'redux/lib/hooks';
import { TokenContainer, Token } from './DataSourceItemTokenStyles';

interface DataSourceItemProps {
  dataSource: DataSource;
}

const DataSourceItemToken: React.FC<DataSourceItemProps> = ({ dataSource }) => {
  const dispatch = useAppDispatch();
  const { isAdmin } = usePermissions({});

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
        <ConfirmationDialog
          actionTitle='Are you sure you want to regenerate token for this datasource?'
          actionName='Regenerate'
          actionText={
            <Typography variant='subtitle1'>
              Regenerate token for &quot;{dataSource.name}&quot;?
            </Typography>
          }
          onConfirm={onTokenRegenerate}
          actionBtn={
            <AppButton size='medium' color='primaryLight' disabled={!isAdmin}>
              Regenerate
            </AppButton>
          }
        />
      ) : (
        <CopyButton stringToCopy={dataSource.token.value} text='Copy' />
      )}
    </TokenContainer>
  );
};

export default DataSourceItemToken;
