import React, { MouseEvent } from 'react';
import { Menu, MenuItem } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import TruncateMarkup from 'react-truncate-markup';
import { Link } from 'react-router-dom';
import { DataEntity, DataEntityRef } from 'generated-sources';
import MoreIcon from 'components/shared/Icons/MoreIcon';
import { dataEntityDetailsPath } from 'lib/paths';
import AppButton from 'components/shared/AppButton/AppButton';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import {
  styles,
  StylesType,
} from 'components/shared/TruncatedCell/TruncatedCellStyles';

type TruncatedCellType =
  | 'sourceList'
  | 'targetList'
  | 'inputList'
  | 'datasetsList'
  | 'linkedUrlList'
  | 'entities';

interface TruncatedCellProps extends StylesType {
  dataEntity: DataEntity;
  truncatedCellType: TruncatedCellType;
}

const TruncatedCell: React.FC<TruncatedCellProps> = ({
  classes,
  dataEntity,
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
        <AppIconButton
          ref={el => {
            anchorEl = el;
          }}
          color="expand"
          icon={<MoreIcon />}
          edge="end"
          aria-label=""
          aria-controls={`menu-${menuName}-${dataEntity.id}`}
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
          id={`menu-${menuName}-${dataEntity.id}`}
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
        <AppButton color="primaryLight" size="small">
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
        dataEntity[truncatedCellType]
      )}
    >
      <div className={classes.truncatedList}>
        {dataEntity[truncatedCellType]?.map(getTruncateMarkupAtom)}
      </div>
    </TruncateMarkup>
  );
};

export default withStyles(styles)(TruncatedCell);
