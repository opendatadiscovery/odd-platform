import React from 'react';
import { Typography, Grid } from '@material-ui/core';
import { format } from 'date-fns';
import { FormProvider, useForm } from 'react-hook-form';
import {
  MetadataFieldValue,
  MetadataFieldType,
  DataEntityApiUpsertDataEntityMetadataFieldValueRequest,
  MetadataFieldValueUpdateFormData,
  DataEntityApiDeleteDataEntityMetadataFieldValueRequest,
} from 'generated-sources';
import TextFormatted from 'components/shared/TextFormatted/TextFormatted';
import ConfirmationDialog from 'components/shared/ConfirmationDialog/ConfirmationDialog';
import BooleanFormatted from 'components/shared/BooleanFormatted/BooleanFormatted';
import AppButton from 'components/shared/AppButton/AppButton';
import DeleteIcon from 'components/shared/Icons/DeleteIcon';
import EditIcon from 'components/shared/Icons/EditIcon';
import MetadataValueEditField from 'components/DataEntityDetails/Metadata/MetadataValueEditor/MetadataValueEditor';
import { StylesType } from './MetadataItemStyles';

interface MetadataItemProps extends StylesType {
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
  classes,
  dataEntityId,
  metadataItem,
  deleteDataEntityCustomMetadata,
  updateDataEntityCustomMetadata,
}) => {
  const [editMode, setEditMode] = React.useState<boolean>(false);
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
        metadataVal = <BooleanFormatted value={metadataItem.value} />;
        break;
      case MetadataFieldType.DATETIME:
        metadataVal = format(new Date(metadataItem.value), 'd MMM yyyy');
        break;
      case MetadataFieldType.ARRAY:
        metadataVal = JSON.parse(metadataItem.value).join(', ');
        break;
      default:
        metadataVal = metadataItem.value;
    }
  } catch {
    metadataVal = metadataItem.value;
  }

  const isCustom = metadataItem.field.origin === 'INTERNAL';
  const isNestedField = (fieldName: string) => fieldName?.indexOf('.') > 0;

  return (
    <Grid container className={classes.container}>
      <Grid item sm={5} className={classes.labelContainer}>
        <Typography variant="subtitle1" className={classes.label} noWrap>
          {isNestedField(metadataItem.field.name) ? (
            metadataItem.field.name
          ) : (
            <TextFormatted value={metadataItem.field.name} />
          )}
        </Typography>
      </Grid>
      <Grid item container sm={7} zeroMinWidth wrap="nowrap">
        {editMode ? (
          <FormProvider {...methods}>
            <form
              className={classes.editForm}
              onSubmit={methods.handleSubmit(handleUpdate)}
            >
              <MetadataValueEditField
                fieldName="value"
                metadataType={metadataItem.field.type}
                metadataValue={metadataItem.value}
                size="small"
              />
              <div className={classes.formActionBtns}>
                <AppButton
                  type="submit"
                  size="medium"
                  color="primaryLight"
                >
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
              </div>
            </form>
          </FormProvider>
        ) : (
          <div className={classes.valueContainer}>
            <Typography variant="body1" className={classes.value}>
              {metadataVal}
            </Typography>
            {isCustom ? (
              <div className={classes.actions}>
                <AppButton
                  size="small"
                  color="tertiary"
                  icon={<EditIcon />}
                  onClick={() => {
                    setEditMode(true);
                  }}
                />
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
                    <AppButton
                      size="small"
                      color="tertiary"
                      icon={<DeleteIcon />}
                      onClick={() => {}}
                    />
                  }
                />
              </div>
            ) : null}
          </div>
        )}
      </Grid>
    </Grid>
  );
};

export default MetadataItem;
