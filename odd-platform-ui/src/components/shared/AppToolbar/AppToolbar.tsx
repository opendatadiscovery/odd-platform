import React, { type MouseEvent } from 'react';
import { Grid, Typography, useScrollTrigger } from '@mui/material';
import { getIdentity, getOwnership } from 'redux/selectors';
import { fetchActiveFeatures, fetchAppInfo, fetchIdentity } from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { DropdownIcon } from 'components/shared/Icons';
import { AppIconButton, AppMenu, AppMenuItem } from 'components/shared';
import ToolbarTabs from './ToolbarTabs/ToolbarTabs';
import * as S from './AppToolbarStyles';
import AppInfoMenu from './AppInfoMenu/AppInfoMenu';

const AppToolbar: React.FC = () => {
  const dispatch = useAppDispatch();

  const identity = useAppSelector(getIdentity);
  const owner = useAppSelector(getOwnership);

  const menuId = 'primary-search-account-menu';
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
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

  const [elevation, setElevation] = React.useState(0);
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 10,
    target: window,
  });

  React.useEffect(() => setElevation(trigger ? 3 : 0), [trigger]);

  React.useEffect(() => {
    dispatch(fetchIdentity());
    dispatch(fetchAppInfo());
    dispatch(fetchActiveFeatures());
  }, []);

  return (
    <S.Bar position='fixed' elevation={elevation}>
      <S.Container disableGutters>
        <S.ContentContainer container>
          <S.LogoContainer item xs={3}>
            <S.Title to='/'>
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
              <S.UserAvatar stroke='currentColor' />
              <S.UserName>{owner?.name || identity?.username}</S.UserName>
              <AppIconButton
                icon={<DropdownIcon />}
                color='unfilled'
                edge='end'
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
        <AppMenuItem onClick={handleLogout}>Logout</AppMenuItem>
      </AppMenu>
    </S.Bar>
  );
};

export default AppToolbar;
