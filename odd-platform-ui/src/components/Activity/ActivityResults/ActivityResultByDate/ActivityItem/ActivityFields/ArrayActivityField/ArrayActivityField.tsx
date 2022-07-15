import React from 'react';
import { Grid } from '@mui/material';
import ActivityFieldHeader from 'components/shared/Activity/ActivityField/ActivityFieldHeader/ActivityFieldHeader';
import ActivityFieldState from 'components/shared/Activity/ActivityField/ActivityFieldState/ActivityFieldState';
import { TermActivityState } from 'generated-sources';
import { CRUDType } from 'lib/interfaces';
import isEmpty from 'lodash/isEmpty';
import * as S from './ArrayActivityFieldStyled';

interface ActivityData extends TermActivityState {
  id?: number;
  name?: string;
  important?: boolean;
  typeOfChange?: CRUDType;
}

interface ArrayActivityFieldProps {
  oldState: Array<ActivityData> | undefined;
  newState: Array<ActivityData> | undefined;
  hideAllDetails: boolean;
  activityName: string;
  eventType?: string;
  stateItem: (name: string, important?: boolean) => JSX.Element;
}

const ArrayActivityField: React.FC<ArrayActivityFieldProps> = ({
  oldState,
  newState,
  hideAllDetails,
  activityName,
  eventType,
  stateItem,
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  React.useEffect(() => setIsDetailsOpen(false), [hideAllDetails]);

  const setOldState = () =>
    oldState?.map<ActivityData>(oldItem => {
      if (!newState?.some(newItem => oldItem.id === newItem.id)) {
        return { ...oldItem, typeOfChange: 'deleted' };
      }
      return oldItem;
    }) || [];

  const setNewState = () =>
    newState?.map<ActivityData>(newItem => {
      if (!oldState?.some(oldItem => oldItem.id === newItem.id)) {
        return { ...newItem, typeOfChange: 'created' };
      }
      return newItem;
    }) || [];

  const [oldValues, setOldValues] = React.useState<ActivityData[]>([]);
  const [newValues, setNewValues] = React.useState<ActivityData[]>([]);
  const [activityEvent, setActivityEvent] =
    React.useState<CRUDType>('created');

  React.useEffect(() => {
    setOldValues(setOldState());
    setNewValues(setNewState());
  }, [oldState, newState]);

  const createdPredicate = (value: ActivityData) =>
    value.typeOfChange === 'created';
  const deletedPredicate = (value: ActivityData) =>
    value.typeOfChange === 'deleted';

  React.useEffect(() => {
    if (
      oldValues?.some(deletedPredicate) &&
      newValues?.some(createdPredicate)
    ) {
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
    <Grid container flexDirection="column">
      <ActivityFieldHeader
        startText=""
        activityName={activityName}
        eventType={eventType || activityEvent}
        showDetailsBtn
        detailsBtnOnClick={() => setIsDetailsOpen(!isDetailsOpen)}
        isDetailsOpen={isDetailsOpen}
      />
      <ActivityFieldState
        stateDirection="row"
        isDetailsOpen={isDetailsOpen}
        oldStateChildren={
          !isEmpty(oldValues) && oldValues.map(renderStateItem)
        }
        newStateChildren={
          !isEmpty(newValues) && newValues.map(renderStateItem)
        }
      />
    </Grid>
  );
};
export default ArrayActivityField;
