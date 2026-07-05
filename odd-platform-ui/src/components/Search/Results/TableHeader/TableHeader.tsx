import React from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ASSET_RESULT_COLS as COL } from '../Results.styles';
import * as S from '../Results.styles';

/**
 * ST-4 (#1838) — the cross-kind results header. One kind-agnostic column set (the per-entity-class headers are
 * retired with the class tabs), matching the polymorphic `ResultItem` row: Name · Type · Namespace · Status ·
 * Updated · Recently viewed. Name pins left and Recently-viewed pins right while the middle columns scroll.
 */
const TableHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <S.ResultsTableHeader container sx={{ mt: 2 }} wrap='nowrap'>
      <S.SearchCol item lg={COL.nm} md={COL.nm} $sticky>
        <Typography variant='caption'>{t('Name')}</Typography>
      </S.SearchCol>
      <S.SearchCol item lg={COL.ty} md={COL.ty}>
        <Typography variant='caption'>{t('Type')}</Typography>
      </S.SearchCol>
      <S.SearchCol item lg={COL.nd} md={COL.nd}>
        <Typography variant='caption'>{t('Namespace')}</Typography>
      </S.SearchCol>
      <S.SearchCol item lg={COL.st} md={COL.st}>
        <Typography variant='caption'>{t('Status')}</Typography>
      </S.SearchCol>
      <S.SearchCol item lg={COL.up} md={COL.up}>
        <Typography variant='caption'>{t('Updated')}</Typography>
      </S.SearchCol>
      <S.SearchCol item lg={COL.rv} md={COL.rv} $stickyRight>
        <Typography variant='caption'>{t('Recently viewed')}</Typography>
      </S.SearchCol>
    </S.ResultsTableHeader>
  );
};

export default TableHeader;
