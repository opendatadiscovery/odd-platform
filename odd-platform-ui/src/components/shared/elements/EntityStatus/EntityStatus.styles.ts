import styled from 'styled-components';
import type { DataEntityStatusEnum } from 'generated-sources';

export const EntityStatus = styled.div<{
  $status: DataEntityStatusEnum;
  $selectable?: boolean;
  $disablePointerEvents?: boolean;
}>`
  padding: 4px 8px;
  border-radius: 12px;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  width: fit-content;
  cursor: ${({ $selectable }) => ($selectable ? 'pointer' : 'default')};
  pointer-events: ${({ $disablePointerEvents }) =>
    $disablePointerEvents ? 'none' : 'auto'};

  ${({ $status, theme }) => ({
    backgroundColor: theme.palette.entityStatus[$status].normal.background,
    color: theme.palette.entityStatus[$status].normal.color,

    '&:hover': {
      color: theme.palette.entityStatus[$status].hover.color,
      backgroundColor: theme.palette.entityStatus[$status].hover.background,
    },
    '&:active': {
      color: theme.palette.entityStatus[$status].active.color,
      backgroundColor: theme.palette.entityStatus[$status].active.background,
    },
    '&:disabled': {
      color: theme.palette.entityStatus[$status].disabled?.color,
      backgroundColor: theme.palette.entityStatus[$status].disabled?.background,
    },
  })}
`;
