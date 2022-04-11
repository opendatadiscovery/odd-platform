import React from 'react';
import { Theme } from '@mui/material';
import CloseIcon from 'components/shared/Icons/CloseIcon';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import { SxProps } from '@mui/system';
import { TermItemContainer } from './TermItemStyles';

interface TermItemProps {
  label?: string;
  onRemoveClick?: () => void;
  onClick?: () => void;
  sx?: SxProps<Theme>;
}

const TermItem: React.FC<TermItemProps> = ({
  label,
  onRemoveClick = () => {},
  onClick,
  sx,
}) => {
  const [isHover, setIsHover] = React.useState<boolean>(false);
  return (
    <TermItemContainer
      variant="body1"
      onClick={onClick}
      sx={sx}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      {label}
      {isHover && (
        <AppIconButton
          size="small"
          color="unfilled"
          icon={<CloseIcon />}
          onClick={onRemoveClick}
          sx={{ ml: 0.25 }}
        />
      )}
    </TermItemContainer>
  );
};

export default TermItem;
