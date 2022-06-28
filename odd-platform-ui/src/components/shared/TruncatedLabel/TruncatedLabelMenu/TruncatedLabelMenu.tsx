import React from 'react';
import AppMenu from 'components/shared/AppMenu/AppMenu';
import LabelItem from 'components/shared/LabelItem/LabelItem';
import { Label } from 'generated-sources';

import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import MoreIcon from 'components/shared/Icons/MoreIcon';
import AppMenuItem from 'components/shared/AppMenuItem/AppMenuItem';

interface TruncatedLabelMenuProps {
  dataList?: Label[];
  menuId: number;
}
const TruncatedLabelMenu: React.FC<TruncatedLabelMenuProps> = ({
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
        {dataList?.map(label => (
          <AppMenuItem key={label.id}>
            <LabelItem labelName={label.name} />
          </AppMenuItem>
        ))}
      </AppMenu>
    </>
  );
};

export default TruncatedLabelMenu;
