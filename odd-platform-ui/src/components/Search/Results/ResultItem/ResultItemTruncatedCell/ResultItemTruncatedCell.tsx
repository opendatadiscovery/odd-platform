import React, { MouseEvent } from 'react';
import { Menu, MenuItem } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import TruncateMarkup from 'react-truncate-markup';
import { Link } from 'react-router-dom';
import { DataEntity, DataEntityRef } from 'generated-sources';
import AppButton from 'components/shared/AppButton/AppButton';
import MoreIcon from 'components/shared/Icons/MoreIcon';
import { dataEntityDetailsPath } from 'lib/paths';
import { styles, StylesType } from './ResultItemTruncatedCellStyles';

type TruncatedCellType =
  | 'sourceList'
  | 'targetList'
  | 'inputList'
  | 'datasetsList'
  | 'linkedUrlList';

interface ResultItemProps extends StylesType {
  searchResult: DataEntity;
  truncatedCellType: TruncatedCellType;
}

const ResultItemTruncatedCell: React.FC<ResultItemProps> = ({
  classes,
  searchResult,
  truncatedCellType,
}) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState<boolean>(false);

  const dataRefListEllipsis = (
    menuName: string,
    list?: DataEntityRef[] | string[]
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
          // getContentAnchorEl={null}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          id={`menu-${menuName}-${searchResult.id}`}
          keepMounted
          open={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        >
          {list?.map((item: DataEntityRef | string) =>
            typeof item === 'string' ? (
              <MenuItem key={item}>{item}</MenuItem>
            ) : (
              <MenuItem key={item.id}>
                {item.internalName || item.externalName}
              </MenuItem>
            )
          )}
        </Menu>
      </>
    );
  };

  const getTruncateMarkupAtom = (item: DataEntityRef | string) => {
    const key = typeof item === 'string' ? item : item.id;
    const linkTo =
      typeof item === 'string' ? item : dataEntityDetailsPath(item.id);
    const linkContent =
      typeof item === 'string'
        ? item
        : item.internalName || item.externalName;
    return (
      <TruncateMarkup.Atom key={key}>
        <AppButton color="primaryLight" size="small" onClick={() => {}}>
          <Link target="__blank" to={linkTo}>
            {linkContent}
          </Link>
        </AppButton>
      </TruncateMarkup.Atom>
    );
  };

  return (
    <TruncateMarkup
      lines={1}
      lineHeight="16px"
      ellipsis={dataRefListEllipsis(
        truncatedCellType,
        searchResult[truncatedCellType]
      )}
    >
      <div className={classes.truncatedList}>
        {searchResult[truncatedCellType]?.map(getTruncateMarkupAtom)}
      </div>
    </TruncateMarkup>
  );
};

export default withStyles(styles)(ResultItemTruncatedCell);
