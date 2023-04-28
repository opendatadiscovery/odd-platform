import React from 'react';
import styled from 'styled-components';

interface NodeListIconProps {
  text: string;
  onClick?: React.MouseEventHandler<SVGTextElement>;
}

const StyledText = styled('text')(({ theme }) => ({
  cursor: 'pointer',
  fill: theme.palette.texts.hint,
  fontWeight: theme.typography.body1.fontWeight,
  lineHeight: theme.typography.body1.lineHeight,
  '&:hover': { fill: theme.palette.button.tertiary.normal.color },
}));

const NodeListButton: React.FC<NodeListIconProps> = ({ text, onClick }) => (
  <StyledText onClick={onClick} x='50' y='40' fontSize='14' fill='black'>
    {text}
  </StyledText>
);

export default NodeListButton;
