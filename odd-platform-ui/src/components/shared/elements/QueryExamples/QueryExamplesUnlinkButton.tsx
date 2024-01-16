import React from 'react';
import { useTranslation } from 'react-i18next';
import type { DataEntity, QueryExample } from 'generated-sources';
import { useUnassignEntityQueryExample } from 'lib/hooks/api/dataModelling/queryExamples';
import Button from '../Button/Button';
import { UnlinkIcon } from '../../icons';
import ConfirmationDialog from '../ConfirmationDialog/ConfirmationDialog';

interface Props {
  dataEntityId: DataEntity['id'];
  queryExampleId: QueryExample['id'];
}

const QueryExamplesUnlinkButton = ({ dataEntityId, queryExampleId }: Props) => {
  const { t } = useTranslation();
  const { mutateAsync: unlink } = useUnassignEntityQueryExample();
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
          dataEntityId,
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

export default QueryExamplesUnlinkButton;
