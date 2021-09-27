import React, { MouseEvent } from 'react';
import {
  AppBar,
  Typography,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  useScrollTrigger,
  Grid,
} from '@mui/material';
import {
  SearchApiSearchRequest,
  SearchFacetsData,
  AssociatedOwner,
} from 'generated-sources';
import { useHistory, Link, useLocation } from 'react-router-dom';
import { searchPath } from 'lib/paths';
import { AccountCircle } from '@mui/icons-material';
import AppTabs, { AppTabItem } from 'components/shared/AppTabs/AppTabs';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { StylesType } from './AppToolbarStyles';

interface AppToolbarProps extends StylesType {
  identity?: AssociatedOwner;
  fetchIdentity: () => Promise<AssociatedOwner | void>;
  createDataEntitiesSearch: (
    params: SearchApiSearchRequest
  ) => Promise<SearchFacetsData>;
}

const AppToolbar: React.FC<AppToolbarProps> = ({
  classes,
  identity,
  createDataEntitiesSearch,
  fetchIdentity,
}) => {
  const location = useLocation();
  const history = useHistory();
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
    fetchIdentity();
  }, []);

  const [tabs] = React.useState<AppTabItem[]>([
    { name: 'Catalog', link: '/search' },
    { name: 'Management', link: '/management' },
    { name: 'Alerts', link: '/alerts' },
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

  const handleTabClick = (idx: number) => {
    if (tabs[idx].name === 'Catalog') {
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
    }
  };

  return (
    <AppBar
      position="fixed"
      elevation={elevation}
      classes={{
        root: classes.lightBg,
      }}
    >
      <Toolbar disableGutters className={classes.container}>
        <Grid container className={classes.contentContainer}>
          <Grid item xs={3} className={classes.logoContainer}>
            <Link to="/" className={classes.title}>
              <div className={classes.logo} />
              <Typography variant="h4" noWrap>
                Platform
              </Typography>
            </Link>
          </Grid>
          <Grid item xs={9} className={classes.actionsContainer}>
            <Grid item className={classes.tabsContainer}>
              {tabs.length ? (
                <AppTabs
                  variant="menu"
                  items={tabs}
                  selectedTab={selectedTab}
                  handleTabChange={handleTabClick}
                />
              ) : null}
            </Grid>
            <Grid item className={classes.sectionDesktop}>
              <AccountCircle className={classes.userAvatar} />
              <p className={classes.userName}>
                {identity?.identity.username}
              </p>
              <IconButton
                edge="end"
                aria-label="account of current user"
                aria-controls={menuId}
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
                size="large"
              >
                <ArrowDropDownIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
      </Toolbar>
      <Menu
        classes={{ paper: classes.menu }}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        id={menuId}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={isMenuOpen}
        onClose={handleMenuClose}
      >
        {/* <MenuItem onClick={handleMenuClose}>Profile</MenuItem> */}
        <MenuItem className={classes.menuItem} onClick={handleLogout}>
          Logout
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default AppToolbar;
