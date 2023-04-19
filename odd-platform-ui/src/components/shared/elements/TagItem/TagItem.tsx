import React from 'react';
import { type Theme } from '@mui/material';
import ClearIcon from 'components/shared/icons/ClearIcon';
import SystemIcon from 'components/shared/icons/SystemIcon';
import AppIconButton from 'components/shared/elements/AppIconButton/AppIconButton';
import { type SxProps } from '@mui/system';
import * as S from 'components/shared/elements/TagItem/TagItemStyles';

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
      <AppIconButton
        size='small'
        color='unfilled'
        icon={<ClearIcon />}
        onClick={onRemoveClick}
        sx={{ ml: 0.25 }}
      />
    )}
  </S.Container>
);

export default TagItem;
