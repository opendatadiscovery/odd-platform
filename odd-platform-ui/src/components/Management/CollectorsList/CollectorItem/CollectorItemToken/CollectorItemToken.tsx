import React from 'react';
import { Collector, Permission } from 'generated-sources';
import { regenerateCollectorToken } from 'redux/thunks';
import { AppButton, ConfirmationDialog, CopyButton } from 'components/shared';
import { Typography } from '@mui/material';
import { usePermissions } from 'lib/hooks';
import { useAppDispatch } from 'redux/lib/hooks';
import { Token, TokenContainer } from './CollectorItemTokenStyles';

interface CollectorItemProps {
  collector: Collector;
}

const CollectorItemToken: React.FC<CollectorItemProps> = ({ collector }) => {
  const dispatch = useAppDispatch();
  const { hasAccessTo } = usePermissions({});

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
            <AppButton
              size='medium'
              color='primaryLight'
              disabled={!hasAccessTo(Permission.COLLECTOR_TOKEN_REGENERATE)}
            >
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
