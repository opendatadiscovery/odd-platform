import React from 'react';
import { Typography } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import AppButton from 'components/shared/AppButton/AppButton';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import {
  Container,
  EditBtnContainer,
  ValueDescriptionContainer,
  ValueNameContainer,
} from './DatasetFieldEnumsFormItemStyles';

interface DatasetFieldEnumsFormItemProps {
  itemIndex: number;
  onItemRemove: () => void;
}

const DatasetFieldEnumsFormItem: React.FC<DatasetFieldEnumsFormItemProps> = ({
  itemIndex,
  onItemRemove,
}) => {
  const { control, getValues } = useFormContext();
  const [editMode, setEditMode] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (!getValues(`enums.${itemIndex}.name`)) {
      setEditMode(true);
    }
  }, [itemIndex]);

  return (
    <Container container>
      {editMode ? (
        <>
          <Controller
            name={`enums.${itemIndex}.name`}
            control={control}
            rules={{ required: true, validate: value => !!value.trim() }}
            render={({ field }) => (
              <ValueNameContainer sx={{ mr: 1 }}>
                <AppTextField
                  {...field}
                  placeholder="Name of value"
                  name={`enums.${itemIndex}.name`}
                  customEndAdornment={{
                    variant: 'clear',
                    showAdornment: !!field.value,
                    onCLick: () => field.onChange(''),
                    icon: <ClearIcon />,
                  }}
                />
              </ValueNameContainer>
            )}
          />
          <Controller
            name={`enums.${itemIndex}.description`}
            control={control}
            render={({ field }) => (
              <ValueDescriptionContainer sx={{ mr: 1 }}>
                <AppTextField
                  {...field}
                  sx={{ mr: 1 }}
                  placeholder="Description"
                  name={`enums.${itemIndex}.description`}
                  customEndAdornment={{
                    variant: 'clear',
                    showAdornment: !!field.value,
                    onCLick: () => field.onChange(''),
                    icon: <ClearIcon />,
                  }}
                />
              </ValueDescriptionContainer>
            )}
          />
          <AppButton size="small" color="dropdown" onClick={onItemRemove}>
            Delete
          </AppButton>
        </>
      ) : (
        <>
          <ValueNameContainer sx={{ mr: 1, px: 1 }}>
            <Typography variant="body1">
              {getValues(`enums.${itemIndex}.name`)}
            </Typography>
          </ValueNameContainer>
          <ValueDescriptionContainer sx={{ mr: 1, px: 1 }}>
            <Typography variant="body1" color="texts.secondary">
              {getValues(`enums.${itemIndex}.description`)}
            </Typography>
          </ValueDescriptionContainer>
          <EditBtnContainer>
            <AppButton
              size="medium"
              color="primaryLight"
              onClick={() => setEditMode(true)}
            >
              Edit
            </AppButton>
          </EditBtnContainer>
        </>
      )}
    </Container>
  );
};

export default DatasetFieldEnumsFormItem;
