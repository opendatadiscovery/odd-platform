import React from 'react';
import { useTranslation } from 'react-i18next';
import { type BoxProps } from '@mui/material';
import { type DataEntityClassNameEnum } from 'generated-sources';
import { DataEntityClassLabelMap } from 'lib/constants';
import * as S from './EntityClassItem.styles';

export interface EntityClassItemProps extends Pick<BoxProps, 'sx'> {
  entityClassName?: DataEntityClassNameEnum;
  fullName?: boolean;
  large?: boolean;
}

const EntityClassItem: React.FC<EntityClassItemProps> = ({
  entityClassName,
  fullName,
  sx,
  large,
}) => {
  const { t } = useTranslation();
  // `normal` / `short` are object KEYS of the label map (code, not display text); the values
  // they resolve to (e.g. "Data Set") are the user-facing labels, translated via t() below.
  const labels = entityClassName
    ? DataEntityClassLabelMap.get(entityClassName)
    : undefined;
  const label = labels?.[fullName ? 'normal' : 'short'];

  return (
    <S.Content
      $entityClassName={entityClassName}
      $large={large}
      sx={sx}
      component='span'
      title={labels?.normal ? t(labels.normal) : undefined}
    >
      {label ? t(label) : null}
    </S.Content>
  );
};

export default EntityClassItem;
