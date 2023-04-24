import styled from 'styled-components';

export const Container = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid',
  borderColor: theme.palette.border.primary,
  position: 'relative',
  borderRadius: '8px',
  width: '184px',
  boxSizing: 'content-box',

  '&:hover': {
    borderColor: theme.palette.border.tertiary,
    boxShadow: theme.shadows[8],
    cursor: 'pointer',
  },
  '&:active': { borderColor: theme.palette.border.element, boxShadow: theme.shadows[8] },
}));

const logoContainerHeight = 144;

export const LogoContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: `${logoContainerHeight}px`,
  borderTopLeftRadius: '8px',
  borderTopRightRadius: '8px',
  backgroundColor: theme.palette.backgrounds.tertiary,
}));

export const TextContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2, 1),
}));

export const IntegratedContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: 'fit-content',
  position: 'absolute',
  left: '25%',
  top: `${logoContainerHeight - 14}px`,
  padding: theme.spacing(0.5, 1),
  borderRadius: '16px',
  backgroundColor: theme.palette.button.secondarySuccess.hover.background,
  '& > h5': { color: theme.palette.button.secondarySuccess.hover.color },
}));
