import React from 'react';
import type { QueryExample } from 'generated-sources';
import { Permission } from 'generated-sources';
import Button from 'components/shared/elements/Button/Button';
import { PreviewIcon, UnlinkIcon } from 'components/shared/icons';
import { WithPermissions } from 'components/shared/contexts';
import ConfirmationDialog from 'components/shared/elements/ConfirmationDialog/ConfirmationDialog';
import { useTranslation } from 'react-i18next';
import { useUnassignEntityQueryExample } from 'lib/hooks/api/dataModelling/queryExamples';
import { queryExamplesPath } from 'routes';
import TruncatedCell from '../TruncatedCell/TruncatedCell';
import Markdown from '../Markdown/Markdown';
import CollapsibleInfoContainer from '../CollapsibleInfoContainer/CollapsibleInfoContainer';
import * as Table from '../StyledComponents/Table';

interface QueryExampleSearchResultsItemProps {
  queryExample: QueryExample;
  dataEntityId?: number;
}

const QueryExamplesListItem = ({
  queryExample,
  dataEntityId,
}: QueryExampleSearchResultsItemProps) => {
  const { t } = useTranslation();
  const { mutateAsync } = useUnassignEntityQueryExample();

  return (
    <Table.RowContainer>
      <Table.Cell $flex='1 0 25%'>
        <CollapsibleInfoContainer
          style={{ border: 'none' }}
          initialMaxHeight={96}
          content={<Markdown value={queryExample.definition} disableCopy />}
        />
      </Table.Cell>
      <Table.Cell $flex='1 0 25%'>
        <CollapsibleInfoContainer
          style={{ border: 'none' }}
          initialMaxHeight={96}
          content={<Markdown value={queryExample.query} disableCopy />}
        />
      </Table.Cell>
      <Table.Cell $flex='1 0'>
        <TruncatedCell dataList={queryExample.linkedEntities} externalEntityId={1} />
      </Table.Cell>
      <Table.HiddenCell $flex='0 0 15%' $justifyContent='right'>
        <Button
          buttonType='linkGray-m-icon'
          sx={{ marginRight: 1 }}
          icon={<PreviewIcon />}
          to={queryExamplesPath(queryExample.id)}
        />
        <WithPermissions permissionTo={Permission.QUERY_EXAMPLE_DATASET_DELETE}>
          <ConfirmationDialog
            actionTitle={t('Are you sure you want to unlink this query example?')}
            actionName={t('Unlink')}
            actionText={
              <>
                Query example #{queryExample.id} {t('will be unlinked')}.
              </>
            }
            onConfirm={() =>
              mutateAsync({
                exampleId: queryExample.id,
                dataEntityId: dataEntityId ?? 0,
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
        </WithPermissions>
      </Table.HiddenCell>
    </Table.RowContainer>
  );
};

export default QueryExamplesListItem;
