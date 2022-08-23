import React from 'react';
import {
  getAssociationRequestStatus,
  getIdentity,
  getIdentityFetchingStatuses,
  getOwnership,
} from 'redux/selectors';
import { useAppSelector } from 'lib/redux/hooks';
import { OwnerAssociationRequestStatus } from 'generated-sources';
import OwnerAssociationRequestInfo from 'components/Overview/OwnerAssociation/OwnerAssociationRequestInfo/OwnerAssociationRequestInfo';
import { useLocalStorage } from 'lib/hooks/useLocalStorage';
import OwnerAssociationForm from 'components/Overview/OwnerAssociation/OwnerAssociationForm/OwnerAssociationForm';
import OwnerEntitiesList from './OwnerEntitiesList/OwnerEntitiesList';

const OwnerAssociation: React.FC = () => {
  const identity = useAppSelector(getIdentity);
  const ownership = useAppSelector(getOwnership);
  const requestStatus = useAppSelector(getAssociationRequestStatus);
  const { isLoaded: isIdentityFetched } = useAppSelector(
    getIdentityFetchingStatuses
  );

  const { getLocalStorageValue } = useLocalStorage();
  const showAcceptedInfo = getLocalStorageValue(
    'showAssociationAcceptedMessage'
  );

  const statusPredicate = (status: OwnerAssociationRequestStatus) =>
    requestStatus === status;

  const getContent = () => {
    const isIdentityFetchedWithoutOwnership =
      !ownership && identity && isIdentityFetched;

    if (isIdentityFetchedWithoutOwnership && !requestStatus) {
      return <OwnerAssociationForm />;
    }

    if (
      isIdentityFetchedWithoutOwnership &&
      statusPredicate(OwnerAssociationRequestStatus.PENDING)
    ) {
      return (
        <OwnerAssociationRequestInfo
          status={OwnerAssociationRequestStatus.PENDING}
        />
      );
    }

    if (
      isIdentityFetchedWithoutOwnership &&
      statusPredicate(OwnerAssociationRequestStatus.DECLINED)
    ) {
      return (
        <OwnerAssociationRequestInfo
          status={OwnerAssociationRequestStatus.DECLINED}
        />
      );
    }

    if (
      identity &&
      ownership &&
      statusPredicate(OwnerAssociationRequestStatus.APPROVED)
    ) {
      return (
        <>
          <OwnerEntitiesList />
          <OwnerAssociationRequestInfo
            status={OwnerAssociationRequestStatus.APPROVED}
          />
        </>
      );
    }

    return null;
  };

  return getContent();
};

export default OwnerAssociation;
