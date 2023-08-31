import React, { type Dispatch, type FC, type SetStateAction, useEffect } from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { type Collector, Permission } from 'generated-sources';
import { regenerateCollectorToken } from 'redux/thunks';
import { Button, ConfirmationDialog, CopyButton } from 'components/shared/elements';
import { useAppDispatch } from 'redux/lib/hooks';
import { WithPermissions } from 'components/shared/contexts';
import { Token, TokenContainer } from './CollectorItemTokenStyles';

interface CollectorItemProps {
  collector: Collector;
  isHidden: boolean;
  setIsHidden: Dispatch<SetStateAction<boolean>>;
}

const CollectorItemToken: FC<CollectorItemProps> = ({
  collector,
  setIsHidden,
  isHidden,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    setIsHidden(collector.token.value.substring(0, 6) === '******');
  }, [collector.token.value]);

  const onTokenRegenerate = () =>
    dispatch(regenerateCollectorToken({ collectorId: collector.id }));

  return (
    <TokenContainer>
      <Token $isHidden={isHidden}>{collector.token.value}</Token>
      {isHidden ? (
        <WithPermissions permissionTo={Permission.COLLECTOR_TOKEN_REGENERATE}>
          <ConfirmationDialog
            actionTitle={t(
              'Are you sure you want to regenerate token for this collector?'
            )}
            actionName={t('Regenerate')}
            actionText={
              <Typography variant='subtitle1'>
                {t('Regenerate token for')} &quot;{collector.name}&quot;?
              </Typography>
            }
            onConfirm={onTokenRegenerate}
            actionBtn={<Button text={t('Regenerate')} buttonType='secondary-m' />}
          />
        </WithPermissions>
      ) : (
        <CopyButton stringToCopy={collector.token.value} text={t('Copy')} />
      )}
    </TokenContainer>
  );
};

export default CollectorItemToken;
