import React from 'react';
import SystemIcon from 'components/shared/Icons/SystemIcon';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import { Theme, TypographyProps } from '@mui/material';
import { SxProps } from '@mui/system';
import { Container } from './LabelItemStyles';

interface LabelItemProps {
  labelName: string | undefined;
  removable?: boolean;
  onRemoveClick?: () => void;
  unfilled?: boolean;
  variant?: TypographyProps['variant'];
  component?: React.ElementType;
  systemLabel?: boolean;
  sx?: SxProps<Theme>;
}

const LabelItem: React.FC<LabelItemProps> = ({
  labelName,
  removable,
  onRemoveClick,
  unfilled,
  variant = 'body2',
  component = 'span',
  systemLabel,
  sx,
}) => (
  <Container
    $unfilled={unfilled}
    sx={sx || { m: 0.25 }}
    noWrap
    $systemLabel={systemLabel}
    variant={variant}
    component={component}
    title={labelName}
  >
    {systemLabel && <SystemIcon />}
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
