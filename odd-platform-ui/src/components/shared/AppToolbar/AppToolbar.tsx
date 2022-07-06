import React, { MouseEvent } from 'react';
import { Grid, Typography, useScrollTrigger } from '@mui/material';
import {
  AppInfo,
  AssociatedOwner,
  SearchApiSearchRequest,
  SearchFacetsData,
  TermApiTermSearchRequest,
  TermSearchFacetsData,
} from 'generated-sources';
import { useHistory, useLocation } from 'react-router-dom';
import { searchPath, termSearchPath } from 'lib/paths';
import AppTabs, { AppTabItem } from 'components/shared/AppTabs/AppTabs';
import DropdownIcon from 'components/shared/Icons/DropdownIcon';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import AppMenu from 'components/shared/AppMenu/AppMenu';
import AppMenuItem from 'components/shared/AppMenuItem/AppMenuItem';
import { useAppDispatch } from 'lib/redux/hooks';
import { clearActivityFilters } from 'redux/reducers/activity.slice';
import * as S from './AppToolbarStyles';

interface AppToolbarProps {
  identity?: AssociatedOwner;
  version?: string;
  fetchIdentity: () => Promise<AssociatedOwner | void>;
  createDataEntitiesSearch: (
    params: SearchApiSearchRequest
  ) => Promise<SearchFacetsData>;
  createTermSearch: (
    params: TermApiTermSearchRequest
  ) => Promise<TermSearchFacetsData>;
  fetchAppInfo: () => Promise<AppInfo | void>;
}

const AppToolbar: React.FC<AppToolbarProps> = ({
  identity,
  version,
  createDataEntitiesSearch,
  createTermSearch,
  fetchIdentity,
  fetchAppInfo,
}) => {
  const location = useLocation();
  const history = useHistory();
  const menuId = 'primary-search-account-menu';
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
  const isMenuOpen = Boolean(anchorEl);
  const dispatch = useAppDispatch();

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
    fetchIdentity();
    fetchAppInfo();
  }, []);

  const [tabs] = React.useState<AppTabItem[]>([
    { name: 'Catalog', link: '/search' },
    { name: 'Management', link: '/management' },
    { name: 'Dictionary', link: '/termsearch' },
    { name: 'Alerts', link: '/alerts/' },
    { name: 'Activity', link: '/activity' },
  ]);

  const [selectedTab, setSelectedTab] = React.useState<number | boolean>(
    false
  );

  React.useEffect(() => {
    const newTabIndex = tabs.findIndex(
      tab => tab.link && location.pathname.includes(tab.link)
    );
    if (newTabIndex >= 0) {
      setSelectedTab(newTabIndex);
    } else {
      setSelectedTab(false);
    }
  }, [setSelectedTab, location.pathname]);

  const [searchLoading, setSearchLoading] = React.useState<boolean>(false);
  const [termSearchLoading, setTermSearchLoading] =
    React.useState<boolean>(false);

  const handleTabClick = (idx: number) => {
    if (tabs[idx].name === 'Dictionary') {
      if (termSearchLoading) return;
      setTermSearchLoading(true);
      const termSearchQuery = {
        query: '',
        pageSize: 30,
        filters: {},
      };
      createTermSearch({ termSearchFormData: termSearchQuery }).then(
        termSearch => {
          const termSearchLink = termSearchPath(termSearch.searchId);
          history.replace(termSearchLink);
          setTermSearchLoading(false);
        }
      );
    } else if (tabs[idx].name === 'Catalog') {
      if (searchLoading) return;
      setSearchLoading(true);
      const searchQuery = {
        query: '',
        pageSize: 30,
        filters: {},
      };
      createDataEntitiesSearch({ searchFormData: searchQuery }).then(
        search => {
          const searchLink = searchPath(search.searchId);
          history.replace(searchLink);
          setSearchLoading(false);
        }
      );
    } else if (tabs[idx].name === 'Activity') {
      dispatch(clearActivityFilters());
    }
  };

  return (
    <S.Bar position="fixed" elevation={elevation}>
      <S.Container disableGutters>
        <S.ContentContainer container>
          <S.LogoContainer item xs={3}>
            <S.Title to="/">
              <S.Logo />
              <Typography variant="h4" noWrap>
                Platform
              </Typography>
            </S.Title>
          </S.LogoContainer>
          <S.ActionsContainer item xs={9}>
            <Grid item sx={{ pl: 1 }}>
              {tabs.length ? (
                <AppTabs
                  type="menu"
                  items={tabs}
                  selectedTab={selectedTab}
                  handleTabChange={handleTabClick}
                />
              ) : null}
            </Grid>
            <S.SectionDesktop item>
              <S.UserAvatar stroke="currentColor" />
              <S.UserName>{identity?.identity.username}</S.UserName>
              <AppIconButton
                icon={<DropdownIcon />}
                color="unfilled"
                edge="end"
                aria-label="account of current user"
                aria-controls={menuId}
                aria-haspopup="true"
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
              <Typography variant="caption">
                ODD Platform v.{version}
              </Typography>
            </S.CaptionsTypographyWrapper>
          </S.CaptionsWrapper>
        )}
      </AppMenu>
    </S.Bar>
  );
};

export default AppToolbar;
