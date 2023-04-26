import React from 'react';
import { Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import type { DataEntityRef, LinkedUrl } from 'generated-sources';
import MoreIcon from 'components/shared/icons/MoreIcon';
import AppMenuItem from 'components/shared/elements/AppMenuItem/AppMenuItem';
import AppMenu from 'components/shared/elements/AppMenu/AppMenu';
import { type Values } from 'components/shared/elements/TruncatedCell/TruncatedCell';
import Button from 'components/shared/elements/Button/Button';

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
      <Button
        sx={{ height: 'auto !important' }}
        buttonType='expand-sm-icon'
        icon={<MoreIcon width={13} height={4} />}
        id='menu-open-btn'
        aria-controls={open ? `menu-${menuId}` : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup='true'
        onClick={handleMenuOpen}
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

          return typeof item === 'string' ? (
            <AppMenuItem key={key}>{linkContent}</AppMenuItem>
          ) : (
            <Link key={key} to={linkTo} target='_blank' onClick={handleMenuClose}>
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
