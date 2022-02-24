import React from 'react';
import { Grid } from '@mui/material';
import { format } from 'date-fns';
import { FormProvider, useForm } from 'react-hook-form';
import {
  DataEntityApiDeleteDataEntityMetadataFieldValueRequest,
  DataEntityApiUpsertDataEntityMetadataFieldValueRequest,
  MetadataFieldType,
  MetadataFieldValue,
  MetadataFieldValueUpdateFormData,
} from 'generated-sources';
import TextFormatted from 'components/shared/TextFormatted/TextFormatted';
import ConfirmationDialog from 'components/shared/ConfirmationDialog/ConfirmationDialog';
import DeleteIcon from 'components/shared/Icons/DeleteIcon';
import EditIcon from 'components/shared/Icons/EditIcon';
import AppButton from 'components/shared/AppButton/AppButton';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import CopyButton from 'components/shared/CopyButton/CopyButton';
import DropdownIcon from 'components/shared/Icons/DropdownIcon';
import MetadataValueEditor from 'components/DataEntityDetails/Metadata/MetadataValueEditor/MetadataValueEditor';
import * as S from './MetadataItemStyles';

interface MetadataItemProps {
  dataEntityId: number;
  metadataItem: MetadataFieldValue;
  deleteDataEntityCustomMetadata: (
    params: DataEntityApiDeleteDataEntityMetadataFieldValueRequest
  ) => Promise<void>;
  updateDataEntityCustomMetadata: (
    params: DataEntityApiUpsertDataEntityMetadataFieldValueRequest
  ) => Promise<MetadataFieldValue>;
}

const MetadataItem: React.FC<MetadataItemProps> = ({
  dataEntityId,
  metadataItem,
  deleteDataEntityCustomMetadata,
  updateDataEntityCustomMetadata,
}) => {
  const [editMode, setEditMode] = React.useState<boolean>(false);
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);

  const methods = useForm<MetadataFieldValueUpdateFormData>({
    mode: 'onChange',
  });

  const handleUpdate = (data: MetadataFieldValueUpdateFormData) =>
    updateDataEntityCustomMetadata({
      dataEntityId,
      metadataFieldId: metadataItem.field.id,
      metadataFieldValueUpdateFormData: data,
    }).then(() => {
      setEditMode(false);
    });

  const handleDelete = () =>
    deleteDataEntityCustomMetadata({
      dataEntityId,
      metadataFieldId: metadataItem.field.id,
    });

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
        <S.Label variant="subtitle1" noWrap>
          {isNestedField(metadataItem.field.name) ? (
            metadataItem.field.name
          ) : (
            <TextFormatted value={metadataItem.field.name} />
          )}
        </S.Label>
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
                <AppButton type="submit" size="medium" color="primary">
                  Save
                </AppButton>
                <AppButton
                  onClick={() => setEditMode(false)}
                  type="button"
                  size="medium"
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
                  size="small"
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
