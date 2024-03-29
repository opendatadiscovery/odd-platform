import React, { type FC, type ReactElement, cloneElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@mui/material';
import ReactCountryFlag from 'react-country-flag';
import DialogWrapper from 'components/shared/elements/DialogWrapper/DialogWrapper';
import { LANG_TO_COUNTRY_CODE_MAP, LANGUAGES_MAP } from 'lib/constants';
import AppMenuItem from 'components/shared/elements/AppMenuItem/AppMenuItem';
import type { Lang } from 'lib/interfaces';
import Input from 'components/shared/elements/Input/Input';

interface SelectLanguageProps {
  openBtn: ReactElement;
  handleMenuClose: () => void;
}

type HandleClose = () => void;

const SelectLanguage: FC<SelectLanguageProps> = ({ openBtn, handleMenuClose }) => {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState('');

  const formTitle = (
    <Typography variant='h4' component='span'>
      {t('Select language')}
    </Typography>
  );

  const handleLangChange = async (lang: string, handleClose: HandleClose) => {
    await i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
    handleClose();
    handleMenuClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setQuery(e.target.value);

  const formContent = ({ handleClose }: { handleClose: HandleClose }) => (
    <div>
      <Input
        variant='main-m'
        placeholder='Search ...'
        value={query}
        onChange={handleInputChange}
        handleCleanUp={() => setQuery('')}
        sx={{ mb: 1.5 }}
      />
      {i18n.languages
        .filter(lang =>
          LANGUAGES_MAP[lang as Lang].toLowerCase().includes(query.toLowerCase())
        )
        .map(lang => (
          <AppMenuItem
            key={lang}
            value={lang}
            onClick={() => handleLangChange(lang, handleClose)}
          >
            <Box display='flex' alignItems='center'>
              <ReactCountryFlag
                countryCode={LANG_TO_COUNTRY_CODE_MAP[lang as Lang]}
                style={{ fontSize: '1.25em' }}
              />
              <Box sx={{ ml: 1 }}>{LANGUAGES_MAP[lang as Lang]}</Box>
            </Box>
          </AppMenuItem>
        ))}
    </div>
  );

  return (
    <DialogWrapper
      maxWidth='sm'
      renderOpenBtn={({ handleOpen }) => cloneElement(openBtn, { onClick: handleOpen })}
      title={formTitle}
      renderContent={formContent}
    />
  );
};

export default SelectLanguage;
