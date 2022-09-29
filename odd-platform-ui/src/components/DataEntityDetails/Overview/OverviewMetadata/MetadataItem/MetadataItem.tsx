import React from 'react';
import { Grid } from '@mui/material';
import { format } from 'date-fns';
import { FormProvider, useForm } from 'react-hook-form';
import {
  MetadataFieldType,
  MetadataFieldValue,
  MetadataFieldValueUpdateFormData,
} from 'generated-sources';
import {
  DeleteIcon,
  EditIcon,
  DropdownIcon,
} from 'components/shared/Icons';
import {
  AppTooltip,
  CopyButton,
  AppButton,
  AppIconButton,
  ConfirmationDialog,
  TextFormatted,
} from 'components/shared';
import { stringFormatted } from 'lib/helpers';
import { useAppDispatch } from 'redux/lib/hooks';
import {
  deleteDataEntityCustomMetadata,
  updateDataEntityCustomMetadata,
} from 'redux/thunks';
import { usePermissions } from 'lib/hooks';
import MetadataValueEditor from '../../../Metadata/MetadataValueEditor/MetadataValueEditor';
import * as S from './MetadataItemStyles';

interface MetadataItemProps {
  dataEntityId: number;
  metadataItem: MetadataFieldValue;
}

const MetadataItem: React.FC<MetadataItemProps> = ({
  dataEntityId,
  metadataItem,
}) => {
  const dispatch = useAppDispatch();
  const { isAllowedTo: editDataEntity } = usePermissions({ dataEntityId });

  const [editMode, setEditMode] = React.useState<boolean>(false);
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);

  const methods = useForm<MetadataFieldValueUpdateFormData>({
    mode: 'onChange',
  });

  const handleUpdate = (data: MetadataFieldValueUpdateFormData) =>
    dispatch(
      updateDataEntityCustomMetadata({
        dataEntityId,
        metadataFieldId: metadataItem.field.id,
        metadataFieldValueUpdateFormData: data,
      })
    ).then(() => {
      setEditMode(false);
    });

  const handleDelete = () =>
    dispatch(
      deleteDataEntityCustomMetadata({
        dataEntityId,
        metadataFieldId: metadataItem.field.id,
      })
    );

  let metadataVal;

  try {
    switch (metadataItem.field.type) {
      case MetadataFieldType.BOOLEAN:
        metadataVal = metadataItem.value === 'true' ? 'Yes' : 'No';
        break;
      case MetadataFieldType.DATETIME:
        metadataVal = format(new Date(metadataItem.value), 'd MMM yyyy');
        break;
      case MetadataFieldType.ARRAY:
        metadataVal = JSON.parse(metadataItem.value).join(', ');
        break;
      case MetadataFieldType.JSON:
        metadataVal = JSON.stringify(
          JSON.parse(metadataItem.value),
          null,
          2
        );
        break;
      default:
        metadataVal = metadataItem.value;
    }
  } catch {
    metadataVal = metadataItem.value;
  }

  const isJSON = metadataItem.field.type === MetadataFieldType.JSON;
  const isExpandable = isJSON ? true : metadataVal.length > 200;

  const isCustom = metadataItem.field.origin === 'INTERNAL';

  const isNestedField = (fieldName: string) => fieldName?.indexOf('.') > 0;

  return (
    <S.Container container wrap="nowrap">
      <S.LabelContainer item sm={2}>
        <AppTooltip
          title={() =>
            isNestedField(metadataItem.field.name)
              ? metadataItem.field.name
              : stringFormatted(
                  metadataItem.field.name,
                  '_',
                  'firstLetterOfString'
                )
          }
        >
          <S.Label variant="subtitle1" noWrap>
            {isNestedField(metadataItem.field.name) ? (
              metadataItem.field.name
            ) : (
              <TextFormatted value={metadataItem.field.name} />
            )}
          </S.Label>
        </AppTooltip>
      </S.LabelContainer>
      <Grid item container wrap="nowrap" zeroMinWidth>
        {editMode ? (
          <FormProvider {...methods}>
            <S.EditForm onSubmit={methods.handleSubmit(handleUpdate)}>
              <MetadataValueEditor
                fieldName="value"
                metadataType={metadataItem.field.type}
                metadataValue={metadataItem.value}
                size="small"
              />
              <S.FormActionBtns>
                <AppButton type="submit" size="small" color="primary">
                  Save
                </AppButton>
                <AppButton
                  onClick={() => setEditMode(false)}
                  type="button"
                  size="small"
                  color="tertiary"
                >
                  Cancel
                </AppButton>
              </S.FormActionBtns>
            </S.EditForm>
          </FormProvider>
        ) : (
          <S.ValueContainer>
            <S.ValueLeftContainer>
              <S.Value $isOpened={isExpanded}>{metadataVal}</S.Value>
              {isExpandable && (
                <AppButton
                  size="medium"
                  color="tertiary"
                  sx={{ mt: 1.25 }}
                  onClick={() => setIsExpanded(!isExpanded)}
                  endIcon={
                    <DropdownIcon
                      transform={isExpanded ? 'rotate(180)' : 'rotate(0)'}
                    />
                  }
                >
                  {isExpanded ? 'Hide' : `Show All`}
                </AppButton>
              )}
            </S.ValueLeftContainer>
            {isCustom ? (
              <S.Actions>
                <AppIconButton
                  size="small"
                  color="tertiary"
                  icon={<EditIcon />}
                  disabled={!editDataEntity}
                  onClick={() => {
                    setEditMode(true);
                  }}
                />
                {metadataVal && (
                  <CopyButton
                    stringToCopy={metadataVal}
                    sx={{ ml: 0.5 }}
                  />
                )}
                <ConfirmationDialog
                  actionTitle="Are you sure you want to delete this Metadata?"
                  actionName="Delete Metadata"
                  actionText={
                    <>
                      &quot;{metadataItem.field.name}&quot; will be deleted
                      permanently.
                    </>
                  }
                  onConfirm={handleDelete}
                  actionBtn={
                    <AppIconButton
                      size="small"
                      color="tertiary"
                      icon={<DeleteIcon />}
                      disabled={!editDataEntity}
                      sx={{ ml: 0.5 }}
                    />
                  }
                />
              </S.Actions>
            ) : null}
          </S.ValueContainer>
        )}
      </Grid>
    </S.Container>
  );
};
export default MetadataItem;
