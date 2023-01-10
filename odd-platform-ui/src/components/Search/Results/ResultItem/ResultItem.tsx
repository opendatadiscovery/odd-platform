import React from 'react';
import { Grid, Typography } from '@mui/material';
import type { DataEntity } from 'generated-sources';
import { DataEntityClassNameEnum } from 'generated-sources';
import {
  AppTooltip,
  EntityClassItem,
  NumberFormatted,
  TruncatedCell,
} from 'components/shared';
import { ColumnsIcon, InformationIcon } from 'components/shared/Icons';
import { useAppDateTime, useAppPaths } from 'lib/hooks';
import * as S from 'components/Search/Results/ResultsStyles';
import RowsIcon from 'components/shared/Icons/RowsIcon';
import { type GridSizesByBreakpoints, NameContainer, SearchCol } from '../ResultsStyles';
import ResultItemPreview from './ResultItemPreview/ResultItemPreview';
import { Container, ItemLink, RCContainer } from './ResultItemStyles';

interface ResultItemProps {
  searchResult: DataEntity;
  gridSizes: GridSizesByBreakpoints;
  searchClassIdPredicate: (totalName: DataEntityClassNameEnum) => boolean;
  showClassIcons: boolean;
}

const ResultItem: React.FC<ResultItemProps> = ({
  searchResult,
  gridSizes: grid,
  searchClassIdPredicate,
  showClassIcons,
}) => {
  const { dataEntityDetailsPath } = useAppPaths();
  const { dataEntityFormattedDateTime, formatDistanceToNowStrict } = useAppDateTime();
  const detailsLink = dataEntityDetailsPath(searchResult.id);

  const resultItemPreview = React.useCallback(
    ({ open }) => <ResultItemPreview dataEntityId={searchResult.id} fetchData={open} />,
    [searchResult.id]
  );

  const updatedAt =
    searchResult.updatedAt &&
    formatDistanceToNowStrict(searchResult.updatedAt, { addSuffix: true });

  const createdAt =
    searchResult.createdAt &&
    dataEntityFormattedDateTime(searchResult.createdAt.getTime());

  return (
    <ItemLink to={detailsLink}>
      <Container container>
        <SearchCol
          lg={grid.lg.nm}
          item
          container
          justifyContent='space-between'
          wrap='nowrap'
        >
          <NameContainer container item>
            <Typography
              variant='body1'
              noWrap
              title={searchResult.internalName || searchResult.externalName}
            >
              {searchResult.internalName || searchResult.externalName}
            </Typography>
            <AppTooltip checkForOverflow={false} title={resultItemPreview}>
              <InformationIcon sx={{ ml: 1.25 }} />
            </AppTooltip>
          </NameContainer>
          <Grid container item justifyContent='flex-end' wrap='nowrap' flexBasis={0}>
            {showClassIcons &&
              searchResult.entityClasses?.map(entityClass => (
                <EntityClassItem
                  sx={{ ml: 0.5 }}
                  key={entityClass.id}
                  entityClassName={entityClass.name}
                />
              ))}
          </Grid>
        </SearchCol>
        {searchClassIdPredicate(DataEntityClassNameEnum.SET) ? (
          <>
            <SearchCol item lg={grid.lg.us}>
              <Typography variant='body1' noWrap>
                {searchResult.stats?.consumersCount}
              </Typography>
            </SearchCol>
            <SearchCol item lg={grid.lg.rc}>
              <RCContainer variant='body1' noWrap mr={1}>
                <RowsIcon fill='#C4C4C4' sx={{ mr: 0.25 }} />
                <NumberFormatted value={searchResult.stats?.rowsCount} />
              </RCContainer>
              <RCContainer variant='body1' noWrap>
                <ColumnsIcon fill='#C4C4C4' sx={{ mr: 0.25 }} />
                {searchResult.stats?.fieldsCount}
              </RCContainer>
            </SearchCol>
          </>
        ) : null}
        {searchClassIdPredicate(DataEntityClassNameEnum.TRANSFORMER) ? (
          <>
            <SearchCol lg={grid.lg.sr} item container wrap='wrap'>
              <TruncatedCell
                dataList={searchResult.sourceList}
                externalEntityId={searchResult.id}
              />
            </SearchCol>
            <SearchCol item lg={grid.lg.tr}>
              <TruncatedCell
                dataList={searchResult.targetList}
                externalEntityId={searchResult.id}
              />
            </SearchCol>
          </>
        ) : null}
        {searchClassIdPredicate(DataEntityClassNameEnum.CONSUMER) ? (
          <SearchCol item lg={grid.lg.sr}>
            <TruncatedCell
              dataList={searchResult.inputList}
              externalEntityId={searchResult.id}
            />
          </SearchCol>
        ) : null}
        {searchClassIdPredicate(DataEntityClassNameEnum.QUALITY_TEST) ? (
          <>
            <SearchCol item container wrap='wrap' lg={grid.lg.en}>
              <TruncatedCell
                dataList={searchResult.datasetsList}
                externalEntityId={searchResult.id}
              />
            </SearchCol>
            <SearchCol item lg={grid.lg.su}>
              <TruncatedCell
                dataList={searchResult.linkedUrlList}
                externalEntityId={searchResult.id}
              />
            </SearchCol>
          </>
        ) : null}
        {searchClassIdPredicate(DataEntityClassNameEnum.ENTITY_GROUP) ? (
          <SearchCol item lg={grid.lg.ne}>
            <Typography variant='body1' noWrap>
              {searchResult?.itemsCount}
            </Typography>
          </SearchCol>
        ) : null}
        <SearchCol item lg={grid.lg.nd} flexDirection='column'>
          {searchResult.dataSource.namespace?.name ? (
            <Typography
              variant='body1'
              title={searchResult.dataSource.namespace?.name}
              noWrap
            >
              {searchResult.dataSource.namespace?.name}
            </Typography>
          ) : (
            <Typography variant='subtitle2'>not in any namespace</Typography>
          )}
          {searchResult.dataSource?.name ? (
            <Typography variant='body1' title={searchResult.dataSource?.name} noWrap>
              {searchResult.dataSource?.name}
            </Typography>
          ) : (
            <Typography variant='subtitle2'>manually created</Typography>
          )}
        </SearchCol>
        <SearchCol item lg={grid.lg.ow}>
          <Grid container direction='column' alignItems='flex-start'>
            {searchResult.ownership?.map(ownership => (
              <Grid item key={ownership.id}>
                <Typography variant='body1' title={ownership.owner.name} noWrap>
                  {ownership.owner.name}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </SearchCol>
        <S.SearchCol item lg={grid.lg.gr}>
          <TruncatedCell
            dataList={searchResult.dataEntityGroups}
            externalEntityId={searchResult.id}
          />
        </S.SearchCol>
        <SearchCol item lg={grid.lg.cr}>
          <Typography variant='body1' title={createdAt} noWrap>
            {createdAt}
          </Typography>
        </SearchCol>
        <SearchCol item lg={grid.lg.up}>
          <Typography variant='body1' title={updatedAt} noWrap>
            {updatedAt}
          </Typography>
        </SearchCol>
      </Container>
    </ItemLink>
  );
};

export default ResultItem;
