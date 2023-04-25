import React from 'react';
import { type Collector, Permission } from 'generated-sources';
import { regenerateCollectorToken } from 'redux/thunks';
import { Button, ConfirmationDialog, CopyButton } from 'components/shared/elements';
import { Typography } from '@mui/material';
import { useAppDispatch } from 'redux/lib/hooks';
import { WithPermissions } from 'components/shared/contexts';
import { Token, TokenContainer } from './CollectorItemTokenStyles';

interface CollectorItemProps {
  collector: Collector;
}

const CollectorItemToken: React.FC<CollectorItemProps> = ({ collector }) => {
  const dispatch = useAppDispatch();

  const [isHidden, setIsHidden] = React.useState(true);

  React.useEffect(() => {
    setIsHidden(collector.token.value.substring(0, 6) === '******');
  }, [collector.token.value]);

  const onTokenRegenerate = React.useCallback(
    () => dispatch(regenerateCollectorToken({ collectorId: collector.id })),
    [collector]
  );

  return (
    <TokenContainer>
      <Token $isHidden={isHidden}>{collector.token.value}</Token>
      {isHidden ? (
        <WithPermissions permissionTo={Permission.COLLECTOR_TOKEN_REGENERATE}>
          <ConfirmationDialog
            actionTitle='Are you sure you want to regenerate token for this collector?'
            actionName='Regenerate'
            actionText={
              <Typography variant='subtitle1'>
                Regenerate token for &quot;{collector.name}&quot;?
              </Typography>
            }
            onConfirm={onTokenRegenerate}
            actionBtn={<Button text='Regenerate' buttonType='secondary-m' />}
          />
        </WithPermissions>
      ) : (
        <CopyButton stringToCopy={collector.token.value} text='Copy' />
      )}
    </TokenContainer>
  );
};

export default CollectorItemToken;
