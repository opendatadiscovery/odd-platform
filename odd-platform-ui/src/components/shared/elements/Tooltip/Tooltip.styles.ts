import styled from 'styled-components';

export const Container = styled.div`
  position: relative;
  display: inline-block;
`;

export type Direction = 'top' | 'right' | 'bottom' | 'left';

export const Tooltip = styled.div<{ $direction: Direction; $active: boolean }>`
  position: absolute;
  display: flex;
  border-radius: 4px;
  z-index: 10;
  opacity: ${({ $active }) => ($active ? 1 : 0)};
  visibility: ${({ $active }) => ($active ? 'visible' : 'hidden')};
  border: ${({ theme }) => `1px solid ${theme.palette.divider}`};
  transition: opacity 0.3s;
  width: max-content;
  text-align: center;

  ${({ $direction }) =>
    $direction === 'top' &&
    `
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 4px;
  `}

  ${({ $direction }) =>
    $direction === 'right' &&
    `
    top: 50%;
    left: 100%;
    transform: translateY(-50%);
    margin-left: 4px;
  `}

  ${({ $direction }) =>
    $direction === 'bottom' &&
    `
    top: 100%;
    left: 0;
    margin-top: 4px;
  `}

  ${({ $direction }) =>
    $direction === 'left' &&
    `
    top: 50%;
    right: 100%;
    transform: translateY(-50%);
    margin-right: 4px;
  `}
`;
