import React, { MouseEvent } from 'react';
import {
  withStyles,
  Typography,
  Grid,
  Menu,
  MenuItem,
} from '@material-ui/core';
import TruncateMarkup from 'react-truncate-markup';
import { formatDistanceToNowStrict, format } from 'date-fns';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import {
  DataEntity,
  DataEntityTypeNameEnum,
  DataEntityRef,
} from 'generated-sources';
import { SearchTotalsByName, SearchType } from 'redux/interfaces/search';
import EntityTypeItem from 'components/shared/EntityTypeItem/EntityTypeItem';
import AppButton from 'components/shared/AppButton/AppButton';
import MoreIcon from 'components/shared/Icons/MoreIcon';
import { dataEntityDetailsPath } from 'lib/paths';
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

  const [isMenuOpen, setIsMenuOpen] = React.useState<boolean>(false);

  const dataRefListEllipsis = (
    menuName: string,
    list?: DataEntityRef[]
  ) => () => {
    let anchorEl;
    return (
      <>
        <AppButton
          ref={el => {
            anchorEl = el;
          }}
          color="expand"
          size="small"
          icon={<MoreIcon />}
          edge="end"
          aria-label=""
          aria-controls={`menu-${menuName}-${searchResult.id}`}
          aria-haspopup="true"
          onClick={(event: MouseEvent) => {
            event.stopPropagation();
            setIsMenuOpen(true);
          }}
        />
        <Menu
          anchorEl={anchorEl || null}
          getContentAnchorEl={null}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          id={`menu-${menuName}-${searchResult.id}`}
          keepMounted
          open={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        >
          {list?.map(item => (
            <MenuItem>{item.internalName || item.externalName}</MenuItem>
          ))}
        </Menu>
      </>
    );
  };

  let sources;
  if ('sourceList' in searchResult && searchResult.sourceList?.length) {
    sources = (
      <TruncateMarkup
        lines={1}
        lineHeight="16px"
        ellipsis={dataRefListEllipsis('sources', searchResult.sourceList)}
      >
        <div className={classes.truncatedList}>
          {searchResult.sourceList?.map(source => (
            <TruncateMarkup.Atom key={source.id}>
              <AppButton
                color="primaryLight"
                size="small"
                onClick={() => {}}
              >
                <Link
                  // key={source.id}
                  target="__blank"
                  to={dataEntityDetailsPath(source.id)}
                >
                  {source.internalName || source.externalName}
                </Link>
              </AppButton>
            </TruncateMarkup.Atom>
          ))}
        </div>
      </TruncateMarkup>
    );
  }

  let targets;
  if ('targetList' in searchResult && searchResult.targetList?.length) {
    targets = (
      <TruncateMarkup
        lines={1}
        lineHeight="16px"
        ellipsis={dataRefListEllipsis('targets', searchResult.targetList)}
      >
        <div className={classes.truncatedList}>
          {searchResult.targetList?.map(target => (
            <TruncateMarkup.Atom key={target.id}>
              <AppButton
                color="primaryLight"
                size="small"
                onClick={() => {}}
              >
                <Link
                  // key={target.id}
                  target="__blank"
                  to={dataEntityDetailsPath(target.id)}
                >
                  {target.internalName || target.externalName}
                </Link>
              </AppButton>
            </TruncateMarkup.Atom>
          ))}
        </div>
      </TruncateMarkup>
    );
  }
  return (
    <Link to={detailsLink} className={classes.itemLink}>
      <Grid container className={classes.container} wrap="nowrap">
        <Grid item className={cx(classes.col, classes.collg)}>
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
              {sources}
            </Grid>
            <Grid item className={cx(classes.col, classes.collg)}>
              {targets}
            </Grid>
          </>
        ) : null}
        {searchType &&
        searchType === totals[DataEntityTypeNameEnum.CONSUMER]?.id ? (
          <Grid item className={cx(classes.col, classes.collg)}>
            {sources}
          </Grid>
        ) : null}
        <Grid item className={cx(classes.col, classes.colmd)}>
          <Typography
            variant="body1"
            title={searchResult.namespace?.name}
            noWrap
          >
            {searchResult.namespace?.name}
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
