import React, { type CSSProperties } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import isEmpty from 'lodash/isEmpty';
import { useTranslation } from 'react-i18next';
import { type TermActivityState } from 'generated-sources';
import { type EventType } from 'lib/interfaces';
import ActivityFieldState from 'components/shared/elements/Activity/ActivityFields/ActivityFieldState/ActivityFieldState';
import ActivityFieldHeader from 'components/shared/elements/Activity/ActivityFields/ActivityFieldHeader/ActivityFieldHeader';
import { LinkedTermIcon } from 'components/shared/icons';
import * as S from './TermActivityField.styles';

interface ActivityData extends TermActivityState {
  typeOfChange?: EventType;
}

interface TermActivityFieldProps {
  oldState: Array<ActivityData> | undefined;
  newState: Array<ActivityData> | undefined;
  hideAllDetails: boolean;
  eventType: EventType;
  stateDirection?: CSSProperties['flexDirection'];
}

const TermActivityField: React.FC<TermActivityFieldProps> = ({
  oldState,
  newState,
  hideAllDetails,
  eventType,
  stateDirection = 'row',
}) => {
  const { t } = useTranslation();
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  React.useEffect(() => setIsDetailsOpen(false), [hideAllDetails]);

  const sortChangedItemsLast = (item: ActivityData) => (item.typeOfChange ? 1 : -1);

  const setOldState = () =>
    oldState
      ?.map<ActivityData>(oldItem => {
        if (!newState?.some(newItem => oldItem.id === newItem.id)) {
          return { ...oldItem, typeOfChange: 'deleted' };
        }
        return oldItem;
      })
      .sort(sortChangedItemsLast) || [];

  const setNewState = () =>
    newState
      ?.map<ActivityData>(newItem => {
        if (!oldState?.some(oldItem => oldItem.id === newItem.id)) {
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

  const renderTermItem = ([namespace, terms]: [string, ActivityData[]]) => (
    <Grid sx={{ mb: 0.5 }}>
      <Typography variant='body1' color='texts.hint'>
        {t('Namespace')}: {namespace}
      </Typography>
      {terms.map(term => (
        <S.ArrayItemWrapper key={term.id} $typeOfChange={term.typeOfChange}>
          <Box sx={{ mr: 0.5 }}>{term.name}</Box>
          {term.isDescriptionLink && <LinkedTermIcon />}
        </S.ArrayItemWrapper>
      ))}
    </Grid>
  );

  return (
    <Grid container flexDirection='column'>
      <ActivityFieldHeader
        startText=''
        activityName={t('Terms assignment')}
        eventType={eventType}
        showDetailsBtn
        detailsBtnOnClick={() => setIsDetailsOpen(!isDetailsOpen)}
        isDetailsOpen={isDetailsOpen}
        plural
      />
      <ActivityFieldState
        stateDirection={stateDirection}
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
export default TermActivityField;
