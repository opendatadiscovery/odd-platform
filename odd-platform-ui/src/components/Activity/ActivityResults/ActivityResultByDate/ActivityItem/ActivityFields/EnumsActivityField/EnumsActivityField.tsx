import React, { CSSProperties } from 'react';
import { Grid, Typography } from '@mui/material';
import ActivityFieldHeader from 'components/shared/Activity/ActivityField/ActivityFieldHeader/ActivityFieldHeader';
import ActivityFieldState from 'components/shared/Activity/ActivityField/ActivityFieldState/ActivityFieldState';
import {
  DatasetFieldEnumValuesActivityState,
  DatasetFieldValuesActivityState,
} from 'generated-sources';
import { CRUDType } from 'lib/interfaces';
import isEmpty from 'lodash/isEmpty';
import * as S from './EnumsActivityFieldStyles';

interface ActivityData extends DatasetFieldEnumValuesActivityState {
  typeOfChange?: CRUDType;
}

interface EnumsActivityFieldProps {
  oldState: DatasetFieldValuesActivityState | undefined;
  newState: DatasetFieldValuesActivityState | undefined;
  hideAllDetails: boolean;
  stateDirection?: CSSProperties['flexDirection'];
}

const EnumsActivityField: React.FC<EnumsActivityFieldProps> = ({
  oldState,
  newState,
  hideAllDetails,
  stateDirection = 'row',
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  React.useEffect(() => setIsDetailsOpen(false), [hideAllDetails]);

  const setOldState = () =>
    oldState?.enumValues
      ?.map<ActivityData>(oldItem => {
        if (
          !newState?.enumValues?.some(newItem => oldItem.id === newItem.id)
        ) {
          return { ...oldItem, typeOfChange: 'deleted' };
        }
        return oldItem;
      })
      .reverse() || [];

  const setNewState = () =>
    newState?.enumValues?.map<ActivityData>(newItem => {
      if (
        !oldState?.enumValues?.some(oldItem => oldItem.id === newItem.id)
      ) {
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
      {value.name}
    </S.ArrayItemWrapper>
  );

  return (
    <Grid container flexDirection="column">
      <ActivityFieldHeader
        startText=""
        activityName="ENUM association"
        eventType={activityEvent}
        showDetailsBtn
        detailsBtnOnClick={() => setIsDetailsOpen(!isDetailsOpen)}
        isDetailsOpen={isDetailsOpen}
      />
      <ActivityFieldState
        stateDirection={stateDirection}
        isDetailsOpen={isDetailsOpen}
        oldStateChildren={
          !isEmpty(oldValues) && (
            <>
              <Typography variant="body1" color="texts.hint">
                {`Column: ${oldState?.name}`}
              </Typography>
              {oldValues.map(renderStateItem)}
            </>
          )
        }
        newStateChildren={
          !isEmpty(newValues) && (
            <>
              <Typography variant="body1" color="texts.hint">
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
