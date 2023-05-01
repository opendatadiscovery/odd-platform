import React from 'react';
import { ClearIcon, SystemIcon } from 'components/shared/icons';
import type { Theme, TypographyProps } from '@mui/material';
import type { SxProps } from '@mui/system';
import { Container } from 'components/shared/elements/LabelItem/LabelItemStyles';
import Button from 'components/shared/elements/Button/Button';

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
      <Button
        sx={{ ml: 0.25 }}
        buttonType='linkGray-m'
        icon={<ClearIcon />}
        onClick={onRemoveClick}
      />
    )}
  </Container>
);

export default LabelItem;
