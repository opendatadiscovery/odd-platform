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
      <S.SearchCol size={{ md: grid.md.nm, lg: grid.lg.nm }}>
        <Typography variant='caption'>{t('Name')}</Typography>
      </S.SearchCol>
      {isCurrentSearchClass(DataEntityClassNameEnum.SET) && (
        <>
          <S.SearchCol size={{ md: grid.md.us, lg: grid.lg.us }}>
            <Typography variant='caption'>{t('Use')}</Typography>
          </S.SearchCol>
          <S.SearchCol size={{ md: grid.md.rc, lg: grid.lg.rc }}>
            <Typography variant='caption'>{t('Rows / Columns')}</Typography>
          </S.SearchCol>
        </>
      )}
      {isCurrentSearchClass(DataEntityClassNameEnum.TRANSFORMER) && (
        <>
          <S.SearchCol size={{ md: grid.md.sr, lg: grid.lg.sr }}>
            <Typography variant='caption'>{t('Sources')}</Typography>
          </S.SearchCol>
          <S.SearchCol size={{ md: grid.md.tr, lg: grid.lg.tr }}>
            <Typography variant='caption'>{t('Targets')}</Typography>
          </S.SearchCol>
        </>
      )}
      {isCurrentSearchClass(DataEntityClassNameEnum.CONSUMER) && (
        <S.SearchCol size={{ md: grid.md.sr, lg: grid.lg.sr }}>
          <Typography variant='caption'>{t('Source')}</Typography>
        </S.SearchCol>
      )}
      {isCurrentSearchClass(DataEntityClassNameEnum.QUALITY_TEST) && (
        <>
          <S.SearchCol size={{ md: grid.md.en, lg: grid.lg.en }}>
            <Typography variant='caption'>{t('Entities')}</Typography>
          </S.SearchCol>
          <S.SearchCol size={{ md: grid.md.su, lg: grid.lg.su }}>
            <Typography variant='caption'>{t('Suite URL')}</Typography>
          </S.SearchCol>
        </>
      )}
      {isCurrentSearchClass(DataEntityClassNameEnum.ENTITY_GROUP) && (
        <S.SearchCol size={{ md: grid.md.ne, lg: grid.lg.ne }}>
          <Typography variant='caption'>{t('Number of entities')}</Typography>
        </S.SearchCol>
      )}
      <S.SearchCol size={{ md: grid.md.nd, lg: grid.lg.nd }}>
        <Typography variant='caption'>{t('Namespace, Datasource')}</Typography>
      </S.SearchCol>
      <S.SearchCol size={{ md: grid.md.ow, lg: grid.lg.ow }}>
        <Typography variant='caption'>{t('Owners')}</Typography>
      </S.SearchCol>
      <S.SearchCol size={{ md: grid.md.gr, lg: grid.lg.gr }}>
        <Typography variant='caption'>{t('Groups')}</Typography>
      </S.SearchCol>
      <S.SearchCol size={{ md: grid.md.st, lg: grid.lg.st }}>
        <Typography variant='caption'>Status</Typography>
      </S.SearchCol>
      <S.SearchCol size={{ md: grid.md.cr, lg: grid.lg.cr }}>
        <Typography variant='caption'>{t('Created')}</Typography>
      </S.SearchCol>
      <S.SearchCol size={{ md: grid.md.up, lg: grid.lg.up }}>
        <Typography variant='caption'>{t('Updated')}</Typography>
      </S.SearchCol>
    </S.ResultsTableHeader>
  );
};

export default TableHeader;
