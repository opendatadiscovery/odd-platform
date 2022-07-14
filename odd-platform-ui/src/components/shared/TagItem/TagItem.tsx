import React from 'react';
import { Theme } from '@mui/material';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import SystemIcon from 'components/shared/Icons/SystemIcon';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import { SxProps } from '@mui/system';
import * as S from './TagItemStyles';

interface TagItemProps {
  label: string;
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
    variant="body1"
    $important={important}
    $systemTag={systemTag}
    $cursorPointer={cursorPointer}
    onClick={onClick}
    sx={sx}
  >
    {systemTag && (
      <S.SystemIconContainer>
        <SystemIcon
          important={important}
          sx={{
            ml: 0.25,
          }}
        />
      </S.SystemIconContainer>
    )}
    {label}
    {removable && !systemTag && (
      <AppIconButton
        size="small"
        color="unfilled"
        icon={<ClearIcon />}
        onClick={onRemoveClick}
        sx={{ ml: 0.25 }}
      />
    )}
  </S.Container>
);

export default TagItem;
