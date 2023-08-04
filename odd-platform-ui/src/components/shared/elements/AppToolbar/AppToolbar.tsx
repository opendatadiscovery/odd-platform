import React, { type FC, type MouseEvent, useCallback, useEffect, useState } from 'react';
import type { SelectChangeEvent } from '@mui/material';
import { Grid, Typography, useScrollTrigger } from '@mui/material';
import { getIdentity, getOwnership } from 'redux/selectors';
import { useAppSelector } from 'redux/lib/hooks';
import { DropdownIcon } from 'components/shared/icons';
import AppMenu from 'components/shared/elements/AppMenu/AppMenu';
import AppMenuItem from 'components/shared/elements/AppMenuItem/AppMenuItem';
import { useAppPaths } from 'lib/hooks';
import ToolbarTabs from 'components/shared/elements/AppToolbar/ToolbarTabs/ToolbarTabs';
import AppInfoMenu from 'components/shared/elements/AppToolbar/AppInfoMenu/AppInfoMenu';
import Button from 'components/shared/elements/Button/Button';
import AppSelect from 'components/shared/elements/AppSelect/AppSelect';
import * as S from 'components/shared/elements/AppToolbar/AppToolbarStyles';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from 'lib/constants';

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

  const handleLangChange = useCallback(
    async (e: SelectChangeEvent<unknown>) => {
      await i18n.changeLanguage(e.target.value as string);
    },
    [i18n.changeLanguage]
  );

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
              <AppSelect
                defaultValue='en'
                containerSx={{ mr: 1 }}
                onChange={handleLangChange}
              >
                {LANGUAGES.map(({ code, label }) => (
                  <AppMenuItem key={code} value={code}>
                    {label}
                  </AppMenuItem>
                ))}
              </AppSelect>
              <AppInfoMenu />
              <S.UserName>{owner?.name ?? identity?.username}</S.UserName>
              <Button
                buttonType='linkGray-m'
                icon={<DropdownIcon />}
                aria-label='account of current user'
                aria-controls={menuId}
                aria-haspopup='true'
                onClick={handleProfileMenuOpen}
              />
            </S.SectionDesktop>
          </S.ActionsContainer>
        </S.ContentContainer>
      </S.Container>
      <AppMenu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        id={menuId}
        keepMounted
        transformOrigin={{ vertical: -20, horizontal: 'right' }}
        open={isMenuOpen}
        onClose={handleMenuClose}
      >
        <AppMenuItem onClick={handleLogout}>{t('Logout')}</AppMenuItem>
      </AppMenu>
    </S.Bar>
  );
};

export default AppToolbar;
