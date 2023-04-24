import React from 'react';
import type { Label } from 'generated-sources';
import { MoreIcon } from 'components/shared/icons';
import LabelItem from 'components/shared/elements/LabelItem/LabelItem';
import AppIconButton from 'components/shared/elements/AppIconButton/AppIconButton';
import AppPopover from 'components/shared/elements/AppPopover/AppPopover';

interface TruncatedLabelMenuProps {
  labelList?: Label[];
}

const TruncatedLabelMenu: React.FC<TruncatedLabelMenuProps> = ({ labelList }) => (
  <AppPopover
    childrenSx={{ width: '280px' }}
    renderOpenBtn={({ onClick, ariaDescribedBy }) => (
      <AppIconButton
        sx={{ ml: 0.5 }}
        ariaDescribedBy={ariaDescribedBy}
        color='expand'
        icon={<MoreIcon />}
        onClick={onClick}
      />
    )}
    anchorOrigin={{ vertical: 'bottom', horizontal: 24 }}
    transformOrigin={{ vertical: -4, horizontal: 'right' }}
  >
    {labelList?.map(label => (
      <LabelItem key={label.id} labelName={label.name} systemLabel={label.external} />
    ))}
  </AppPopover>
);

export default TruncatedLabelMenu;
