import React from 'react';
import { SystemIcon, ClearIcon } from 'components/shared/Icons';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import type { Theme, TypographyProps } from '@mui/material';
import type { SxProps } from '@mui/system';
import { Container } from './LabelItemStyles';

interface LabelItemProps {
  labelName: string | undefined | React.ReactElement;
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
    title={typeof labelName === 'string' ? labelName : ''}
  >
    {systemLabel && <SystemIcon />}
    {labelName}
    {removable && !systemLabel && (
      <AppIconButton
        sx={{ ml: 0.25 }}
        size='small'
        color='unfilled'
        icon={<ClearIcon />}
        onClick={onRemoveClick}
      />
    )}
  </Container>
);

export default LabelItem;
