import { styled } from '@mui/material/styles';
import { propsChecker } from 'lib/helpers';

interface ContainerProps {
  $maxWidth?: number;
}

interface ChildrenContainerProps {
  $isPointer: boolean;
}

export const Container = styled('div', {
  shouldForwardProp: (propName: PropertyKey) =>
    propsChecker(propName, ['$maxWidth']),
})<ContainerProps>(({ theme, $maxWidth }) => ({
  margin: 'auto 0',
  overflow: 'auto',
  '& .__react_component_tooltip:after, .__react_component_tooltip:before': {
    content: 'none',
  },
  '& .__react_component_tooltip.show': {
    opacity: 1,
  },
  '& .__react_component_tooltip': {
    maxWidth: `${$maxWidth || 320}px`,
    borderRadius: '4px',
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.body2.fontWeight,
    lineHeight: theme.typography.body2.lineHeight,
  },
  '& .__react_component_tooltip.type-light': {
    color: theme.palette.texts.info,
    maxWidth: `${$maxWidth || 320}px`,
    borderRadius: '4px',
    padding: theme.spacing(1),
    border: '1px solid',
    borderColor: theme.palette.divider,
    backgroundColor: theme.palette.background.default,
  },
  '& .__react_component_tooltip.type-dark': {
    color: theme.palette.divider,
    maxWidth: `${$maxWidth || 320}px`,
    borderRadius: '4px',
    padding: theme.spacing(0.25, 0.5),
    backgroundColor: theme.palette.info.dark,
  },
}));

export const ChildrenContainer = styled('div', {
  shouldForwardProp: (propName: PropertyKey) =>
    propsChecker(propName, ['$isPointer']),
})<ChildrenContainerProps>(({ theme, $isPointer }) => ({
  cursor: $isPointer ? 'pointer' : 'auto',
}));
