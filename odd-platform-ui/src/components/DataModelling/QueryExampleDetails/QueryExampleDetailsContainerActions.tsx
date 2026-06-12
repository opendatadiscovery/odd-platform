import React, { useCallback } from 'react';
import { useDeleteQueryExample } from 'lib/hooks/api/dataModelling/queryExamples';
import {
  AppMenuItem,
  AppPopover,
  Button,
  ConfirmationDialog,
} from 'components/shared/elements';
import { EditIcon, KebabIcon } from 'components/shared/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { queryExamplesPath } from 'routes';
import { WithPermissions } from 'components/shared/contexts';
import type { QueryExampleDetails } from 'generated-sources';
import { Permission } from 'generated-sources';
import QueryExampleForm from '../QueryExampleForm/QueryExampleForm';

interface QueryExampleDetailsContainerActionsProps {
  queryExampleDetails: QueryExampleDetails;
}

export const QueryExampleDetailsContainerActions: React.FC<
  QueryExampleDetailsContainerActionsProps
> = ({ queryExampleDetails }) => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { mutateAsync: deleteQueryExample } = useDeleteQueryExample();

  const handleDelete = useCallback(
    async (id: number) => {
      await deleteQueryExample({ exampleId: id });
      navigate(queryExamplesPath());
    },
    [queryExampleDetails?.id]
  );

  return (
    <>
      <WithPermissions permissionTo={Permission.QUERY_EXAMPLE_UPDATE}>
        <QueryExampleForm
          btnCreateEl={
            <Button
              text={t('Edit')}
              buttonType='secondary-m'
              startIcon={<EditIcon />}
              sx={{ ml: 1 }}
            />
          }
          queryExampleDetails={queryExampleDetails}
        />
      </WithPermissions>
      <WithPermissions permissionTo={Permission.QUERY_EXAMPLE_DELETE}>
        <AppPopover
          renderOpenBtn={({ onClick, ariaDescribedBy }) => (
            <Button
              aria-describedby={ariaDescribedBy}
              buttonType='secondary-m'
              icon={<KebabIcon />}
              onClick={onClick}
              sx={{ ml: 1 }}
            />
          )}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: -5, horizontal: 67 }}
        >
          <ConfirmationDialog
            actionTitle={t('Are you sure you want to delete this query example?')}
            actionName={t('Delete query example')}
            actionText={
              <>
                Query Example #{queryExampleDetails.id} {t('will be deleted permanently')}
              </>
            }
            onConfirm={() => handleDelete(queryExampleDetails.id)}
            actionBtn={<AppMenuItem>{t('Delete')}</AppMenuItem>}
          />
        </AppPopover>
      </WithPermissions>
    </>
  );
};
