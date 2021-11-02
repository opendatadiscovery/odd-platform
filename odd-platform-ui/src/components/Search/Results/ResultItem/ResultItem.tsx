import React from 'react';
import { Grid, Typography } from '@mui/material';
import { format, formatDistanceToNowStrict } from 'date-fns';
import {
  DataEntity,
  DataEntityApiGetDataEntityDetailsRequest,
  DataEntityDetails,
  DataEntityTypeNameEnum,
  MetadataFieldValue,
} from 'generated-sources';
import { SearchTotalsByName, SearchType } from 'redux/interfaces/search';
import EntityTypeItem from 'components/shared/EntityTypeItem/EntityTypeItem';
import { dataEntityDetailsPath } from 'lib/paths';
import ResultItemTruncatedCell from 'components/Search/Results/ResultItem/ResultItemTruncatedCell/ResultItemTruncatedCell';
import InformationIcon from 'components/shared/Icons/InformationIcon';
import AppTooltip from 'components/shared/AppTooltip/AppTooltip';
import { ColContainer } from 'components/Search/Results/ResultsStyles';
import ResultItemPreview from 'components/Search/Results/ResultItem/ResultItemPreview/ResultItemPreview';
import { Container, ItemLink } from './ResultItemStyles';

interface ResultItemProps {
  searchType?: SearchType;
  totals: SearchTotalsByName;
  searchResult: DataEntity;
  dataEntityDetails: DataEntityDetails;
  fetchDataEntityDetails: (
    params: DataEntityApiGetDataEntityDetailsRequest
  ) => void;
  isDataEntityLoading: boolean;
  predefinedMetadata: MetadataFieldValue[];
  customMetadata: MetadataFieldValue[];
}

const ResultItem: React.FC<ResultItemProps> = ({
  searchResult,
  searchType,
  totals,
  dataEntityDetails,
  fetchDataEntityDetails,
  isDataEntityLoading,
  predefinedMetadata,
  customMetadata,
}) => {
  const detailsLink = dataEntityDetailsPath(searchResult.id);

  const fetchDetails = React.useCallback(
    () => fetchDataEntityDetails({ dataEntityId: searchResult.id }),
    [searchResult.id]
  );

  const resultItemPreviewHandler = () => {
    if (!dataEntityDetails) return fetchDetails();
    return null;
  };

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
              sx={{ ml: 1.25 }}
              title={
                <ResultItemPreview
                  dataEntityDetails={dataEntityDetails}
                  isDataEntityLoading={isDataEntityLoading}
                  predefinedMetadata={predefinedMetadata}
                  customMetadata={customMetadata}
                />
              }
              offset={{ right: 140 }}
              onMouseEnterCallback={resultItemPreviewHandler}
            >
              <InformationIcon
                sx={{ display: 'flex', alignItems: 'center' }}
              />
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
              <ResultItemTruncatedCell
                searchResult={searchResult}
                truncatedCellType="sourceList"
              />
            </ColContainer>
            <ColContainer item $colType="collg">
              <ResultItemTruncatedCell
                searchResult={searchResult}
                truncatedCellType="targetList"
              />
            </ColContainer>
          </>
        ) : null}
        {searchType &&
        searchType === totals[DataEntityTypeNameEnum.CONSUMER]?.id ? (
          <ColContainer item $colType="collg">
            <ResultItemTruncatedCell
              searchResult={searchResult}
              truncatedCellType="inputList"
            />
          </ColContainer>
        ) : null}
        {searchType &&
        searchType === totals[DataEntityTypeNameEnum.QUALITY_TEST]?.id ? (
          <>
            <ColContainer item container wrap="wrap" $colType="collg">
              <ResultItemTruncatedCell
                searchResult={searchResult}
                truncatedCellType="datasetsList"
              />
            </ColContainer>
            <ColContainer item $colType="collg">
              <ResultItemTruncatedCell
                searchResult={searchResult}
                truncatedCellType="linkedUrlList"
              />
            </ColContainer>
          </>
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
