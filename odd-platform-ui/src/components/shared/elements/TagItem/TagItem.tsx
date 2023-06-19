import React, { type FC, type ReactElement } from 'react';
import { type Theme, Typography } from '@mui/material';
import ClearIcon from 'components/shared/icons/ClearIcon';
import SystemIcon from 'components/shared/icons/SystemIcon';
import { type SxProps } from '@mui/system';
import Button from 'components/shared/elements/Button/Button';
import isUndefined from 'lodash/isUndefined';
import * as S from './TagItemStyles';

interface TagItemProps {
  label: string | ReactElement;
  important?: boolean;
  removable?: boolean;
  onRemoveClick?: () => void;
  onClick?: () => void;
  sx?: SxProps<Theme>;
  cursorPointer?: boolean;
  systemTag?: boolean;
  count?: number;
}

const TagItem: FC<TagItemProps> = ({
  label,
  important,
  removable,
  onRemoveClick = () => {},
  onClick,
  cursorPointer,
  sx,
  systemTag,
  count,
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
    {!isUndefined(count) && (
      <Typography ml={0.5} variant='subtitle1'>
        {count}
      </Typography>
    )}
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
