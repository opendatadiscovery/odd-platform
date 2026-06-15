import React, { type FC } from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Markdown } from 'components/shared/elements';

interface DatasetFieldDescriptionPreviewProps {
  isDescriptionEmpty: boolean;
  value: string;
}

const DatasetFieldDescriptionPreview: FC<DatasetFieldDescriptionPreviewProps> = ({
  isDescriptionEmpty,
  value,
}) => {
  const { t } = useTranslation();

  return !isDescriptionEmpty ? (
    <Markdown value={value} variant='subtitle1' />
  ) : (
    <Typography mt={1} variant='subtitle1'>
      {t('Description is not created yet')}
    </Typography>
  );
};

export default DatasetFieldDescriptionPreview;
