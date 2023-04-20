import React from 'react';
import { Grid } from '@mui/material';
import type {
  ActivityEventType,
  ActivityState,
  OwnershipActivityState,
} from 'generated-sources';
import { type EventType } from 'lib/interfaces';
import isEmpty from 'lodash/isEmpty';
import OwnerWithTitle from 'components/shared/elements/Activity/ActivityFields/OwnerActivityField/OwnerWithTitle/OwnerWithTitle';
import ActivityFieldHeader from 'components/shared/elements/Activity/ActivityFields/ActivityFieldHeader/ActivityFieldHeader';
import ActivityFieldState from 'components/shared/elements/Activity/ActivityFields/ActivityFieldState/ActivityFieldState';

type OwnerItem = OwnershipActivityState & {
  typeOfChange?: EventType;
};

interface ActivityItemProps {
  oldState: ActivityState['ownerships'];
  newState: ActivityState['ownerships'];
  eventType: ActivityEventType;
  hideAllDetails: boolean;
}

const OwnerActivityField: React.FC<ActivityItemProps> = ({
  oldState,
  newState,
  eventType,
  hideAllDetails,
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  React.useEffect(() => setIsDetailsOpen(false), [hideAllDetails]);

  const getEnrichedOldState = () =>
    oldState?.map<OwnerItem>(oldItem => {
      if (!newState?.some(newItem => oldItem.ownerName === newItem.ownerName)) {
        return { ...oldItem, typeOfChange: 'deleted' };
      }
      return oldItem;
    }) || [];

  const getEnrichedNewState = () =>
    newState?.map<OwnerItem>(newItem => {
      if (!oldState?.some(oldItem => oldItem.ownerName === newItem.ownerName)) {
        return { ...newItem, typeOfChange: 'created' };
      }
      return newItem;
    }) || [];

  const getUpdatedOldState = () =>
    oldState?.filter(
      oldItem => !newState?.some(newItem => newItem.titleName === oldItem.titleName)
    ) || [];

  const getCreatedItem = () =>
    newState?.find(
      newItem => !oldState?.some(oldItem => newItem.ownerName === oldItem.ownerName)
    ) || {};

  const getUpdatedItem = () => {
    const updatedItem = newState?.find(newItem =>
      oldState?.some(
        oldItem =>
          newItem.ownerName === oldItem.ownerName &&
          newItem.titleName !== oldItem.titleName
      )
    );

    return updatedItem ? { ...updatedItem, typeOfChange: 'updated' } : {};
  };
  const getDeletedItem = () =>
    oldState?.find(
      oldItem => !newState?.some(newItem => newItem.ownerName === oldItem.ownerName)
    ) || {};

  const [oldValues, setOldValues] = React.useState<OwnerItem[]>([]);
  const [newValues, setNewValues] = React.useState<OwnerItem[]>([]);
  const [changedOwner, setChangedOwner] = React.useState<OwnerItem>({});
  const [activityEvent, setActivityEvent] = React.useState<EventType>('created');

  React.useEffect(() => {
    setOldValues(getEnrichedOldState());
    setNewValues(getEnrichedNewState());
    if (eventType.includes('CREATED')) {
      setChangedOwner(getCreatedItem());
      return;
    }
    if (eventType.includes('UPDATED')) {
      setChangedOwner(getUpdatedItem());
      setOldValues(getUpdatedOldState());
      setNewValues([getUpdatedItem()]);
      return;
    }
    if (eventType.includes('DELETED')) {
      setChangedOwner(getDeletedItem());
    }
  }, [oldState, newState]);

  const createdPredicate = (value: OwnerItem) => value.typeOfChange === 'created';
  const updatedPredicate = (value: OwnerItem) => value.typeOfChange === 'updated';
  const deletedPredicate = (value: OwnerItem) => value.typeOfChange === 'deleted';

  React.useEffect(() => {
    if (newValues?.some(updatedPredicate)) {
      setActivityEvent('updated');
      return;
    }

    if (oldValues?.some(createdPredicate)) {
      setActivityEvent('created');
      return;
    }

    if (oldValues?.some(deletedPredicate)) {
      setActivityEvent('deleted');
    }
  }, [oldValues, newValues]);

  const ownerWithTitle = (owner: OwnerItem) => (
    <OwnerWithTitle
      key={`${owner.ownerName}-${owner.titleName}`}
      ownerName={owner.ownerName}
      roleName={owner.titleName}
      typeOfChange={owner.typeOfChange}
    />
  );

  return (
    <Grid container flexDirection='column'>
      <ActivityFieldHeader
        startText='Owner'
        activityName={
          <OwnerWithTitle
            ownerName={changedOwner.ownerName}
            roleName={changedOwner.titleName}
            ownerTypographyVariant='h4'
          />
        }
        eventType={activityEvent}
        showDetailsBtn
        detailsBtnOnClick={() => setIsDetailsOpen(!isDetailsOpen)}
        isDetailsOpen={isDetailsOpen}
      />
      <ActivityFieldState
        isDetailsOpen={isDetailsOpen}
        oldStateChildren={!isEmpty(oldValues) && oldValues.map(ownerWithTitle)}
        newStateChildren={!isEmpty(newValues) && newValues.map(ownerWithTitle)}
      />
    </Grid>
  );
};
export default OwnerActivityField;
