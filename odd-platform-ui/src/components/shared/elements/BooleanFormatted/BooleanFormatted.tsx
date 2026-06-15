import React from 'react';
import { useTranslation } from 'react-i18next';

export interface BooleanFormattedProps {
  value: string | boolean | undefined;
}

const BooleanFormatted: React.FC<BooleanFormattedProps> = ({ value }) => {
  const { t } = useTranslation();

  return <>{value === true || value === 'true' ? t('Yes') : t('No')}</>;
};

export default BooleanFormatted;
