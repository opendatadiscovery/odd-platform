import React, { useState } from 'react';
import { Typography } from '@mui/material';
import { isBefore, subSeconds } from 'date-fns';
import {
  DataSource,
  Token,
  TokenApiUpdateTokenRequest,
} from 'generated-sources';
import ConfirmationDialog from 'components/shared/ConfirmationDialog/ConfirmationDialog';
import AppButton from 'components/shared/AppButton/AppButton';
import * as S from 'components/Management/DataSourcesList/DataSourceItem/DataSourceItemToken/DataSourceItemTokenStyles';

interface DataSourceItemProps {
  dataSource: DataSource;
  updateToken: (params: TokenApiUpdateTokenRequest) => Promise<Token>;
}

const DataSourceItemToken: React.FC<DataSourceItemProps> = ({
  dataSource,
  updateToken,
}) => {
  const [isCopied, setIsCopied] = useState(false);
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

  const onCopy = React.useCallback(
    () =>
      navigator.clipboard
        .writeText(dataSource.token.value)
        .then(() => setIsCopied(true))
        .finally(() =>
          setTimeout(() => {
            setIsCopied(false);
          }, 1500)
        ),
    [dataSource]
  );

  const onTokenRegenerate = React.useCallback(
    () =>
      updateToken({
        tokenId: dataSource.token.id,
        tokenUpdateFormData: {
          ...dataSource.token,
          value: undefined,
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
        <AppButton size="medium" color="primaryLight" onClick={onCopy}>
          {isCopied ? 'Copied' : 'Copy'}
        </AppButton>
      )}
    </S.TokenContainer>
  );
};

export default DataSourceItemToken;
