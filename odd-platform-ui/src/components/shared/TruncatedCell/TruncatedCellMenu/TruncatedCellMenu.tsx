import React from 'react';
import { Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import type { DataEntityRef, LinkedUrl } from 'generated-sources';
import MoreIcon from 'components/shared/Icons/MoreIcon';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import AppMenuItem from 'components/shared/AppMenuItem/AppMenuItem';
import AppMenu from 'components/shared/AppMenu/AppMenu';
import { type Values } from '../TruncatedCell';

interface TruncatedCellMenuProps {
  dataList: DataEntityRef[] | string[] | LinkedUrl[] | undefined;
  menuId: number;
  getValues: (item: DataEntityRef | LinkedUrl | string) => Values;
}

const TruncatedCellMenu: React.FC<TruncatedCellMenuProps> = ({
  dataList,
  menuId,
  getValues,
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
        sx={{ height: 'auto !important' }}
        color='expand'
        icon={<MoreIcon />}
        id='menu-open-btn'
        edge='end'
        ariaControls={open ? `menu-${menuId}` : undefined}
        ariaExpanded={open ? 'true' : undefined}
        ariaHaspopup='true'
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
        MenuListProps={{ 'aria-labelledby': 'menu-open-btn' }}
        onClose={handleMenuClose}
        maxHeight={300}
        maxWidth={240}
      >
        {dataList?.map((item: DataEntityRef | LinkedUrl | string) => {
          const { key, linkTo, linkContent } = getValues(item);
          const updatedLink =
            typeof item !== 'string' && 'id' in item ? linkTo : { pathname: linkTo };

          return typeof item === 'string' ? (
            <AppMenuItem key={key}>{linkContent}</AppMenuItem>
          ) : (
            <Link key={key} to={updatedLink} target='_blank' onClick={handleMenuClose}>
              <AppMenuItem>
                <Typography
                  variant='body1'
                  color='texts.action'
                  noWrap
                  title={linkContent}
                >
                  {linkContent}
                </Typography>
              </AppMenuItem>
            </Link>
          );
        })}
      </AppMenu>
    </>
  );
};

export default TruncatedCellMenu;
