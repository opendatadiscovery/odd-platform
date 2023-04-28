import React from 'react';
import { type Theme } from '@mui/material';
import ClearIcon from 'components/shared/icons/ClearIcon';
import SystemIcon from 'components/shared/icons/SystemIcon';
import { type SxProps } from '@mui/system';
import Button from 'components/shared/elements/Button/Button';
import * as S from './TagItemStyles';

interface TagItemProps {
  label: string | React.ReactElement;
  important?: boolean;
  removable?: boolean;
  onRemoveClick?: () => void;
  onClick?: () => void;
  sx?: SxProps<Theme>;
  cursorPointer?: boolean;
  systemTag?: boolean;
}

const TagItem: React.FC<TagItemProps> = ({
  label,
  important,
  removable,
  onRemoveClick = () => {},
  onClick,
  cursorPointer,
  sx,
  systemTag,
}) => (
  <S.Container
    variant='body1'
    $important={important}
    $systemTag={systemTag}
    $cursorPointer={cursorPointer}
    onClick={onClick}
    sx={sx}
  >
    {systemTag && <SystemIcon />}
    {label}
    {removable && !systemTag && (
      <Button
        buttonType='linkGray-m'
        icon={<ClearIcon />}
        sx={{ ml: 0.25 }}
        onClick={onRemoveClick}
      />
    )}
  </S.Container>
);

export default TagItem;
