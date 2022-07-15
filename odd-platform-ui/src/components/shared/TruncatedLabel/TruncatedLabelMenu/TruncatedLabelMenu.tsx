import React from 'react';
import LabelItem from 'components/shared/LabelItem/LabelItem';
import { Label } from 'generated-sources';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import MoreIcon from 'components/shared/Icons/MoreIcon';
import AppPopover from 'components/shared/AppPopover/AppPopover';

interface TruncatedLabelMenuProps {
  labelList?: Label[];
}

const TruncatedLabelMenu: React.FC<TruncatedLabelMenuProps> = ({
  labelList,
}) => (
  <AppPopover
    childrenSx={{ width: '280px' }}
    renderOpenBtn={({ onClick, ariaDescribedBy }) => (
      <AppIconButton
        sx={{ ml: 0.5 }}
        ariaDescribedBy={ariaDescribedBy}
        color="expand"
        icon={<MoreIcon />}
        onClick={onClick}
      />
    )}
    anchorOrigin={{ vertical: 'bottom', horizontal: 24 }}
    transformOrigin={{ vertical: -4, horizontal: 'right' }}
  >
    {labelList?.map(label => (
      <LabelItem
        key={label.id}
        labelName={label.name}
        systemLabel={label.external}
      />
    ))}
  </AppPopover>
);

export default TruncatedLabelMenu;
