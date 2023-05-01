import React from 'react';
import {
  getAssociationRequestStatus,
  getIdentity,
  getIdentityFetchingStatuses,
  getOwnership,
  getSupposedOwnerName,
} from 'redux/selectors';
import { OwnerAssociationRequestStatus } from 'generated-sources';
import { Grid, Typography } from '@mui/material';
import { WaitIcon } from 'components/shared/icons';
import { useAppSelector } from 'redux/lib/hooks';
import { Button } from 'components/shared/elements';
import OwnerAssociationForm from './OwnerAssociationForm/OwnerAssociationForm';
import OwnerEntitiesList from './OwnerEntitiesList/OwnerEntitiesList';
import * as S from './OwnerAssociationStyles';

const OwnerAssociation: React.FC = () => {
  const identity = useAppSelector(getIdentity);
  const ownership = useAppSelector(getOwnership);
  const requestStatus = useAppSelector(getAssociationRequestStatus);
  const supposedOwnerName = useAppSelector(getSupposedOwnerName);
  const { isLoaded: isIdentityFetched } = useAppSelector(getIdentityFetchingStatuses);

  const [showRejectMsg, setShowRejectMsg] = React.useState(true);

  const isStatus = (status: OwnerAssociationRequestStatus) => requestStatus === status;

  const getContent = () => {
    const isIDOnly = !ownership && identity && isIdentityFetched;

    if (isIDOnly && !requestStatus) {
      return (
        <S.Container>
          <OwnerAssociationForm />
        </S.Container>
      );
    }

    if (isIDOnly && isStatus(OwnerAssociationRequestStatus.PENDING)) {
      return (
        <S.Container>
          <S.PendingContainer container>
            <WaitIcon />
            <Typography variant='h3'>Request is being checked</Typography>
            <Typography variant='subtitle1'>
              {`You request to associate user ${identity.username} with owner ${supposedOwnerName}.`}
            </Typography>
            <Typography variant='subtitle1'>
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
                <Typography variant='body2'>
                  Your previous request was rejected. Сontact the system administrator, or
                  re-submit your request.
                </Typography>
              </Grid>
              <Button
                buttonType='linkGray-m'
                icon={<S.RejectIcon />}
                onClick={() => setShowRejectMsg(false)}
              />
            </S.RejectMsg>
          )}
          <OwnerAssociationForm />
        </S.Container>
      );
    }

    if (identity && ownership) {
      return <OwnerEntitiesList />;
    }

    return null;
  };

  return getContent();
};

export default OwnerAssociation;
