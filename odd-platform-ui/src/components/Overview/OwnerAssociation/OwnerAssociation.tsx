import React from 'react';
import {
  getAssociationRequestStatus,
  getIdentity,
  getIdentityFetchingStatuses,
  getOwnership,
} from 'redux/selectors';
import { useAppSelector } from 'lib/redux/hooks';
import { OwnerAssociationRequestStatus } from 'generated-sources';
import OwnerAssociationForm from './OwnerAssociationForm/OwnerAssociationForm';
import OwnerEntitiesList from './OwnerEntitiesList/OwnerEntitiesList';

const OwnerAssociation: React.FC = () => {
  const identity = useAppSelector(getIdentity);
  const ownership = useAppSelector(getOwnership);
  const requestStatus = useAppSelector(getAssociationRequestStatus);
  const { isLoaded: isIdentityFetched } = useAppSelector(
    getIdentityFetchingStatuses
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
      return <div>vasha zayavka na rassmotrenii</div>;
    }

    if (
      isIdentityFetchedWithoutOwnership &&
      statusPredicate(OwnerAssociationRequestStatus.DECLINED)
    ) {
      return <div>vasha zayavka otklonena</div>;
    }

    if (
      identity &&
      ownership &&
      statusPredicate(OwnerAssociationRequestStatus.APPROVED)
    ) {
      return <OwnerEntitiesList />;
    }

    return null;
  };

  return getContent();
};

export default OwnerAssociation;
