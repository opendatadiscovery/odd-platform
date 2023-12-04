import { Box, Grid } from '@mui/material';
import React from 'react';
import type { QueryExample } from 'generated-sources';
import { Permission } from 'generated-sources';
import { useScrollBarWidth } from 'lib/hooks';
import Button from 'components/shared/elements/Button/Button';
import { PreviewIcon, UnlinkIcon } from 'components/shared/icons';
import styled, { css } from 'styled-components';
import { WithPermissions } from 'components/shared/contexts';
import ConfirmationDialog from 'components/shared/elements/ConfirmationDialog/ConfirmationDialog';
import { useTranslation } from 'react-i18next';
import { useUnassignEntityQueryExample } from 'lib/hooks/api/dataModelling/queryExamples';
import { queryExamplesPath } from 'routes/dataModellingRoutes';
import { useIsEmbeddedPath } from 'lib/hooks/useAppPaths/useIsEmbeddedPath';
import TruncatedCell from '../TruncatedCell/TruncatedCell';
import Markdown from '../Markdown/Markdown';
import CollapsibleInfoContainer from '../CollapsibleInfoContainer/CollapsibleInfoContainer';

interface QueryExampleSearchResultsItemProps {
  queryExample: QueryExample;
  dataEntityId?: number;
}

const HiddenBox = styled(Box)(
  ({ theme }) => css`
    display: none;
    gap: ${theme.spacing(1)};
  `
);

const ListItemContainer = styled(Grid)(
  ({ theme }) => css`
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid ${theme.palette.divider};
    &:hover {
      ${HiddenBox} {
        display: flex;
      }
    }
  `
);

const QueryExamplesListItem = ({
  queryExample,
  dataEntityId,
}: QueryExampleSearchResultsItemProps) => {
  const scrollbarWidth = useScrollBarWidth();
  const { t } = useTranslation();
  const { mutateAsync } = useUnassignEntityQueryExample();
  const { updatePath } = useIsEmbeddedPath();

  return (
    <ListItemContainer key={queryExample.id} container pr={scrollbarWidth}>
      <Grid item xs={4} p={1}>
        <CollapsibleInfoContainer
          style={{ border: 'none' }}
          initialMaxHeight={96}
          content={<Markdown value={queryExample.definition} disableCopy />}
        />
      </Grid>
      <Grid item xs={4} p={1}>
        <CollapsibleInfoContainer
          style={{ border: 'none' }}
          initialMaxHeight={96}
          content={<Markdown value={queryExample.query} disableCopy />}
        />
      </Grid>
      <Grid item xs={3} p={1} alignItems='center'>
        <TruncatedCell dataList={queryExample.linkedEntities} externalEntityId={1} />
      </Grid>
      <Grid item xs={1} p={1} alignItems='center'>
        <HiddenBox>
          <Button
            buttonType='linkGray-m-icon'
            icon={<PreviewIcon />}
            to={updatePath(queryExamplesPath(queryExample.id))}
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
              actionBtn={<Button buttonType='linkGray-m-icon' icon={<UnlinkIcon />} />}
            />
          </WithPermissions>
        </HiddenBox>
      </Grid>
    </ListItemContainer>
  );
};

export default QueryExamplesListItem;
