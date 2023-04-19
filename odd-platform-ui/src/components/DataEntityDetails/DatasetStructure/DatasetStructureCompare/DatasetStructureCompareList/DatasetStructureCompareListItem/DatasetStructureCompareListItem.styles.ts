import styled, { type CSSObject } from 'styled-components';
import type { DataSetVersionDiffStatus } from 'generated-sources';
import { nestingFactor } from '../../../shared/constants';

const getBgColor = (status: DataSetVersionDiffStatus) => {
  if (status === 'CREATED') return '#E8FCEF';
  if (status === 'UPDATED') return '#E5EEFF';
  if (status === 'DELETED') return '#FFE5E6';

  return 'transparent';
};

const setClipPath = (
  isFieldExists: boolean | undefined,
  isFrom: boolean | undefined,
  status: DataSetVersionDiffStatus
) => {
  if (!isFieldExists || status === 'NO_CHANGES' || status === 'UPDATED') return 'none';

  if (isFrom) return 'polygon(0px 0px, 100% 0px, calc(100% - 8px) 100%, 0px 100%)';

  return 'polygon(0 0, 100% 0, 100% 100%, calc(0% + 8px) 100%)';
};

const setRowBorderPosition = (
  nesting: number,
  isFrom?: boolean,
  isFieldExists?: boolean
) => {
  if (!isFieldExists && !isFrom) {
    return `-${nesting * nestingFactor}px`;
  }

  return `0px`;
};

export const Container = styled('div')(
  () =>
    ({
      display: 'flex',
      width: `100%`,
      flexWrap: 'nowrap',
    } as CSSObject)
);

export const CollapseContainer = styled('div')<{ $visibility: boolean }>(
  ({ $visibility, theme }) => ({
    padding: theme.spacing(0.5, 0),
    display: 'flex',
    alignSelf: 'center',
    visibility: $visibility ? 'visible' : 'hidden',
  })
);

export const FieldWrapper = styled('div')<{
  $nesting: number;
}>(({ $nesting }) => ({
  display: 'flex',
  width: '50%',
  paddingLeft: `${$nesting * nestingFactor}px`,
}));

export const FieldContentWrapper = styled('div')<{
  $isFrom?: boolean;
}>(({ theme, $isFrom }) => ({
  display: 'flex',
  width: '100%',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginLeft: theme.spacing($isFrom ? 0 : 1),
  marginRight: theme.spacing($isFrom ? 1 : 0),
}));

export const FieldNameWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'nowrap',
  alignItems: 'center',
  minWidth: 0,

  '& > *': { marginRight: theme.spacing(1) },
}));

export const FieldContainer = styled('div')<{
  $isFrom?: boolean;
  $isFieldExists?: boolean;
  $status: DataSetVersionDiffStatus;
  $nesting: number;
}>(({ theme, $isFrom, $isFieldExists, $status, $nesting }) => ({
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  position: 'relative',
  backgroundColor: getBgColor($status),
  height: $isFieldExists ? 'auto' : '0px',
  padding: theme.spacing($isFieldExists ? 1.25 : 0, $isFieldExists ? 1 : 0),
  clipPath: setClipPath($isFieldExists, $isFrom, $status),

  '&:after': {
    content: '""',
    position: 'absolute',
    top: '1px',
    left: setRowBorderPosition($nesting, $isFrom, $isFieldExists),
    height: $status === 'UPDATED' ? '100%' : '2px',
    width: `calc(100% + ${$nesting * nestingFactor * 2}px)`,
    backgroundColor: getBgColor($status),
    zIndex: -1,
  },

  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    zIndex: 1,
    left: setRowBorderPosition($nesting, $isFrom, $isFieldExists),
    height: '1px',
    width: `calc(100% + ${$nesting * nestingFactor * 2}px)`,
    backgroundColor: theme.palette.divider,
  },
}));
