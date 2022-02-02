import React from 'react';
import { Grid, Typography } from '@mui/material';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { DataEntity, DataEntityTypeNameEnum } from 'generated-sources';
import { SearchTotalsByName, SearchType } from 'redux/interfaces/search';
import EntityTypeItem from 'components/shared/EntityTypeItem/EntityTypeItem';
import { dataEntityDetailsPath } from 'lib/paths';
import TruncatedCell from 'components/shared/TruncatedCell/TruncatedCell';
import InformationIcon from 'components/shared/Icons/InformationIcon';
import { ColContainer } from 'components/Search/Results/ResultsStyles';
import ResultItemPreviewContainer from 'components/Search/Results/ResultItem/ResultItemPreview/ResultItemPreviewContainer';
import AppTooltip from 'components/shared/AppTooltip/AppTooltip';
import { Container, ItemLink } from './ResultItemStyles';

interface ResultItemProps {
  searchType?: SearchType;
  totals: SearchTotalsByName;
  searchResult: DataEntity;
}

const ResultItem: React.FC<ResultItemProps> = ({
  searchResult,
  searchType,
  totals,
}) => {
  const detailsLink = dataEntityDetailsPath(searchResult.id);

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
          <ColContainer
            $colType="col"
            container
            item
            justifyContent="flex-start"
            wrap="nowrap"
            $noPaddings
          >
            <Typography
              variant="body1"
              noWrap
              title={
                searchResult.internalName || searchResult.externalName
              }
            >
              {searchResult.internalName || searchResult.externalName}
            </Typography>
            <AppTooltip
              maxWidth={285}
              sx={{ ml: 1.25, pr: 0.25 }}
              checkForOverflow={false}
              isOverflowed={false}
              title={({ open }) => (
                <ResultItemPreviewContainer
                  dataEntityId={searchResult.id}
                  fetchData={open}
                />
              )}
            >
              <InformationIcon sx={{ display: 'flex' }} />
            </AppTooltip>
          </ColContainer>
          <Grid
            container
            item
            justifyContent="flex-end"
            wrap="nowrap"
            flexBasis={0}
          >
            {!searchType ||
              (typeof searchType === 'string' &&
                searchResult.types?.map(type => (
                  <EntityTypeItem
                    sx={{ ml: 0.5 }}
                    key={type.id}
                    typeName={type.name}
                  />
                )))}
          </Grid>
        </ColContainer>
        {searchType &&
        searchType === totals[DataEntityTypeNameEnum.SET]?.id ? (
          <>
            <ColContainer item $colType="colxs">
              <Typography variant="body1" noWrap>
                {searchResult.stats?.consumersCount}
              </Typography>
            </ColContainer>
            <ColContainer item $colType="colxs">
              <Typography variant="body1" noWrap>
                {searchResult.stats?.rowsCount}
              </Typography>
            </ColContainer>
            <ColContainer item $colType="colxs">
              <Typography variant="body1" noWrap>
                {searchResult.stats?.fieldsCount}
              </Typography>
            </ColContainer>
          </>
        ) : null}
        {searchType &&
        searchType === totals[DataEntityTypeNameEnum.TRANSFORMER]?.id ? (
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
        {searchType &&
        searchType === totals[DataEntityTypeNameEnum.CONSUMER]?.id ? (
          <ColContainer item $colType="collg">
            <TruncatedCell
              dataList={searchResult.inputList}
              externalEntityId={searchResult.id}
            />
          </ColContainer>
        ) : null}
        {searchType &&
        searchType === totals[DataEntityTypeNameEnum.QUALITY_TEST]?.id ? (
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
        {searchType &&
        searchType === totals[DataEntityTypeNameEnum.ENTITY_GROUP]?.id ? (
          <ColContainer item $colType="colxs">
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
