import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DataEntityClassNameEnum } from 'generated-sources';
import {
  AppTooltip,
  DataEntityDetailsPreview,
  DatasourceLogo,
  EntityClassItem,
  NumberFormatted,
  TruncatedCell,
  EntityStatus,
  MetadataStale,
} from 'components/shared/elements';
import { ColumnsIcon, QuestionIcon, RowsIcon } from 'components/shared/icons';
import { useAppDateTime } from 'lib/hooks';
import type { DataEntity } from 'redux/interfaces';
import { useAppSelector } from 'redux/lib/hooks';
import { getSearchQuery } from 'redux/selectors';
import { dataEntityDetailsPath } from 'routes';
import { type GridSizesByBreakpoints, SearchCol } from '../Results.styles';
import * as S from './ResultItemStyles';
import SearchHighlights from './SearchHighlights/SearchHighlights';

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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { dataEntityFormattedDateTime, formatDistanceToNowStrict } = useAppDateTime();
  const detailsLink = dataEntityDetailsPath(searchResult.id);

  const searchQuery = useAppSelector(getSearchQuery);

  const searchHighlights = React.useMemo(
    () => <SearchHighlights dataEntityId={searchResult.id} />,
    [searchResult.id]
  );

  const updatedAtDS = searchResult?.sourceUpdatedAt ? (
    <Typography
      variant='body1'
      title={formatDistanceToNowStrict(searchResult.sourceUpdatedAt, { addSuffix: true })}
      noWrap
    >
      {formatDistanceToNowStrict(searchResult.sourceUpdatedAt, { addSuffix: true })}
    </Typography>
  ) : null;

  const createdAtDS = searchResult?.sourceCreatedAt ? (
    <Typography
      variant='body1'
      title={dataEntityFormattedDateTime(searchResult.sourceCreatedAt)}
      noWrap
    >
      {dataEntityFormattedDateTime(searchResult.sourceCreatedAt)}
    </Typography>
  ) : null;

  return (
    <S.Container
      data-testid='search-result-item'
      container
      onClick={() => navigate(detailsLink)}
    >
      <SearchCol
        container
        justifyContent='space-between'
        wrap='nowrap'
        size={{ md: grid.md.nm, lg: grid.lg.nm }}
      >
        <S.NameContainer container>
          <Box display='flex' flexWrap='nowrap' alignItems='center' overflow='hidden'>
            <MetadataStale
              isStale={searchResult.isStale}
              lastIngestedAt={searchResult.lastIngestedAt}
            />
            <Typography
              ml={0.5}
              variant='body1'
              noWrap
              title={searchResult.internalName ?? searchResult.externalName}
            >
              {searchResult.internalName ?? searchResult.externalName}
            </Typography>
          </Box>
          <Box display='flex' flexWrap='nowrap' sx={{ ml: 1 }}>
            {searchQuery && (
              <AppTooltip checkForOverflow={false} title={searchHighlights}>
                <QuestionIcon sx={{ mr: 1 }} />
              </AppTooltip>
            )}
            <DataEntityDetailsPreview dataEntityId={searchResult.id} />
          </Box>
        </S.NameContainer>
        <Grid container justifyContent='flex-end' wrap='nowrap' flexBasis={0}>
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
          <SearchCol size={{ md: grid.md.us, lg: grid.lg.us }}>
            <Typography variant='body1' noWrap>
              {searchResult.stats?.consumersCount}
            </Typography>
          </SearchCol>
          <SearchCol size={{ md: grid.md.rc, lg: grid.lg.rc }}>
            <S.RCContainer variant='body1' noWrap mr={1}>
              <RowsIcon fill='#C4C4C4' sx={{ mr: 0.25 }} />
              <NumberFormatted value={searchResult.stats?.rowsCount} />
            </S.RCContainer>
            <S.RCContainer variant='body1' noWrap>
              <ColumnsIcon fill='#C4C4C4' sx={{ mr: 0.25 }} />
              {searchResult.stats?.fieldsCount}
            </S.RCContainer>
          </SearchCol>
        </>
      ) : null}
      {searchClassIdPredicate(DataEntityClassNameEnum.TRANSFORMER) ? (
        <>
          <SearchCol container wrap='wrap' size={{ md: grid.md.sr, lg: grid.lg.sr }}>
            <TruncatedCell
              dataList={searchResult.sourceList}
              externalEntityId={searchResult.id}
            />
          </SearchCol>
          <SearchCol size={{ md: grid.md.tr, lg: grid.lg.tr }}>
            <TruncatedCell
              dataList={searchResult.targetList}
              externalEntityId={searchResult.id}
            />
          </SearchCol>
        </>
      ) : null}
      {searchClassIdPredicate(DataEntityClassNameEnum.CONSUMER) ? (
        <SearchCol size={{ md: grid.md.sr, lg: grid.lg.sr }}>
          <TruncatedCell
            dataList={searchResult.inputList}
            externalEntityId={searchResult.id}
          />
        </SearchCol>
      ) : null}
      {searchClassIdPredicate(DataEntityClassNameEnum.QUALITY_TEST) ? (
        <>
          <SearchCol container wrap='wrap' size={{ md: grid.md.en, lg: grid.lg.en }}>
            <TruncatedCell
              dataList={searchResult.datasetsList}
              externalEntityId={searchResult.id}
            />
          </SearchCol>
          <SearchCol size={{ md: grid.md.su, lg: grid.lg.su }}>
            <TruncatedCell
              dataList={searchResult.linkedUrlList}
              externalEntityId={searchResult.id}
            />
          </SearchCol>
        </>
      ) : null}
      {searchClassIdPredicate(DataEntityClassNameEnum.ENTITY_GROUP) ? (
        <SearchCol size={{ md: grid.md.ne, lg: grid.lg.ne }}>
          <Typography variant='body1' noWrap>
            {searchResult?.itemsCount}
          </Typography>
        </SearchCol>
      ) : null}
      <SearchCol flexDirection='column' size={{ md: grid.md.nd, lg: grid.lg.nd }}>
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
          <Grid container alignItems='center' flexWrap='nowrap'>
            <DatasourceLogo
              width={24}
              padding={0}
              backgroundColor='transparent'
              name={searchResult.dataSource?.oddrn}
            />
            <Typography
              ml={1}
              variant='body1'
              title={searchResult.dataSource?.name}
              noWrap
            >
              {searchResult.dataSource?.name}
            </Typography>
          </Grid>
        ) : (
          <Typography variant='subtitle2'>{t('manually created')}</Typography>
        )}
      </SearchCol>
      <SearchCol size={{ md: grid.md.ow, lg: grid.lg.ow }}>
        <Grid container direction='column' alignItems='flex-start'>
          {searchResult.ownership?.map(ownership => (
            <Grid key={ownership.id}>
              <Typography variant='body1' title={ownership.owner.name} noWrap>
                {ownership.owner.name}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </SearchCol>
      <SearchCol size={{ md: grid.md.gr, lg: grid.lg.gr }}>
        <TruncatedCell
          dataList={searchResult.dataEntityGroups}
          externalEntityId={searchResult.id}
        />
      </SearchCol>
      <SearchCol size={{ md: grid.md.st, lg: grid.lg.st }}>
        <EntityStatus entityStatus={searchResult.status} />
      </SearchCol>
      <SearchCol size={{ md: grid.md.cr, lg: grid.lg.cr }}>{createdAtDS}</SearchCol>
      <SearchCol size={{ md: grid.md.up, lg: grid.lg.up }}>{updatedAtDS}</SearchCol>
    </S.Container>
  );
};

export default ResultItem;
