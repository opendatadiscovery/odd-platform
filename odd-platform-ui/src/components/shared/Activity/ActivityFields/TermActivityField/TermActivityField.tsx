import React, { CSSProperties } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import ActivityFieldHeader from 'components/shared/Activity/ActivityFields/ActivityFieldHeader/ActivityFieldHeader';
import ActivityFieldState from 'components/shared/Activity/ActivityFields/ActivityFieldState/ActivityFieldState';
import { TermActivityState } from 'generated-sources';
import { CRUDType } from 'lib/interfaces';
import isEmpty from 'lodash/isEmpty';
import * as S from 'components/shared/Activity/ActivityFields/TermActivityField/TermActivityFieldStyles';

interface ActivityData extends TermActivityState {
  typeOfChange?: CRUDType;
}

interface TermActivityFieldProps {
  oldState: Array<ActivityData> | undefined;
  newState: Array<ActivityData> | undefined;
  hideAllDetails: boolean;
  eventType: string;
  stateDirection?: CSSProperties['flexDirection'];
}

const TermActivityField: React.FC<TermActivityFieldProps> = ({
  oldState,
  newState,
  hideAllDetails,
  eventType,
  stateDirection = 'row',
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  React.useEffect(() => setIsDetailsOpen(false), [hideAllDetails]);

  const [changedItem, setChangedItem] = React.useState<ActivityData>({});

  const sortChangedItemsLast = (item: ActivityData) =>
    item.typeOfChange ? 1 : -1;

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

  React.useEffect(() => {
    setOldValues(setOldState());
    setNewValues(setNewState());
  }, [oldState, newState]);

  const renderTermItem = ([namespace, terms]: [
    string,
    ActivityData[]
  ]) => (
    <Grid sx={{ mb: 0.5 }}>
      <Typography variant="body1" color="texts.hint">
        {namespace}
      </Typography>
      {terms.map(term => (
        <S.ArrayItemWrapper $typeOfChange={term.typeOfChange}>
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
              [activity.namespace]: [
                ...(memo[activity.namespace] || []),
                activity,
              ],
            }
          : {},
      {}
    );

  return (
    <Grid container flexDirection="column">
      <ActivityFieldHeader
        startText="Term"
        activityName={`${changedItem.name} in ${changedItem.namespace}`}
        eventType={eventType}
        showDetailsBtn
        detailsBtnOnClick={() => setIsDetailsOpen(!isDetailsOpen)}
        isDetailsOpen={isDetailsOpen}
      />
      <ActivityFieldState
        stateDirection={stateDirection}
        isDetailsOpen={isDetailsOpen}
        oldStateChildren={
          !isEmpty(oldValues) &&
          Object.entries(groupTermsByNamespace(oldValues)).map(
            renderTermItem
          )
        }
        newStateChildren={
          !isEmpty(newValues) &&
          Object.entries(groupTermsByNamespace(newValues)).map(
            renderTermItem
          )
        }
      />
    </Grid>
  );
};
export default TermActivityField;
