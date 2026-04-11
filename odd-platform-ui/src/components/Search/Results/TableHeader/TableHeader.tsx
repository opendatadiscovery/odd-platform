import React from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DataEntityClassNameEnum } from 'generated-sources';
import { useScrollBarWidth } from 'lib/hooks';
import * as S from '../Results.styles';
import type { GridSizesByBreakpoints } from '../Results.styles';

interface TableHeaderProps {
  grid: GridSizesByBreakpoints;
  isCurrentSearchClass: (className: DataEntityClassNameEnum) => boolean;
}
const TableHeader: React.FC<TableHeaderProps> = ({ grid, isCurrentSearchClass }) => {
  const { t } = useTranslation();
  const scrollbarWidth = useScrollBarWidth();

  return (
    <S.ResultsTableHeader container sx={{ mt: 2, pr: scrollbarWidth }} wrap='nowrap'>
      <S.SearchCol item lg={grid.lg.nm} md={grid.md.nm}>
        <Typography variant='caption'>{t('Name')}</Typography>
      </S.SearchCol>
      {isCurrentSearchClass(DataEntityClassNameEnum.SET) && (
        <>
          <S.SearchCol item lg={grid.lg.us} md={grid.md.us}>
            <Typography variant='caption'>{t('Use')}</Typography>
          </S.SearchCol>
          <S.SearchCol item lg={grid.lg.rc} md={grid.md.rc}>
            <Typography variant='caption'>{t('Rows / Columns')}</Typography>
          </S.SearchCol>
        </>
      )}
      {isCurrentSearchClass(DataEntityClassNameEnum.TRANSFORMER) && (
        <>
          <S.SearchCol item lg={grid.lg.sr} md={grid.md.sr}>
            <Typography variant='caption'>{t('Sources')}</Typography>
          </S.SearchCol>
          <S.SearchCol item lg={grid.lg.tr} md={grid.md.tr}>
            <Typography variant='caption'>{t('Targets')}</Typography>
          </S.SearchCol>
        </>
      )}
      {isCurrentSearchClass(DataEntityClassNameEnum.CONSUMER) && (
        <S.SearchCol item lg={grid.lg.sr} md={grid.md.sr}>
          <Typography variant='caption'>{t('Source')}</Typography>
        </S.SearchCol>
      )}
      {isCurrentSearchClass(DataEntityClassNameEnum.QUALITY_TEST) && (
        <>
          <S.SearchCol item lg={grid.lg.en} md={grid.md.en}>
            <Typography variant='caption'>{t('Entities')}</Typography>
          </S.SearchCol>
          <S.SearchCol item lg={grid.lg.su} md={grid.md.su}>
            <Typography variant='caption'>{t('Suite URL')}</Typography>
          </S.SearchCol>
        </>
      )}
      {isCurrentSearchClass(DataEntityClassNameEnum.ENTITY_GROUP) && (
        <S.SearchCol item lg={grid.lg.ne} md={grid.md.ne}>
          <Typography variant='caption'>{t('Number of entities')}</Typography>
        </S.SearchCol>
      )}
      <S.SearchCol item lg={grid.lg.nd} md={grid.md.nd}>
        <Typography variant='caption'>{t('Namespace, Datasource')}</Typography>
      </S.SearchCol>
      <S.SearchCol item lg={grid.lg.ow} md={grid.md.ow}>
        <Typography variant='caption'>{t('Owners')}</Typography>
      </S.SearchCol>
      <S.SearchCol item lg={grid.lg.gr} md={grid.md.gr}>
        <Typography variant='caption'>{t('Groups')}</Typography>
      </S.SearchCol>
      <S.SearchCol item lg={grid.lg.st} md={grid.md.st}>
        <Typography variant='caption'>Status</Typography>
      </S.SearchCol>
      <S.SearchCol item lg={grid.lg.cr} md={grid.md.cr}>
        <Typography variant='caption'>{t('Created')}</Typography>
      </S.SearchCol>
      <S.SearchCol item lg={grid.lg.up} md={grid.md.up}>
        <Typography variant='caption'>{t('Updated')}</Typography>
      </S.SearchCol>
    </S.ResultsTableHeader>
  );
};

export default TableHeader;
