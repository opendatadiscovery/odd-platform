import React from 'react';
import { Collector } from 'generated-sources';
import { regenerateCollectorToken } from 'redux/thunks';
import { useAppDispatch } from 'redux/lib/hooks';
import ConfirmationDialog from 'components/shared/ConfirmationDialog/ConfirmationDialog';
import { Typography } from '@mui/material';
import AppButton from 'components/shared/AppButton/AppButton';
import CopyButton from 'components/shared/CopyButton/CopyButton';
import { TokenContainer, Token } from './CollectorItemTokenStyles';

interface CollectorItemProps {
  collector: Collector;
}

const CollectorItemToken: React.FC<CollectorItemProps> = ({
  collector,
}) => {
  const dispatch = useAppDispatch();

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
          actionTitle="Are you sure you want to regenerate token for this collector?"
          actionName="Regenerate"
          actionText={
            <Typography variant="subtitle1">
              Regenerate token for &quot;{collector.name}&quot;?
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
        <CopyButton stringToCopy={collector.token.value} text="Copy" />
      )}
    </TokenContainer>
  );
};

export default CollectorItemToken;
