import React from 'react';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import { TypographyProps } from '@mui/material';
import { Container } from './LabelItemStyles';

interface LabelItemProps {
  labelName: string | undefined;
  removable?: boolean;
  onRemoveClick?: () => void;
  unfilled?: boolean;
  variant?: TypographyProps['variant'];
  component?: React.ElementType;
  systemLabel?: boolean;
}

const LabelItem: React.FC<LabelItemProps> = ({
  labelName,
  removable,
  onRemoveClick,
  unfilled,
  variant = 'body2',
  component = 'span',
  systemLabel,
}) => (
  <Container
    $unfilled={unfilled}
    sx={{ m: 0.25 }}
    noWrap
    $systemLabel={systemLabel}
    variant={variant}
    component={component}
    title={labelName}
  >
    {labelName}
    {removable && !systemLabel && (
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
