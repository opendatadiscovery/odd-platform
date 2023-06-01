import React, { type FC, useEffect } from 'react';
import type {
  DatasetFieldTermsActivityState,
  TermActivityState,
} from 'generated-sources';
import type { EventType } from 'lib/interfaces';
import ActivityFieldHeader from 'components/shared/elements/Activity/ActivityFields/ActivityFieldHeader/ActivityFieldHeader';
import ActivityFieldState from 'components/shared/elements/Activity/ActivityFields/ActivityFieldState/ActivityFieldState';
import isEmpty from 'lodash/isEmpty';
import { Box, Grid, Typography } from '@mui/material';
import * as S from './DatasetTermActivityField.styles';

interface DatasetTermActivityFieldProps {
  oldState: DatasetFieldTermsActivityState | undefined;
  newState: DatasetFieldTermsActivityState | undefined;
  hideAllDetails: boolean;
}

interface ActivityData extends TermActivityState {
  typeOfChange?: EventType;
}

const DatasetTermActivityField: FC<DatasetTermActivityFieldProps> = ({
  oldState,
  newState,
  hideAllDetails,
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  React.useEffect(() => setIsDetailsOpen(false), [hideAllDetails]);

  const [changedItem, setChangedItem] = React.useState<ActivityData>({});

  const sortChangedItemsLast = (item: ActivityData) => (item.typeOfChange ? 1 : -1);

  const setOldState = () =>
    oldState?.terms
      ?.map<ActivityData>(oldItem => {
        if (!newState?.terms?.some(newItem => oldItem.id === newItem.id)) {
          setChangedItem(oldItem);
          return { ...oldItem, typeOfChange: 'deleted' };
        }
        return oldItem;
      })
      .sort(sortChangedItemsLast) || [];

  const setNewState = () =>
    newState?.terms
      ?.map<ActivityData>(newItem => {
        if (!oldState?.terms?.some(oldItem => oldItem.id === newItem.id)) {
          setChangedItem(newItem);
          return { ...newItem, typeOfChange: 'assigned' };
        }
        return newItem;
      })
      .sort(sortChangedItemsLast) || [];

  const [oldValues, setOldValues] = React.useState<ActivityData[]>([]);
  const [newValues, setNewValues] = React.useState<ActivityData[]>([]);
  const [activityEvent, setActivityEvent] = React.useState<EventType>('assigned');

  React.useEffect(() => {
    setOldValues(setOldState());
    setNewValues(setNewState());
  }, [oldState, newState]);

  const assignedPredicate = (value: ActivityData) => value.typeOfChange === 'assigned';
  const deletedPredicate = (value: ActivityData) => value.typeOfChange === 'deleted';

  useEffect(() => {
    if (oldValues?.some(deletedPredicate) && newValues?.some(assignedPredicate)) {
      setActivityEvent('updated');
      return;
    }

    if (oldValues?.some(assignedPredicate)) {
      setActivityEvent('created');
      return;
    }

    if (oldValues?.some(deletedPredicate)) {
      setActivityEvent('deleted');
    }
  }, [oldValues, newValues]);

  const renderTermItem = ([namespace, terms]: [string, ActivityData[]]) => (
    <Grid sx={{ mb: 0.5 }}>
      <Typography variant='body1' color='texts.hint'>
        Namespace: {namespace}
      </Typography>
      {terms.map(term => (
        <S.ArrayItemWrapper key={term.id} $typeOfChange={term.typeOfChange}>
          <Box sx={{ p: 0.5 }}>{term.name}</Box>
        </S.ArrayItemWrapper>
      ))}
    </Grid>
  );

  const groupTermsByNamespace = (state: ActivityData[]) =>
    state.reduce<{ [key: string]: ActivityData[] }>(
      (memo, activity) =>
        activity.namespace
          ? {
              ...memo,
              [activity.namespace]: [...(memo[activity.namespace] || []), activity],
            }
          : {},
      {}
    );

  return (
    <Grid container flexDirection='column'>
      <ActivityFieldHeader
        startText='Term'
        activityName={`${changedItem.name} in ${changedItem.namespace} for column ${
          oldState?.name || newState?.name
        }`}
        eventType={activityEvent}
        showDetailsBtn
        detailsBtnOnClick={() => setIsDetailsOpen(!isDetailsOpen)}
        isDetailsOpen={isDetailsOpen}
      />
      <ActivityFieldState
        stateDirection='column'
        isDetailsOpen={isDetailsOpen}
        oldStateChildren={
          !isEmpty(oldValues) &&
          Object.entries(groupTermsByNamespace(oldValues)).map(renderTermItem)
        }
        newStateChildren={
          !isEmpty(newValues) &&
          Object.entries(groupTermsByNamespace(newValues)).map(renderTermItem)
        }
      />
    </Grid>
  );
};

export default DatasetTermActivityField;
