import React from 'react';
import { Grid, Typography, withStyles } from '@material-ui/core';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import { DataEntity, DataEntityTypeNameEnum } from 'generated-sources';
import { SearchTotalsByName, SearchType } from 'redux/interfaces/search';
import EntityTypeItem from 'components/shared/EntityTypeItem/EntityTypeItem';
import { dataEntityDetailsPath } from 'lib/paths';
import ResultItemTruncatedCell from 'components/Search/Results/ResultItem/ResultItemTruncatedCell/ResultItemTruncatedCell';
import { styles, StylesType } from './ResultItemStyles';

interface ResultItemProps extends StylesType {
  searchType?: SearchType;
  totals: SearchTotalsByName;
  searchResult: DataEntity;
}

const ResultItem: React.FC<ResultItemProps> = ({
  classes,
  searchResult,
  searchType,
  totals,
}) => {
  const detailsLink = dataEntityDetailsPath(searchResult.id);

  return (
    <Link to={detailsLink} className={classes.itemLink}>
      <Grid container className={classes.container} wrap="nowrap">
        <Grid
          item
          container
          justify="space-between"
          wrap="nowrap"
          className={cx(classes.col, classes.collg)}
        >
          <Typography
            variant="body1"
            noWrap
            title={searchResult.internalName || searchResult.externalName}
          >
            {searchResult.internalName || searchResult.externalName}
          </Typography>
          <div className={classes.typesList}>
            {!searchType ||
              (typeof searchType === 'string' &&
                searchResult.types?.map(type => (
                  <EntityTypeItem key={type.id} typeName={type.name} />
                )))}
          </div>
        </Grid>
        {searchType &&
        searchType === totals[DataEntityTypeNameEnum.SET]?.id ? (
          <>
            <Grid item className={cx(classes.col, classes.colxs)}>
              <Typography variant="body1" noWrap>
                {searchResult.stats?.consumersCount}
              </Typography>
            </Grid>
            <Grid item className={cx(classes.col, classes.colxs)}>
              <Typography variant="body1" noWrap>
                {searchResult.stats?.rowsCount}
              </Typography>
            </Grid>
            <Grid item className={cx(classes.col, classes.colxs)}>
              <Typography variant="body1" noWrap>
                {searchResult.stats?.fieldsCount}
              </Typography>
            </Grid>
          </>
        ) : null}
        {searchType &&
        searchType === totals[DataEntityTypeNameEnum.TRANSFORMER]?.id ? (
          <>
            <Grid
              item
              container
              wrap="wrap"
              className={cx(classes.col, classes.collg)}
            >
              <ResultItemTruncatedCell
                searchResult={searchResult}
                truncatedCellType="sourceList"
              />
            </Grid>
            <Grid item className={cx(classes.col, classes.collg)}>
              <ResultItemTruncatedCell
                searchResult={searchResult}
                truncatedCellType="targetList"
              />
            </Grid>
          </>
        ) : null}
        {searchType &&
        searchType === totals[DataEntityTypeNameEnum.CONSUMER]?.id ? (
          <Grid item className={cx(classes.col, classes.collg)}>
            <ResultItemTruncatedCell
              searchResult={searchResult}
              truncatedCellType="sourceList"
            />
          </Grid>
        ) : null}
        {searchType &&
        searchType === totals[DataEntityTypeNameEnum.QUALITY_TEST]?.id ? (
          <>
            <Grid
              item
              container
              wrap="wrap"
              className={cx(classes.col, classes.collg)}
            >
              <ResultItemTruncatedCell
                searchResult={searchResult}
                truncatedCellType="datasetsList"
              />
            </Grid>
            <Grid item className={cx(classes.col, classes.collg)}>
              <ResultItemTruncatedCell
                searchResult={searchResult}
                truncatedCellType="linkedUrlList"
              />
            </Grid>
          </>
        ) : null}
        <Grid item className={cx(classes.col, classes.colmd)}>
          <Typography
            variant="body1"
            title={searchResult.dataSource.namespace?.name}
            noWrap
          >
            {searchResult.dataSource.namespace?.name}
          </Typography>
        </Grid>
        <Grid item className={cx(classes.col, classes.colmd)}>
          <Typography
            variant="body1"
            title={searchResult.dataSource?.name}
            noWrap
          >
            {searchResult.dataSource?.name}
          </Typography>
        </Grid>
        <Grid item className={cx(classes.col, classes.colmd)}>
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
        </Grid>
        <Grid item className={cx(classes.col, classes.colsm)}>
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
        </Grid>
        <Grid item className={cx(classes.col, classes.colsm)}>
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
        </Grid>
      </Grid>
    </Link>
  );
};

export default withStyles(styles)(ResultItem);
