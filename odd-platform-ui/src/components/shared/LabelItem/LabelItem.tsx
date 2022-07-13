import React from 'react';
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
  sx?: SxProps<Theme>;
}

const LabelItem: React.FC<LabelItemProps> = ({
  labelName,
  removable,
  onRemoveClick,
  unfilled,
  variant = 'body2',
  component = 'span',
  sx,
}) => (
  <Container
    $unfilled={unfilled}
    sx={sx}
    noWrap
    variant={variant}
    component={component}
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
