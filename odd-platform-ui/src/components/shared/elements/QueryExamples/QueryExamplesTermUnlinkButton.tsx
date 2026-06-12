import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Term, QueryExample } from 'generated-sources';
import { useUnassignTermQueryExample } from 'lib/hooks';
import Button from '../Button/Button';
import { UnlinkIcon } from '../../icons';
import ConfirmationDialog from '../ConfirmationDialog/ConfirmationDialog';

interface Props {
  termId: Term['id'];
  queryExampleId: QueryExample['id'];
}

const QueryExamplesTermUnlinkButton = ({ termId, queryExampleId }: Props) => {
  const { t } = useTranslation();
  const { mutateAsync: unlink } = useUnassignTermQueryExample();
  return (
    <ConfirmationDialog
      actionTitle={t('Are you sure you want to unlink this query example?')}
      actionName={t('Unlink')}
      actionText={
        <>
          Query example #{queryExampleId} {t('will be unlinked')}.
        </>
      }
      onConfirm={() =>
        unlink({
          exampleId: queryExampleId,
          termId,
        })
      }
      actionBtn={
        <Button
          buttonType='linkGray-m-icon'
          icon={<UnlinkIcon />}
          sx={{ marginRight: 1 }}
        />
      }
    />
  );
};

export default QueryExamplesTermUnlinkButton;
