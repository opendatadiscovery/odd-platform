import React, { MouseEvent } from 'react';
import {
  GitBookIcon,
  GitHubIcon,
  InformationIcon,
  SlackIcon,
} from 'components/shared/Icons';
import { useAppSelector } from 'redux/lib/hooks';
import { getAppLinks, getVersion } from 'redux/selectors';
import { Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import AppMenu from '../../AppMenu/AppMenu';
import AppIconButton from '../../AppIconButton/AppIconButton';
import * as S from './AppInfoMenuStyles';

const AppInfoMenu: React.FC = () => {
  const version = useAppSelector(getVersion);
  const links = useAppSelector(getAppLinks);

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
        {version && (
          <Link to={{ pathname: githubLink }} target='_blank'>
            <S.MenuItem container onClick={handleAppMenuClose}>
              <S.Icon>
                <GitHubIcon />
              </S.Icon>
              <Grid container flexDirection='column'>
                <Typography variant='h3'>{version}</Typography>
                <Typography variant='subtitle1'>ODD Platform version</Typography>
              </Grid>
            </S.MenuItem>
          </Link>
        )}
        {links.length > 0 && (
          <S.LinksContainer container>
            {links.map(link => (
              <Link to={{ pathname: link.url }} target='_blank'>
                <S.MenuItem container onClick={handleAppMenuClose}>
                  <Typography variant='h3'>{link.title}</Typography>
                </S.MenuItem>
              </Link>
            ))}
          </S.LinksContainer>
        )}
      </AppMenu>
    </Grid>
  );
};

export default AppInfoMenu;
