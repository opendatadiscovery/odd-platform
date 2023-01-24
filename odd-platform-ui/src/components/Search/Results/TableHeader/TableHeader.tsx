import React from 'react';
import { Typography } from '@mui/material';
import { DataEntityClassNameEnum } from 'generated-sources';
import { useScrollBarWidth } from 'lib/hooks';
import * as S from '../ResultsStyles';
import type { GridSizesByBreakpoints } from '../ResultsStyles';

interface TableHeaderProps {
  grid: GridSizesByBreakpoints;
  isCurrentSearchClass: (className: DataEntityClassNameEnum) => boolean;
}
const TableHeader: React.FC<TableHeaderProps> = ({ grid, isCurrentSearchClass }) => {
  const scrollbarWidth = useScrollBarWidth();

  return (
    <S.ResultsTableHeader container sx={{ mt: 2, pr: scrollbarWidth }} wrap='nowrap'>
      <S.SearchCol item lg={grid.lg.nm} md={grid.md.nm}>
        <Typography variant='caption'>Name</Typography>
      </S.SearchCol>
      {isCurrentSearchClass(DataEntityClassNameEnum.SET) && (
        <>
          <S.SearchCol item lg={grid.lg.us} md={grid.md.us}>
            <Typography variant='caption'>Use</Typography>
          </S.SearchCol>
          <S.SearchCol item lg={grid.lg.rc} md={grid.md.rc}>
            <Typography variant='caption'>Rows/Columns</Typography>
          </S.SearchCol>
        </>
      )}
      {isCurrentSearchClass(DataEntityClassNameEnum.TRANSFORMER) && (
        <>
          <S.SearchCol item lg={grid.lg.sr} md={grid.md.sr}>
            <Typography variant='caption'>Sources</Typography>
          </S.SearchCol>
          <S.SearchCol item lg={grid.lg.tr} md={grid.md.tr}>
            <Typography variant='caption'>Targets</Typography>
          </S.SearchCol>
        </>
      )}
      {isCurrentSearchClass(DataEntityClassNameEnum.CONSUMER) && (
        <S.SearchCol item lg={grid.lg.sr} md={grid.md.sr}>
          <Typography variant='caption'>Source</Typography>
        </S.SearchCol>
      )}
      {isCurrentSearchClass(DataEntityClassNameEnum.QUALITY_TEST) && (
        <>
          <S.SearchCol item lg={grid.lg.en} md={grid.md.en}>
            <Typography variant='caption'>Entities</Typography>
          </S.SearchCol>
          <S.SearchCol item lg={grid.lg.su} md={grid.md.su}>
            <Typography variant='caption'>Suite URL</Typography>
          </S.SearchCol>
        </>
      )}
      {isCurrentSearchClass(DataEntityClassNameEnum.ENTITY_GROUP) && (
        <S.SearchCol item lg={grid.lg.ne} md={grid.md.ne}>
          <Typography variant='caption'>Number of entities</Typography>
        </S.SearchCol>
      )}
      <S.SearchCol item lg={grid.lg.nd} md={grid.md.nd}>
        <Typography variant='caption'>Namespace, Datasource</Typography>
      </S.SearchCol>
      <S.SearchCol item lg={grid.lg.ow} md={grid.md.ow}>
        <Typography variant='caption'>Owners</Typography>
      </S.SearchCol>
      <S.SearchCol item lg={grid.lg.gr} md={grid.md.gr}>
        <Typography variant='caption'>Groups</Typography>
      </S.SearchCol>
      <S.SearchCol item lg={grid.lg.cr} md={grid.md.cr}>
        <Typography variant='caption'>Created</Typography>
      </S.SearchCol>
      <S.SearchCol item lg={grid.lg.up} md={grid.md.up}>
        <Typography variant='caption'>Last Update</Typography>
      </S.SearchCol>
    </S.ResultsTableHeader>
  );
};

export default TableHeader;
