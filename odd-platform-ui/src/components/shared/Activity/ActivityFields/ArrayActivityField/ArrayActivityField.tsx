import React, { CSSProperties } from 'react';
import { Grid } from '@mui/material';
import { ActivityFieldHeader, ActivityFieldState } from 'components/shared/Activity';
import { CRUDType } from 'lib/interfaces';
import isEmpty from 'lodash/isEmpty';
import * as S from './ArrayActivityFieldStyles';

interface ActivityData {
  id?: number;
  name?: string;
  important?: boolean;
  typeOfChange?: CRUDType;
}

interface ArrayActivityFieldProps {
  oldState: Array<ActivityData> | undefined;
  newState: Array<ActivityData> | undefined;
  hideAllDetails: boolean;
  startText?: string;
  activityName?: string;
  eventType?: string;
  stateItem: (name: string, important?: boolean) => JSX.Element;
  stateDirection?: CSSProperties['flexDirection'];
  plural?: boolean;
}

const ArrayActivityField: React.FC<ArrayActivityFieldProps> = ({
  oldState,
  newState,
  hideAllDetails,
  activityName,
  startText,
  eventType,
  stateItem,
  stateDirection = 'row',
  plural,
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  React.useEffect(() => setIsDetailsOpen(false), [hideAllDetails]);

  const [changedItem, setChangedItem] = React.useState<ActivityData>({});

  const sortChangedItemsLast = (item: ActivityData) => (item.typeOfChange ? 1 : -1);

  const setOldState = () =>
    oldState
      ?.map<ActivityData>(oldItem => {
        if (!newState?.some(newItem => oldItem.id === newItem.id)) {
          setChangedItem(oldItem);
          return { ...oldItem, typeOfChange: 'deleted' };
        }
        return oldItem;
      })
      .sort(sortChangedItemsLast) || [];

  const setNewState = () =>
    newState
      ?.map<ActivityData>(newItem => {
        if (!oldState?.some(oldItem => oldItem.id === newItem.id)) {
          setChangedItem(newItem);
          return { ...newItem, typeOfChange: 'created' };
        }
        return newItem;
      })
      .sort(sortChangedItemsLast) || [];

  const [oldValues, setOldValues] = React.useState<ActivityData[]>([]);
  const [newValues, setNewValues] = React.useState<ActivityData[]>([]);
  const [activityEvent, setActivityEvent] = React.useState<CRUDType>('created');

  React.useEffect(() => {
    setOldValues(setOldState());
    setNewValues(setNewState());
  }, [oldState, newState]);

  const createdPredicate = (value: ActivityData) => value.typeOfChange === 'created';
  const deletedPredicate = (value: ActivityData) => value.typeOfChange === 'deleted';

  React.useEffect(() => {
    if (oldValues?.some(deletedPredicate) && newValues?.some(createdPredicate)) {
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

  const renderStateItem = (value: ActivityData) => (
    <S.ArrayItemWrapper $typeOfChange={value.typeOfChange}>
      {stateItem(value.name || '', value.important)}
    </S.ArrayItemWrapper>
  );

  return (
    <Grid container flexDirection='column'>
      <ActivityFieldHeader
        startText={startText || ''}
        activityName={activityName || changedItem.name}
        eventType={eventType || activityEvent}
        showDetailsBtn
        detailsBtnOnClick={() => setIsDetailsOpen(!isDetailsOpen)}
        isDetailsOpen={isDetailsOpen}
        plural={plural}
      />
      <ActivityFieldState
        stateDirection={stateDirection}
        isDetailsOpen={isDetailsOpen}
        oldStateChildren={!isEmpty(oldValues) && oldValues.map(renderStateItem)}
        newStateChildren={!isEmpty(newValues) && newValues.map(renderStateItem)}
      />
    </Grid>
  );
};
export default ArrayActivityField;
