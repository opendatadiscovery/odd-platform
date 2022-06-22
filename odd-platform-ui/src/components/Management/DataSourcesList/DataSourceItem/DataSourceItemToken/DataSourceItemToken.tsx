import React from 'react';
import { DataSource } from 'generated-sources';
import { regenerateDataSourceToken } from 'redux/thunks';
import { useAppDispatch } from 'lib/redux/hooks';

import ConfirmationDialog from 'components/shared/ConfirmationDialog/ConfirmationDialog';
import { Typography } from '@mui/material';
import AppButton from 'components/shared/AppButton/AppButton';
import CopyButton from 'components/shared/CopyButton/CopyButton';
import { TokenContainer, Token } from './DataSourceItemTokenStyles';

interface DataSourceItemProps {
  dataSource: DataSource;
}

const DataSourceItemToken: React.FC<DataSourceItemProps> = ({
  dataSource,
}) => {
  const dispatch = useAppDispatch();

  const [isHidden, setIsHidden] = React.useState<boolean>(true);

  React.useEffect(() => {
    setIsHidden(dataSource.token.value.substring(0, 6) === '******');
  }, [dataSource.token.value]);

  const onTokenRegenerate = React.useCallback(
    () =>
      dispatch(
        regenerateDataSourceToken({
          dataSourceId: dataSource.id,
        })
      ),
    [dataSource]
  );

  return (
    <TokenContainer>
      <Token $isHidden={isHidden}>{dataSource.token.value}</Token>
      {isHidden ? (
        <ConfirmationDialog
          actionTitle="Are you sure you want to regenerate token for this datasource?"
          actionName="Regenerate"
          actionText={
            <Typography variant="subtitle1">
              Regenerate token for &quot;{dataSource.name}&quot;?
            </Typography>
          }
          onConfirm={onTokenRegenerate}
          actionBtn={
            <AppButton size="medium" color="primaryLight">
              Regenerate
            </AppButton>
          }
        />
      ) : (
        <CopyButton stringToCopy={dataSource.token.value} text="Copy" />
      )}
    </TokenContainer>
  );
};

export default DataSourceItemToken;
