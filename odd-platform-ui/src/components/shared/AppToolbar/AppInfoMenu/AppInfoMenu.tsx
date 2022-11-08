import React, { MouseEvent } from 'react';
import { AppIconButton, AppMenu } from 'components/shared/index';
import {
  GitBookIcon,
  GitHubIcon,
  InformationIcon,
  SlackIcon,
} from 'components/shared/Icons';
import { useAppSelector } from 'redux/lib/hooks';
import { getVersion } from 'redux/selectors';
import { Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import * as S from './AppInfoMenuStyles';

const AppInfoMenu: React.FC = () => {
  const version = useAppSelector(getVersion);

  const gitbookLink = 'https://docs.opendatadiscovery.org/';
  const slackLink = 'https://go.opendatadiscovery.org/slack';
  const githubLink = 'https://github.com/opendatadiscovery/odd-platform';

  const menuId = 'app-info-menu';
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleAppMenuOpen = (event: MouseEvent) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAppMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Grid>
      <Grid item>
        <AppIconButton
          sx={{ mr: 2 }}
          icon={<InformationIcon variant='dark' width={20} height={20} />}
          color='unfilled'
          edge='end'
          aria-label='app info menu'
          aria-controls={menuId}
          aria-haspopup='true'
          onClick={handleAppMenuOpen}
          onMouseEnter={handleAppMenuOpen}
        />
      </Grid>
      <AppMenu
        MenuListProps={{ sx: { px: 1, py: 2 } }}
        // sty={{pap}}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        id={menuId}
        keepMounted
        transformOrigin={{ vertical: -20, horizontal: 'right' }}
        open={isMenuOpen}
        onClose={handleAppMenuClose}
      >
        <Link to={{ pathname: gitbookLink }} target='_blank'>
          <S.MenuItem container onClick={handleAppMenuClose}>
            <S.Icon>
              <GitBookIcon />
            </S.Icon>
            <Typography variant='h3'>Documents</Typography>
          </S.MenuItem>
        </Link>
        <Link to={{ pathname: slackLink }} target='_blank'>
          <S.MenuItem container onClick={handleAppMenuClose}>
            <S.Icon>
              <SlackIcon />
            </S.Icon>
            <Typography variant='h3'>Slack</Typography>
          </S.MenuItem>
        </Link>
        <Link to={{ pathname: githubLink }} target='_blank'>
          <S.MenuItem container onClick={handleAppMenuClose}>
            <S.Icon>
              <GitHubIcon />
            </S.Icon>
            <Typography variant='h3'>{version}</Typography>
          </S.MenuItem>
        </Link>
      </AppMenu>
    </Grid>
  );
};

export default AppInfoMenu;
