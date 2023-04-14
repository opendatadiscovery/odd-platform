import styled, { type CSSObject } from 'styled-components';
import type { DataSetVersionDiffStatus } from 'generated-sources';

export const Container = styled('div')<{ $nesting: number }>(
  ({ $nesting }) =>
    ({
      display: 'flex',
      width: `calc(100% - ${$nesting * 16}px)`,
      flexWrap: 'nowrap',
      paddingLeft: `${$nesting * 16}px`,
      marginBottom: '4px',
    } as CSSObject)
);

export const FieldWrapper = styled('div')<{ $isFrom?: boolean }>(
  ({ theme, $isFrom }) => ({
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    marginRight: theme.spacing($isFrom ? 1 : 0),
    marginLeft: theme.spacing($isFrom ? 0 : 1),
  })
);

const getBgColor = (status: DataSetVersionDiffStatus) => {
  if (status === 'CREATED') return '#E8FCEF';
  if (status === 'UPDATED') return '#E5EEFF';
  if (status === 'DELETED') return '#FFE5E6';

  return '#F7F7F7';
};

export const FieldContainer = styled('div')<{
  $isFrom?: boolean;
  $isFieldExists?: boolean;
  $status: DataSetVersionDiffStatus;
}>(({ theme, $isFrom, $isFieldExists, $status }) => ({
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  borderTopLeftRadius: $isFrom ? '0' : '20px',
  borderBottomLeftRadius: $isFrom ? '0' : '20px',
  borderTopRightRadius: $isFrom ? '20px' : '0px',
  borderBottomRightRadius: $isFrom ? '20px' : '0px',
  position: 'relative',
  backgroundColor: getBgColor($status),
  height: $isFieldExists ? 'auto' : '2px',
  padding: theme.spacing($isFieldExists ? 1.25 : 0, $isFieldExists ? 1 : 0),

  '& > *': { marginRight: theme.spacing(1) },

  [`&:${$isFrom ? 'after' : 'before'}`]: {
    content: "''",
    position: 'absolute',
    [`${$isFrom ? 'right' : 'left'}`]: '-2.4%',
    border: 'solid transparent',
    borderTopWidth: $isFieldExists ? '0px' : '17px',
    borderLeftWidth: $isFieldExists ? '15px' : '1px',
    borderRightWidth: $isFieldExists ? '15px' : '1px',
    borderBottom: `15px solid ${getBgColor($status)}`,
    transform: `rotate(${$isFrom ? '' : '-'}90deg)`,
  },
}));
