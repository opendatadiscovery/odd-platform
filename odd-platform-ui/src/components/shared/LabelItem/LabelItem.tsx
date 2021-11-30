import React from 'react';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import { Container } from './LabelItemStyles';

interface LabelItemProps {
  labelName: string | undefined;
  removable?: boolean;
  onRemoveClick?: () => void;
  unfilled?: boolean;
}

const LabelItem: React.FC<LabelItemProps> = ({
  labelName,
  removable,
  onRemoveClick,
  unfilled,
}) => (
  <Container
    $unfilled={unfilled}
    sx={{ m: 0.25 }}
    noWrap
    variant="body2"
    title={labelName}
  >
    {labelName}
    {removable && (
      <AppIconButton
        sx={{ ml: 0.25 }}
        size="small"
        color="unfilled"
        icon={<ClearIcon />}
        onClick={onRemoveClick}
      />
    )}
  </Container>
);

export default LabelItem;
