import React, { HTMLInputTypeAttribute } from 'react';
import { Typography } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import AppButton from 'components/shared/AppButton/AppButton';
import AppInput from 'components/shared/AppInput/AppInput';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import { DataSetFieldTypeTypeEnum } from 'generated-sources';
import {
  Container,
  EditBtnContainer,
  ValueDescriptionContainer,
  ValueNameContainer,
} from './DatasetFieldEnumsFormItemStyles';

interface DatasetFieldEnumsFormItemProps {
  itemIndex: number;
  itemId: number;
  onItemRemove: () => void;
  enumValueType: DataSetFieldTypeTypeEnum;
}

const DatasetFieldEnumsFormItem: React.FC<
  DatasetFieldEnumsFormItemProps
> = ({ itemIndex, onItemRemove, enumValueType, itemId }) => {
  const { control, getValues } = useFormContext();
  const [editMode, setEditMode] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (typeof itemId !== 'number') {
      setEditMode(true);
    }
  }, [itemIndex]);

  const setTextFieldType = (): HTMLInputTypeAttribute => {
    if (enumValueType === DataSetFieldTypeTypeEnum.INTEGER)
      return 'number';
    return 'text';
  };

  const setTextValidationByType = (value: number | string) => {
    if (
      enumValueType === DataSetFieldTypeTypeEnum.STRING &&
      typeof value === 'string'
    )
      return !!value.trim();
    return Number.isInteger(Number(value));
  };

  return (
    <Container container>
      {editMode ? (
        <>
          <Controller
            name={`enums.${itemIndex}.name`}
            control={control}
            defaultValue={getValues(`enums.${itemIndex}.name`)}
            rules={{
              required: true,
              validate: setTextValidationByType,
            }}
            render={({ field }) => (
              <ValueNameContainer sx={{ mr: 1 }}>
                <AppInput
                  {...field}
                  placeholder="Name of value"
                  name={`enums.${itemIndex}.name`}
                  type={setTextFieldType()}
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
            defaultValue={getValues(`enums.${itemIndex}.description`)}
            control={control}
            render={({ field }) => (
              <ValueDescriptionContainer sx={{ mr: 1 }}>
                <AppInput
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
