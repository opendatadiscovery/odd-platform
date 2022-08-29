import React from 'react';
import {
  getAssociationRequestStatus,
  getIdentity,
  getIdentityFetchingStatuses,
  getOwnership,
} from 'redux/selectors';
import { useAppSelector } from 'lib/redux/hooks';
import { OwnerAssociationRequestStatus } from 'generated-sources';
import { Grid, Typography } from '@mui/material';
import { WaitIcon } from 'components/shared/Icons';
import { AppIconButton } from 'components/shared';
import OwnerAssociationForm from './OwnerAssociationForm/OwnerAssociationForm';
import OwnerEntitiesList from './OwnerEntitiesList/OwnerEntitiesList';
import * as S from './OwnerAssociationStyles';

const OwnerAssociation: React.FC = () => {
  const identity = useAppSelector(getIdentity);
  const ownership = useAppSelector(getOwnership);
  const requestStatus = useAppSelector(getAssociationRequestStatus);
  const { isLoaded: isIdentityFetched } = useAppSelector(
    getIdentityFetchingStatuses
  );

  const [showRejectMsg, setShowRejectMsg] = React.useState(true);
  const [supposedOwner, setSupposedOwner] = React.useState('');
  const setOwnerName = React.useCallback(
    (ownerName: string) => setSupposedOwner(ownerName),
    [setSupposedOwner]
  );

  const isStatus = (status: OwnerAssociationRequestStatus) =>
    requestStatus === status;

  const getContent = () => {
    const isIDOnly = !ownership && identity && isIdentityFetched;

    if (isIDOnly && !requestStatus) {
      return (
        <S.Container>
          <OwnerAssociationForm setSupposedOwner={setOwnerName} />
        </S.Container>
      );
    }

    if (isIDOnly && isStatus(OwnerAssociationRequestStatus.PENDING)) {
      return (
        <S.Container>
          <S.PendingContainer container>
            <WaitIcon />
            <Typography variant="h3">Request is being checked</Typography>
            <Typography variant="subtitle1">
              {`You request to associate user ${identity.username} with owner ${supposedOwner}.`}
            </Typography>
            <Typography variant="subtitle1">
              Wait for the administrator to review the request.
            </Typography>
          </S.PendingContainer>
        </S.Container>
      );
    }

    if (isIDOnly && isStatus(OwnerAssociationRequestStatus.DECLINED)) {
      return (
        <S.Container>
          {showRejectMsg && (
            <S.RejectMsg container sx={{ mb: showRejectMsg ? 3 : 0 }}>
              <Grid container>
                <S.AlertIcn />
                <Typography variant="body2">
                  Your previous request was rejected. Сontact the system
                  administrator, or re-submit your request.
                </Typography>
              </Grid>
              <AppIconButton
                size="small"
                color="unfilled"
                icon={<S.RejectIcon />}
                onClick={() => setShowRejectMsg(false)}
              />
            </S.RejectMsg>
          )}
          <OwnerAssociationForm setSupposedOwner={setOwnerName} />
        </S.Container>
      );
    }

    if (
      identity &&
      ownership &&
      isStatus(OwnerAssociationRequestStatus.APPROVED)
    ) {
      return <OwnerEntitiesList />;
    }

    return null;
  };

  return getContent();
};

export default OwnerAssociation;
