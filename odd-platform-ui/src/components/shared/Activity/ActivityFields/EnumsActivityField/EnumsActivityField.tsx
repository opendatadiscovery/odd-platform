import React from 'react';
import { Grid, Typography } from '@mui/material';
import type {
  DatasetFieldEnumValuesActivityState,
  DatasetFieldValuesActivityState,
} from 'generated-sources';
import { type CRUDType } from 'lib/interfaces';
import isEmpty from 'lodash/isEmpty';
import ActivityFieldHeader from '../ActivityFieldHeader/ActivityFieldHeader';
import ActivityFieldState from '../ActivityFieldState/ActivityFieldState';
import * as S from './EnumsActivityFieldStyles';

interface ActivityData extends DatasetFieldEnumValuesActivityState {
  typeOfChange?: CRUDType;
}

interface EnumsActivityFieldProps {
  oldState: DatasetFieldValuesActivityState | undefined;
  newState: DatasetFieldValuesActivityState | undefined;
  hideAllDetails: boolean;
}

const EnumsActivityField: React.FC<EnumsActivityFieldProps> = ({
  oldState,
  newState,
  hideAllDetails,
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  React.useEffect(() => setIsDetailsOpen(false), [hideAllDetails]);

  const sortChangedItemsLast = (item: ActivityData) => (item.typeOfChange ? 1 : -1);

  const setOldState = () =>
    oldState?.enumValues
      ?.map<ActivityData>(oldItem => {
        if (!newState?.enumValues?.some(newItem => oldItem.id === newItem.id)) {
          return { ...oldItem, typeOfChange: 'deleted' };
        }
        return oldItem;
      })
      .sort(sortChangedItemsLast) || [];

  const setNewState = () =>
    newState?.enumValues
      ?.map<ActivityData>(newItem => {
        if (!oldState?.enumValues?.some(oldItem => oldItem.id === newItem.id)) {
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
      {value.name}
    </S.ArrayItemWrapper>
  );

  return (
    <Grid container flexDirection='column'>
      <ActivityFieldHeader
        startText=''
        activityName='Dataset field values'
        eventType={activityEvent}
        showDetailsBtn
        detailsBtnOnClick={() => setIsDetailsOpen(!isDetailsOpen)}
        isDetailsOpen={isDetailsOpen}
        plural
      />
      <ActivityFieldState
        stateDirection='column'
        isDetailsOpen={isDetailsOpen}
        oldStateChildren={
          !isEmpty(oldValues) && (
            <>
              <Typography variant='body1' color='texts.hint'>
                {`Column: ${oldState?.name}`}
              </Typography>
              {oldValues.map(renderStateItem)}
            </>
          )
        }
        newStateChildren={
          !isEmpty(newValues) && (
            <>
              <Typography variant='body1' color='texts.hint'>
                {`Column: ${oldState?.name}`}
              </Typography>
              {newValues.map(renderStateItem)}
            </>
          )
        }
      />
    </Grid>
  );
};
export default EnumsActivityField;
