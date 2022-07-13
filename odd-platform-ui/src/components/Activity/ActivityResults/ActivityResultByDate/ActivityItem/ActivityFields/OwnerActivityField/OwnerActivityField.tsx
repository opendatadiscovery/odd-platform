import React from 'react';
import { Grid } from '@mui/material';
import {
  ActivityEventType,
  ActivityState,
  OwnershipActivityState,
} from 'generated-sources';
import ActivityFieldState from 'components/shared/Activity/ActivityField/ActivityFieldState/ActivityFieldState';
import OwnerActivityFieldHeader from 'components/Activity/ActivityResults/ActivityResultByDate/ActivityItem/ActivityFields/OwnerActivityField/OwnerActivityFieldHeader/OwnerActivityFieldHeader';
import OwnerWithRole from './OwnerWithRole/OwnerWithRole';

type OwnerItem = OwnershipActivityState & {
  isChanged?: boolean;
};

interface ActivityFieldData {
  oldFilteredState: Array<OwnerItem>;
  newFilteredState: Array<OwnerItem>;
  itemThatChanges: OwnerItem;
  showDetails: boolean;
}

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

  const updateItemByIsChanged = (item: OwnerItem) => ({
    ...item,
    isChanged: true,
  });

  const getChangedItem = (
    oldItemsState: Array<OwnerItem>,
    newItemsState: Array<OwnerItem>
  ) =>
    newItemsState
      .map<OwnerItem>(updateItemByIsChanged)
      .find(
        newItem =>
          !oldItemsState.some(
            oldItem => newItem.ownerName === oldItem.ownerName
          )
      ) || {};

  const getFilteredState = (
    oldItemsState: Array<OwnerItem>,
    newItemsState: Array<OwnerItem>
  ) =>
    newItemsState
      ?.filter(
        newItem =>
          !oldItemsState.some(
            oldItem => newItem.ownerName === oldItem.ownerName
          )
      )
      .map<OwnerItem>(updateItemByIsChanged);

  const [
    { oldFilteredState, newFilteredState, showDetails, itemThatChanges },
    setFieldData,
  ] = React.useState<ActivityFieldData>({
    oldFilteredState: [],
    newFilteredState: [],
    itemThatChanges: {},
    showDetails: false,
  });

  React.useEffect(() => {
    if (
      oldState?.length === 0 &&
      newState?.length === 1 &&
      eventType.includes('CREATED')
    ) {
      setFieldData({
        oldFilteredState: oldState,
        newFilteredState: newState,
        itemThatChanges: getChangedItem(oldState, newState),
        showDetails: false,
      });
    }

    if (
      oldState &&
      newState &&
      oldState?.length > 0 &&
      eventType.includes('CREATED')
    ) {
      setFieldData({
        oldFilteredState: oldState,
        newFilteredState: [
          ...oldState,
          ...getFilteredState(oldState, newState),
        ],
        itemThatChanges: getChangedItem(oldState, newState),
        showDetails: true,
      });
    }

    if (oldState && newState && eventType.includes('UPDATED')) {
      const oldOwnerState = oldState.filter(
        oldItem =>
          !newState.some(newItem => newItem.roleName === oldItem.roleName)
      );
      const changedItem =
        newState
          .map<OwnerItem>(updateItemByIsChanged)
          .find(
            newItem =>
              !oldState.some(
                oldItem => newItem.roleName === oldItem.roleName
              )
          ) || {};

      setFieldData({
        oldFilteredState: oldOwnerState,
        newFilteredState: [changedItem],
        itemThatChanges: changedItem,
        showDetails: true,
      });
    }

    if (oldState && newState && eventType.includes('DELETED')) {
      setFieldData({
        oldFilteredState: [
          ...newState,
          ...getFilteredState(newState, oldState),
        ],
        newFilteredState: newState,
        itemThatChanges: getChangedItem(newState, oldState),
        showDetails: true,
      });
    }
  }, [oldState, newState, eventType]);

  const ownerWithRole = (
    ownerName?: string,
    roleName?: string,
    isChanged?: boolean
  ) => (
    <OwnerWithRole
      key={`${ownerName}-${roleName}`}
      ownerName={ownerName}
      roleName={roleName}
      eventType={eventType}
      isChanged={isChanged}
    />
  );

  return (
    <Grid container flexDirection="column">
      <OwnerActivityFieldHeader
        ownerName={itemThatChanges?.ownerName}
        roleName={itemThatChanges?.roleName}
        eventType={eventType}
        showDetailsBtn={showDetails}
        detailsBtnOnClick={() => setIsDetailsOpen(!isDetailsOpen)}
        isDetailsOpen={isDetailsOpen}
      />
      <ActivityFieldState
        isDetailsOpen={isDetailsOpen}
        oldStateChildren={oldFilteredState.map(
          ({ ownerName, roleName, isChanged }) =>
            ownerWithRole(ownerName, roleName, isChanged)
        )}
        newStateChildren={newFilteredState.map(
          ({ ownerName, roleName, isChanged }) =>
            ownerWithRole(ownerName, roleName, isChanged)
        )}
        // oldStateData={oldFilteredState}
        // newStateData={newFilteredState}
        // stateComponent={detailsStateComponent}
      />
    </Grid>
  );
};
export default OwnerActivityField;
