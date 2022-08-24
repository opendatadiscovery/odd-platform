import React from 'react';
import { Grid, Typography } from '@mui/material';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { DataEntity, DataEntityClassNameEnum } from 'generated-sources';
import { SearchClass, SearchTotalsByName } from 'redux/interfaces';
import {
  AppTooltip,
  EntityClassItem,
  NumberFormatted,
  TruncatedCell,
} from 'components/shared';
import { InformationIcon } from 'components/shared/Icons';
import { useAppPaths } from 'lib/hooks';
import { ColContainer, NameContainer } from '../ResultsStyles';
import ResultItemPreview from './ResultItemPreview/ResultItemPreview';
import { Container, ItemLink } from './ResultItemStyles';

interface ResultItemProps {
  searchClass?: SearchClass;
  totals: SearchTotalsByName;
  searchResult: DataEntity;
}

const ResultItem: React.FC<ResultItemProps> = ({
  searchResult,
  searchClass,
  totals,
}) => {
  const { dataEntityDetailsPath } = useAppPaths();
  const detailsLink = dataEntityDetailsPath(searchResult.id);

  const resultItemPreview = React.useCallback(
    ({ open }) => (
      <ResultItemPreview dataEntityId={searchResult.id} fetchData={open} />
    ),
    [searchResult.id]
  );

  return (
    <ItemLink to={detailsLink}>
      <Container container>
        <ColContainer
          $colType="collg"
          item
          container
          justifyContent="space-between"
          wrap="nowrap"
        >
          <NameContainer container item>
            <Typography
              variant="body1"
              noWrap
              title={
                searchResult.internalName || searchResult.externalName
              }
            >
              {searchResult.internalName || searchResult.externalName}
            </Typography>
            <AppTooltip checkForOverflow={false} title={resultItemPreview}>
              <InformationIcon sx={{ ml: 1.25 }} />
            </AppTooltip>
          </NameContainer>
          <Grid
            container
            item
            justifyContent="flex-end"
            wrap="nowrap"
            flexBasis={0}
          >
            {!searchClass ||
              (typeof searchClass === 'string' &&
                searchResult.entityClasses?.map(entityClass => (
                  <EntityClassItem
                    sx={{ ml: 0.5 }}
                    key={entityClass.id}
                    entityClassName={entityClass.name}
                  />
                )))}
          </Grid>
        </ColContainer>
        {searchClass &&
        searchClass === totals[DataEntityClassNameEnum.SET]?.id ? (
          <>
            <ColContainer item $colType="colxs">
              <Typography variant="body1" noWrap>
                {searchResult.stats?.consumersCount}
              </Typography>
            </ColContainer>
            <ColContainer item $colType="colxs">
              <Typography variant="body1" noWrap>
                <NumberFormatted value={searchResult.stats?.rowsCount} />
              </Typography>
            </ColContainer>
            <ColContainer item $colType="colxs">
              <Typography variant="body1" noWrap>
                {searchResult.stats?.fieldsCount}
              </Typography>
            </ColContainer>
          </>
        ) : null}
        {searchClass &&
        searchClass === totals[DataEntityClassNameEnum.TRANSFORMER]?.id ? (
          <>
            <ColContainer $colType="collg" item container wrap="wrap">
              <TruncatedCell
                dataList={searchResult.sourceList}
                externalEntityId={searchResult.id}
              />
            </ColContainer>
            <ColContainer item $colType="collg">
              <TruncatedCell
                dataList={searchResult.targetList}
                externalEntityId={searchResult.id}
              />
            </ColContainer>
          </>
        ) : null}
        {searchClass &&
        searchClass === totals[DataEntityClassNameEnum.CONSUMER]?.id ? (
          <ColContainer item $colType="collg">
            <TruncatedCell
              dataList={searchResult.inputList}
              externalEntityId={searchResult.id}
            />
          </ColContainer>
        ) : null}
        {searchClass &&
        searchClass ===
          totals[DataEntityClassNameEnum.QUALITY_TEST]?.id ? (
          <>
            <ColContainer item container wrap="wrap" $colType="collg">
              <TruncatedCell
                dataList={searchResult.datasetsList}
                externalEntityId={searchResult.id}
              />
            </ColContainer>
            <ColContainer item $colType="collg">
              <TruncatedCell
                dataList={searchResult.linkedUrlList}
                externalEntityId={searchResult.id}
              />
            </ColContainer>
          </>
        ) : null}
        {searchClass &&
        searchClass ===
          totals[DataEntityClassNameEnum.ENTITY_GROUP]?.id ? (
          <ColContainer item $colType="colsm">
            <Typography variant="body1" noWrap>
              {searchResult?.itemsCount}
            </Typography>
          </ColContainer>
        ) : null}
        <ColContainer item $colType="colmd">
          <Typography
            variant="body1"
            title={searchResult.dataSource.namespace?.name}
            noWrap
          >
            {searchResult.dataSource.namespace?.name}
          </Typography>
        </ColContainer>
        <ColContainer item $colType="colmd">
          <Typography
            variant="body1"
            title={searchResult.dataSource?.name}
            noWrap
          >
            {searchResult.dataSource?.name}
          </Typography>
        </ColContainer>
        <ColContainer item $colType="colmd">
          <Grid container direction="column" alignItems="flex-start">
            {searchResult.ownership?.map(ownership => (
              <Grid item key={ownership.id}>
                <Typography
                  variant="body1"
                  title={ownership.owner.name}
                  noWrap
                >
                  {ownership.owner.name}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </ColContainer>
        <ColContainer item $colType="colsm">
          <Typography
            variant="body1"
            title={
              searchResult.createdAt
                ? format(searchResult.createdAt, 'd MMM yyyy')
                : undefined
            }
            noWrap
          >
            {searchResult.createdAt
              ? format(searchResult.createdAt, 'd MMM yyyy')
              : null}
          </Typography>
        </ColContainer>
        <ColContainer item $colType="colsm">
          <Typography
            variant="body1"
            title={
              searchResult.updatedAt
                ? formatDistanceToNowStrict(searchResult.updatedAt, {
                    addSuffix: true,
                  })
                : undefined
            }
            noWrap
          >
            {searchResult.updatedAt
              ? formatDistanceToNowStrict(searchResult.updatedAt, {
                  addSuffix: true,
                })
              : null}
          </Typography>
        </ColContainer>
      </Container>
    </ItemLink>
  );
};

export default ResultItem;
