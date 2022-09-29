import React from 'react';
import { Collector } from 'generated-sources';
import { regenerateCollectorToken } from 'redux/thunks';
import { ConfirmationDialog, AppButton, CopyButton } from 'components/shared';
import { Typography } from '@mui/material';
import { usePermissions } from 'lib/hooks';
import { useAppDispatch } from 'redux/lib/hooks';
import { TokenContainer, Token } from './CollectorItemTokenStyles';

interface CollectorItemProps {
  collector: Collector;
}

const CollectorItemToken: React.FC<CollectorItemProps> = ({ collector }) => {
  const dispatch = useAppDispatch();
  const { isAdmin } = usePermissions({});

  const [isHidden, setIsHidden] = React.useState<boolean>(true);

  React.useEffect(() => {
    setIsHidden(collector.token.value.substring(0, 6) === '******');
  }, [collector.token.value]);

  const onTokenRegenerate = React.useCallback(
    () =>
      dispatch(
        regenerateCollectorToken({
          collectorId: collector.id,
        })
      ),
    [collector]
  );

  return (
    <TokenContainer>
      <Token $isHidden={isHidden}>{collector.token.value}</Token>
      {isHidden ? (
        <ConfirmationDialog
          actionTitle='Are you sure you want to regenerate token for this collector?'
          actionName='Regenerate'
          actionText={
            <Typography variant='subtitle1'>
              Regenerate token for &quot;{collector.name}&quot;?
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
        <CopyButton stringToCopy={collector.token.value} text='Copy' />
      )}
    </TokenContainer>
  );
};

export default CollectorItemToken;
