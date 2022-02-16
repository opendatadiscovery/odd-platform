import React, { useState } from 'react';
import { isBefore, subSeconds } from 'date-fns';
import {
  DataSource,
  DataSourceApiUpdateDataSourceRequest,
} from 'generated-sources';
import * as S from 'components/Management/DataSourcesList/DataSourceItem/DataSourceItemToken/DataSourceItemTokenStyles';
import ConfirmationDialog from 'components/shared/ConfirmationDialog/ConfirmationDialog';
import { Typography } from '@mui/material';
import AppButton from 'components/shared/AppButton/AppButton';
import CopyButton from 'components/shared/CopyButton/CopyButton';

interface DataSourceItemProps {
  dataSource: DataSource;
  updateDataSource: (
    params: DataSourceApiUpdateDataSourceRequest
  ) => Promise<DataSource>;
}

const DataSourceItemToken: React.FC<DataSourceItemProps> = ({
  dataSource,
  updateDataSource,
}) => {
  const [isHidden, setIsHidden] = useState(
    isBefore(dataSource.token.updatedAt, subSeconds(new Date(), 1))
  );

  React.useEffect(() => {
    const { updatedAt } = dataSource.token;
    const updatedAtUTC = new Date(
      updatedAt.getUTCFullYear(),
      updatedAt.getUTCMonth(),
      updatedAt.getUTCDate(),
      updatedAt.getUTCHours(),
      updatedAt.getUTCMinutes(),
      updatedAt.getUTCSeconds()
    );
    setIsHidden(isBefore(updatedAtUTC, subSeconds(new Date(), 1)));
  }, [dataSource]);

  const onTokenRegenerate = React.useCallback(
    () =>
      updateDataSource({
        dataSourceId: dataSource.id,
        dataSourceUpdateFormData: {
          ...dataSource,
          token: {
            ...dataSource.token,
            value: 'null',
          },
        },
      }),
    [dataSource]
  );

  return (
    <S.TokenContainer>
      <S.Token isHidden={isHidden}>{dataSource.token.value}</S.Token>
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
    </S.TokenContainer>
  );
};

export default DataSourceItemToken;
