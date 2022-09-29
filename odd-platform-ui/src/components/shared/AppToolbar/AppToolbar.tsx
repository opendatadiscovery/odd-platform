import React, { MouseEvent } from 'react';
import { Grid, Typography, useScrollTrigger } from '@mui/material';
import { getIdentity, getVersion } from 'redux/selectors';
import {
  createDataEntitiesSearch,
  createTermSearch,
  fetchAppInfo,
  fetchIdentity,
} from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { useHistory, useLocation } from 'react-router-dom';
import { DropdownIcon } from 'components/shared/Icons';
import { clearActivityFilters } from 'redux/slices/activity.slice';
import { useAppPaths } from 'lib/hooks';
import {
  AppIconButton,
  AppMenu,
  AppMenuItem,
  AppTabItem,
  AppTabs,
} from 'components/shared';
import * as S from './AppToolbarStyles';

const AppToolbar: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const { searchPath, termSearchPath } = useAppPaths();

  const version = useAppSelector(getVersion);
  const identity = useAppSelector(getIdentity);

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

  const [elevation, setElevation] = React.useState<number>(0);
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 10,
    target: window,
  });

  React.useEffect(() => setElevation(trigger ? 3 : 0), [trigger]);

  React.useEffect(() => {
    dispatch(fetchIdentity());
    dispatch(fetchAppInfo());
  }, []);

  const [tabs] = React.useState<AppTabItem[]>([
    { name: 'Catalog', link: '/search' },
    { name: 'Management', link: '/management' },
    { name: 'Dictionary', link: '/termsearch' },
    { name: 'Alerts', link: '/alerts' },
    { name: 'Activity', link: '/activity' },
  ]);

  const [selectedTab, setSelectedTab] = React.useState<number | boolean>(false);

  React.useEffect(() => {
    const newTabIndex = tabs.findIndex(tab => {
      if (tab.link === '/activity' || tab.link === '/alerts') {
        return (
          location.pathname.includes(tab.link) &&
          !location.pathname.includes('dataentities')
        );
      }

      return tab.link && location.pathname.includes(tab.link);
    });

    if (newTabIndex >= 0) {
      setSelectedTab(newTabIndex);
    } else {
      setSelectedTab(false);
    }
  }, [setSelectedTab, location.pathname]);

  const [searchLoading, setSearchLoading] = React.useState<boolean>(false);
  const [termSearchLoading, setTermSearchLoading] = React.useState<boolean>(false);

  const handleTabClick = (idx: number) => {
    if (tabs[idx].name === 'Dictionary') {
      if (termSearchLoading) return;
      setTermSearchLoading(true);
      const termSearchQuery = {
        query: '',
        pageSize: 30,
        filters: {},
      };

      dispatch(createTermSearch({ termSearchFormData: termSearchQuery }))
        .unwrap()
        .then(termSearch => {
          const termSearchLink = termSearchPath(termSearch.searchId);
          history.replace(termSearchLink);
          setTermSearchLoading(false);
        });
    } else if (tabs[idx].name === 'Catalog') {
      if (searchLoading) return;
      setSearchLoading(true);
      const searchQuery = {
        query: '',
        pageSize: 30,
        filters: {},
      };

      dispatch(createDataEntitiesSearch({ searchFormData: searchQuery }))
        .unwrap()
        .then(({ searchId }) => {
          const searchLink = searchPath(searchId);
          history.replace(searchLink);
          setSearchLoading(false);
        });
    } else if (tabs[idx].name === 'Activity') {
      dispatch(clearActivityFilters());
    }
  };

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
              {tabs.length ? (
                <AppTabs
                  type='menu'
                  items={tabs}
                  selectedTab={selectedTab}
                  handleTabChange={handleTabClick}
                />
              ) : null}
            </Grid>
            <S.SectionDesktop item>
              <S.UserAvatar stroke='currentColor' />
              <S.UserName>{identity?.username}</S.UserName>
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
        transformOrigin={{ vertical: -42, horizontal: 'right' }}
        open={isMenuOpen}
        onClose={handleMenuClose}
      >
        <AppMenuItem onClick={handleLogout}>Logout</AppMenuItem>
        {version && (
          <S.CaptionsWrapper>
            <AppMenuItem divider />
            <S.CaptionsTypographyWrapper>
              <Typography variant='caption'>ODD Platform v.{version}</Typography>
            </S.CaptionsTypographyWrapper>
          </S.CaptionsWrapper>
        )}
      </AppMenu>
    </S.Bar>
  );
};

export default AppToolbar;
