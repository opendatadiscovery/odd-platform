import React, { type FC, useCallback } from 'react';
import { Permission, type TermRef } from 'generated-sources';
import { WithPermissions } from 'components/shared/contexts';
import { Button, CollapsibleInfoContainer, InfoItem } from 'components/shared/elements';
import { DeleteIcon } from 'components/shared/icons';
import { useAppPaths, useDeleteDatasetFieldTerm } from 'lib/hooks';

interface TermItemProps {
  name: TermRef['name'];
  definition: TermRef['definition'];
  termId: TermRef['id'];
  datasetFieldId: number;
  removeTerm: (termId: number) => void;
}

const TermItem: FC<TermItemProps> = ({
  name,
  definition,
  termId,
  datasetFieldId,
  removeTerm,
}) => {
  const { mutateAsync: deleteTerm } = useDeleteDatasetFieldTerm();

  const { termDetailsOverviewPath } = useAppPaths();
  const termDetailsLink = termDetailsOverviewPath(termId);

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      deleteTerm({ datasetFieldId, termId })
        .then(() => removeTerm(termId))
        .catch();
    },
    [deleteTerm, datasetFieldId, termId, removeTerm]
  );

  return (
    <InfoItem
      labelWidth={4}
      label={<Button to={termDetailsLink} buttonType='link-m' text={name} />}
      info={
        <CollapsibleInfoContainer
          content={<>{definition}</>}
          actions={
            <WithPermissions permissionTo={Permission.DATASET_FIELD_DELETE_TERM}>
              <Button
                sx={{ mt: 0.25 }}
                buttonType='link-m'
                icon={<DeleteIcon />}
                onClick={handleDelete}
              />
            </WithPermissions>
          }
        />
      }
    />
  );
};

export default TermItem;
