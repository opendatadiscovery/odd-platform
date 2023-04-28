import React, { type MouseEvent } from 'react';
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
import * as S from 'components/shared/elements/AppToolbar/AppToolbarStyles';

const AppToolbar: React.FC = () => {
  const { basePath } = useAppPaths();
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
              <S.UserName>{owner?.name || identity?.username}</S.UserName>
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
        <AppMenuItem onClick={handleLogout}>Logout</AppMenuItem>
      </AppMenu>
    </S.Bar>
  );
};

export default AppToolbar;
