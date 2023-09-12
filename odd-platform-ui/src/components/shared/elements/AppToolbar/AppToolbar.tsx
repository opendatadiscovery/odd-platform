import React, { type FC, type MouseEvent, useEffect, useState } from 'react';
import { Box, Grid, Typography, useScrollTrigger } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getIdentity, getOwnership } from 'redux/selectors';
import { useAppSelector } from 'redux/lib/hooks';
import { DropdownIcon } from 'components/shared/icons';
import AppMenu from 'components/shared/elements/AppMenu/AppMenu';
import AppMenuItem from 'components/shared/elements/AppMenuItem/AppMenuItem';
import { useAppPaths } from 'lib/hooks';
import ToolbarTabs from 'components/shared/elements/AppToolbar/ToolbarTabs/ToolbarTabs';
import AppInfoMenu from 'components/shared/elements/AppToolbar/AppInfoMenu/AppInfoMenu';
import Button from 'components/shared/elements/Button/Button';
import * as S from 'components/shared/elements/AppToolbar/AppToolbarStyles';
import { LANGUAGES_MAP } from 'lib/constants';
import SelectLanguage from 'components/shared/elements/AppToolbar/SelectLanguage/SelectLanguage';
import ChevronIcon from 'components/shared/icons/ChevronIcon';
import type { Lang } from 'lib/interfaces';

const AppToolbar: FC = () => {
  const { basePath } = useAppPaths();
  const { i18n, t } = useTranslation();
  const identity = useAppSelector(getIdentity);
  const owner = useAppSelector(getOwnership);

  const menuId = 'primary-search-account-menu';
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event: MouseEvent) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    window.location.href = '/logout';
  };

  const [elevation, setElevation] = useState(0);
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 10,
    target: window,
  });

  useEffect(() => setElevation(trigger ? 3 : 0), [trigger]);

  const currentLanguage = LANGUAGES_MAP[i18n.language as Lang];

  return (
    <S.Bar position='fixed' elevation={elevation}>
      <S.Container disableGutters>
        <S.ContentContainer container>
          <S.LogoContainer item xs={3}>
            <S.Title to={basePath}>
              <S.Logo />
              <Typography variant='h4' noWrap>
                Platform
              </Typography>
            </S.Title>
          </S.LogoContainer>
          <S.ActionsContainer item xs={9}>
            <Grid item sx={{ pl: 1 }}>
              <ToolbarTabs />
            </Grid>
            <S.SectionDesktop item>
              <AppInfoMenu />
              <Box
                display='flex'
                alignItems='center'
                sx={{ '&:hover': { cursor: 'pointer' } }}
                onClick={handleProfileMenuOpen}
              >
                <S.UserName>{owner?.name ?? identity?.username}</S.UserName>
                <Button
                  buttonType='linkGray-m'
                  icon={<DropdownIcon />}
                  aria-label='account of current user'
                  aria-controls={menuId}
                  aria-haspopup='true'
                />
              </Box>
            </S.SectionDesktop>
          </S.ActionsContainer>
        </S.ContentContainer>
      </S.Container>
      <AppMenu
        PaperProps={{ sx: { width: '240px' } }}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        id={menuId}
        keepMounted
        transformOrigin={{ vertical: -20, horizontal: 'right' }}
        open={isMenuOpen}
        onClose={handleMenuClose}
      >
        <SelectLanguage
          handleMenuClose={handleMenuClose}
          openBtn={
            <AppMenuItem>
              <S.LanguageContainer>
                <div>{t('Select language')}</div>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>{currentLanguage}</div>{' '}
                  <ChevronIcon transform='rotate(-90)' sx={{ ml: 0.5 }} />
                </Box>
              </S.LanguageContainer>
            </AppMenuItem>
          }
        />
        <AppMenuItem onClick={handleLogout}>{t('Logout')}</AppMenuItem>
      </AppMenu>
    </S.Bar>
  );
};

export default AppToolbar;
