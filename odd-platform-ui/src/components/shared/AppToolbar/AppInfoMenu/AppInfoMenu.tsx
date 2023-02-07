import React, { type MouseEvent } from 'react';
import {
  FeedbackIcon,
  GitBookIcon,
  GitHubIcon,
  InformationIcon,
  SlackIcon,
} from 'components/shared/Icons';
import { useAppSelector } from 'redux/lib/hooks';
import { getAppLinks, getVersion } from 'redux/selectors';
import { Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import AppMenu from 'components/shared/AppMenu/AppMenu';
import * as S from './AppInfoMenuStyles';

const AppInfoMenu: React.FC = () => {
  const version = useAppSelector(getVersion);
  const links = useAppSelector(getAppLinks);

  const gitbookLink = 'https://docs.opendatadiscovery.org/';
  const slackLink = 'https://go.opendatadiscovery.org/slack';
  const githubLink = 'https://github.com/opendatadiscovery/odd-platform';
  const reviewLink = 'https://www.producthunt.com/products/opendatadiscovery/reviews/new';

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
          icon={<InformationIcon width={20} height={20} />}
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
            <Typography variant='h3'>Documentation</Typography>
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
        <Link to={{ pathname: reviewLink }} target='_blank'>
          <S.MenuItem container onClick={handleAppMenuClose}>
            <S.Icon>
              <FeedbackIcon />
            </S.Icon>
            <Typography variant='h3'>Leave a feedback</Typography>
          </S.MenuItem>
        </Link>
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
