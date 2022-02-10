import React from 'react';
import { Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { DataEntityRef } from 'generated-sources';
import MoreIcon from 'components/shared/Icons/MoreIcon';
import { dataEntityDetailsPath } from 'lib/paths';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import AppMenuItem from 'components/shared/AppMenuItem/AppMenuItem';
import AppMenu from 'components/shared/AppMenu/AppMenu';

interface TruncatedCellMenuProps {
  dataList: DataEntityRef[] | string[] | undefined;
  menuId: number;
}

const TruncatedCellMenu: React.FC<TruncatedCellMenuProps> = ({
  dataList,
  menuId,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleMenuOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setAnchorEl(e.currentTarget);
  };
  const handleMenuClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnchorEl(null);
  };

  return (
    <>
      <AppIconButton
        color="expand"
        icon={<MoreIcon />}
        id="menu-open-btn"
        edge="end"
        ariaControls={open ? `menu-${menuId}` : undefined}
        ariaExpanded={open ? 'true' : undefined}
        ariaHaspopup="true"
        onClick={handleMenuOpen}
        height={20}
      />
      <AppMenu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: -4, horizontal: 'left' }}
        id={`menu-${menuId}`}
        keepMounted
        open={open}
        MenuListProps={{
          'aria-labelledby': 'menu-open-btn',
        }}
        onClose={handleMenuClose}
        maxHeight={300}
        maxWidth={240}
      >
        {dataList?.map((item: DataEntityRef | string) =>
          typeof item === 'string' ? (
            <AppMenuItem key={item}>{item}</AppMenuItem>
          ) : (
            <Link
              key={item.id}
              to={dataEntityDetailsPath(item.id)}
              target="_blank"
              onClick={handleMenuClose}
            >
              <AppMenuItem>
                <Typography
                  variant="body1"
                  color="texts.action"
                  noWrap
                  title={item.internalName || item.externalName}
                >
                  {item.internalName || item.externalName}
                </Typography>
              </AppMenuItem>
            </Link>
          )
        )}
      </AppMenu>
    </>
  );
};

export default TruncatedCellMenu;
