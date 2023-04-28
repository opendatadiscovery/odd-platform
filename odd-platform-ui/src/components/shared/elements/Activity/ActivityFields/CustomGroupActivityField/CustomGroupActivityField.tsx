import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { type CustomGroupActivityState } from 'generated-sources';
import { type EventType } from 'lib/interfaces';
import isEmpty from 'lodash/isEmpty';
import { useAppPaths } from 'lib/hooks';
import Button from 'components/shared/elements/Button/Button';
import ActivityFieldState from 'components/shared/elements/Activity/ActivityFields/ActivityFieldState/ActivityFieldState';
import ActivityFieldHeader from 'components/shared/elements/Activity/ActivityFields/ActivityFieldHeader/ActivityFieldHeader';
import * as S from 'components/shared/elements/Activity/ActivityFields/ArrayActivityField/ArrayActivityFieldStyles';

interface GroupFieldData {
  id?: number;
  name?: string;
  typeOfChange?: EventType;
}

interface CustomGroupData {
  internalName: GroupFieldData;
  type: GroupFieldData;
  namespaceName: GroupFieldData;
  entities: GroupFieldData[];
}

interface CustomGroupActivityFieldProps {
  oldState: CustomGroupActivityState | undefined;
  newState: CustomGroupActivityState | undefined;
  hideAllDetails: boolean;
}

const CustomGroupActivityField: React.FC<CustomGroupActivityFieldProps> = ({
  oldState,
  newState,
  hideAllDetails,
}) => {
  const { dataEntityOverviewPath } = useAppPaths();

  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  React.useEffect(() => setIsDetailsOpen(false), [hideAllDetails]);

  const setOldEntitiesState = () =>
    oldState?.entities?.map<GroupFieldData>(oldItem => {
      if (!newState?.entities?.some(newItem => oldItem.id === newItem.id)) {
        return {
          id: oldItem.id,
          name: oldItem.internalName || oldItem.externalName,
          typeOfChange: 'deleted',
        };
      }
      return {
        id: oldItem.id,
        name: oldItem.internalName || oldItem.externalName,
      };
    }) || [];

  const setNewEntitiesState = () =>
    newState?.entities?.map<GroupFieldData>(newItem => {
      if (!oldState?.entities?.some(oldItem => oldItem.id === newItem.id)) {
        return {
          id: newItem.id,
          name: newItem.internalName || newItem.externalName,
          typeOfChange: 'created',
        };
      }
      return {
        id: newItem.id,
        name: newItem.internalName || newItem.externalName,
      };
    }) || [];

  const prepareValues = (state?: CustomGroupActivityState): CustomGroupData => ({
    internalName: { name: state?.internalName },
    type: { name: state?.type?.name },
    namespaceName: { name: state?.namespaceName },
    entities:
      state?.entities?.map(entity => ({
        name: entity.internalName || entity.externalName,
      })) || [],
  });

  const [oldValues, setOldValues] = React.useState<CustomGroupData>(
    prepareValues(oldState)
  );
  const [newValues, setNewValues] = React.useState<CustomGroupData>(
    prepareValues(newState)
  );

  React.useEffect(() => {
    if (oldState?.internalName !== newState?.internalName) {
      setNewValues(prev => ({
        ...prev,
        internalName: { ...prev.internalName, typeOfChange: 'created' },
      }));
    }
    if (oldState?.type?.name !== newState?.type?.name) {
      setNewValues(prev => ({
        ...prev,
        type: { ...prev.type, typeOfChange: 'created' },
      }));
    }
    if (oldState?.namespaceName !== newState?.namespaceName) {
      setNewValues(prev => ({
        ...prev,
        namespaceName: { ...prev.namespaceName, typeOfChange: 'created' },
      }));
    }

    setOldValues(prev => ({ ...prev, entities: setOldEntitiesState() }));
    setNewValues(prev => ({ ...prev, entities: setNewEntitiesState() }));
  }, []);

  const renderGroupItem = (state: CustomGroupData) => (
    <Grid sx={{ mb: 0.5 }}>
      <Box sx={{ mb: 1 }}>
        <Typography variant='subtitle1'>Name</Typography>
        <S.ArrayItemWrapper $typeOfChange={state.internalName.typeOfChange}>
          <Box>{state.internalName.name}</Box>
        </S.ArrayItemWrapper>
      </Box>
      <Box sx={{ mb: 1 }}>
        <Typography variant='subtitle1'>Namespace</Typography>
        <S.ArrayItemWrapper $typeOfChange={state.namespaceName.typeOfChange}>
          <Box>{state.namespaceName.name}</Box>
        </S.ArrayItemWrapper>
      </Box>
      <Box sx={{ mb: 1 }}>
        <Typography variant='subtitle1'>Type</Typography>
        <S.ArrayItemWrapper $typeOfChange={state.type.typeOfChange}>
          <Box>{state.type.name}</Box>
        </S.ArrayItemWrapper>
      </Box>
      <Typography variant='subtitle1'>Entities</Typography>
      {state.entities.map(
        item =>
          item.id && (
            <S.ArrayItemWrapper key={item.id} $typeOfChange={item.typeOfChange}>
              <Button
                text={item.name}
                to={dataEntityOverviewPath(item.id)}
                buttonType='tertiary-m'
                sx={{
                  mb: item.typeOfChange ? 0 : 0.5,
                  backgroundColor: item.typeOfChange ? 'inherit !important' : '',
                }}
              />
            </S.ArrayItemWrapper>
          )
      )}
    </Grid>
  );

  return (
    <Grid container flexDirection='column'>
      <ActivityFieldHeader
        startText='Custom group'
        activityName={oldValues.internalName.name}
        eventType='updated'
        showDetailsBtn
        detailsBtnOnClick={() => setIsDetailsOpen(!isDetailsOpen)}
        isDetailsOpen={isDetailsOpen}
      />
      <ActivityFieldState
        stateDirection='row'
        isDetailsOpen={isDetailsOpen}
        oldStateChildren={!isEmpty(oldValues) && renderGroupItem(oldValues)}
        newStateChildren={!isEmpty(newValues) && renderGroupItem(newValues)}
      />
    </Grid>
  );
};
export default CustomGroupActivityField;
