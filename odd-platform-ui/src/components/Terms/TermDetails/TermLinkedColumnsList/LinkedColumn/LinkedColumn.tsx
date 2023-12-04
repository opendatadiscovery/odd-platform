import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { DatasetFieldList } from 'generated-sources';
import { AppTooltip } from 'components/shared/elements';
import { StrokedInfoIcon } from 'components/shared/icons';
import TypeFieldLabel from 'components/DataEntityDetails/DatasetStructure/shared/TypeFieldLabel/TypeFieldLabel';
import { dataEntityDetailsPath } from 'routes';
import { useIsEmbeddedPath } from 'lib/hooks/useAppPaths/useIsEmbeddedPath';
import { Container, ColumnLink, NameContainer } from './LinkedColumnStyles';
import { TermLinkedColumnsColContainer } from '../LinkedColumnsListStyles';

interface LinkedColumnProps {
  linkedColumn: DatasetFieldList['items'][number];
}

const LinkedColumn: React.FC<LinkedColumnProps> = ({ linkedColumn }) => {
  const { updatePath } = useIsEmbeddedPath();
  const { t } = useTranslation();

  const detailsLink = updatePath(dataEntityDetailsPath(linkedColumn.dataEntityId!));

  return (
    <ColumnLink to={detailsLink}>
      <Container container>
        <TermLinkedColumnsColContainer
          $colType='collg'
          item
          container
          justifyContent='space-between'
          wrap='nowrap'
        >
          <NameContainer container item>
            <Box display='flex' flexWrap='nowrap' alignItems='center' overflow='hidden'>
              <Typography
                ml={0.5}
                variant='body1'
                noWrap
                title={linkedColumn.name ?? linkedColumn.internalName}
              >
                {linkedColumn.name ?? linkedColumn.internalName}
              </Typography>
            </Box>
          </NameContainer>
          <Grid
            container
            item
            justifyContent='flex-end'
            wrap='nowrap'
            flexBasis={0}
            alignItems='center'
          >
            <AppTooltip
              title={`${t('Logical type')}: ${linkedColumn.type.logicalType}`}
              type='dark'
              checkForOverflow={false}
              childSx={{ display: 'flex' }}
            >
              <StrokedInfoIcon />
            </AppTooltip>
            <TypeFieldLabel typeName={linkedColumn.type.type} sx={{ ml: 1 }} />
          </Grid>
        </TermLinkedColumnsColContainer>
        <TermLinkedColumnsColContainer item $colType='colmd'>
          <Typography variant='body1' title={linkedColumn.dataEntityName} noWrap>
            {linkedColumn.dataEntityName}
          </Typography>
        </TermLinkedColumnsColContainer>
        <TermLinkedColumnsColContainer item $colType='colmd'>
          <Typography
            variant='body1'
            title={linkedColumn.dataSource?.namespace?.name}
            noWrap
          >
            {linkedColumn.dataSource?.namespace?.name}
          </Typography>
        </TermLinkedColumnsColContainer>
        <TermLinkedColumnsColContainer item $colType='colsm'>
          <Typography variant='body1' title={linkedColumn.dataSource?.name} noWrap>
            {linkedColumn.dataSource?.name}
          </Typography>
        </TermLinkedColumnsColContainer>
        <TermLinkedColumnsColContainer item $colType='colsm'>
          <Grid container direction='column' alignItems='flex-start'>
            {linkedColumn.ownership?.map(ownership => (
              <Grid item key={ownership.id}>
                <Typography variant='body1' title={ownership.owner.name} noWrap>
                  {ownership.owner.name}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </TermLinkedColumnsColContainer>
      </Container>
    </ColumnLink>
  );
};

export default LinkedColumn;
