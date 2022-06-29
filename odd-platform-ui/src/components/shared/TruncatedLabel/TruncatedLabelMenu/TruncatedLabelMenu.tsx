import React from 'react';
import LabelMenu from 'components/shared/LabelMenu/LabelMenu';
import LabelItem from 'components/shared/LabelItem/LabelItem';
import { Label } from 'generated-sources';

import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import MoreIcon from 'components/shared/Icons/MoreIcon';
import LabelMenuItem from 'components/shared/LabelMenuItem/LabelMenuItem';

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
      <LabelMenu
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
        maxHeight={120}
        maxWidth={400}
      >
        {dataList?.map(label => (
          <LabelMenuItem key={label.id}>
            <LabelItem labelName={label.name} />
          </LabelMenuItem>
        ))}
      </LabelMenu>
    </>
  );
};

export default TruncatedLabelMenu;
