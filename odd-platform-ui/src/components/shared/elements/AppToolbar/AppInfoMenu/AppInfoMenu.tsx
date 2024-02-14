import React, { type MouseEvent } from 'react';
import { Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import {
  FeedbackIcon,
  GitBookIcon,
  GitHubIcon,
  InformationIcon,
  SlackIcon,
} from 'components/shared/icons';
import AppMenu from 'components/shared/elements/AppMenu/AppMenu';
import { useAppInfo, useAppLinks } from 'lib/hooks/api';
import * as S from 'components/shared/elements/AppToolbar/AppInfoMenu/AppInfoMenuStyles';
import Button from 'components/shared/elements/Button/Button';

const AppInfoMenu: React.FC = () => {
  const { data: appInfo } = useAppInfo();
  const { data: links } = useAppLinks();

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

  const projectVersion = React.useMemo(() => {
    if (!appInfo?.projectVersion) return null;

    return (
      <Link to={githubLink} target='_blank'>
        <S.MenuItem container>
          <S.Icon>
            <GitHubIcon />
          </S.Icon>
          <Grid container flexDirection='column'>
            <Typography variant='h4'>{appInfo.projectVersion}</Typography>
            <Typography variant='subtitle1'>ODD Platform version</Typography>
          </Grid>
        </S.MenuItem>
      </Link>
    );
  }, [appInfo?.projectVersion]);

  const projectLinks = React.useMemo(() => {
    if (!links || links.length === 0) return null;

    return (
      <S.LinksContainer container>
        {links.map(link => (
          <Link key={link.url} to={link.url} target='_blank'>
            <S.MenuItem container>
              <Typography variant='h4'>{link.title}</Typography>
            </S.MenuItem>
          </Link>
        ))}
      </S.LinksContainer>
    );
  }, [links]);

  return (
    <Grid>
      <Grid item>
        <Button
          sx={{ mr: 1 }}
          icon={<InformationIcon width={16} height={16} />}
          buttonType='linkGray-m'
          aria-label='app info menu'
          aria-controls={menuId}
          aria-haspopup='true'
          onMouseEnter={handleAppMenuOpen}
        />
      </Grid>
      <AppMenu
        PaperProps={{ sx: { borderRadius: 2 }, onMouseLeave: handleAppMenuClose }}
        MenuListProps={{ sx: { p: 1 } }}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        id={menuId}
        keepMounted
        transformOrigin={{ vertical: -20, horizontal: 'right' }}
        open={isMenuOpen}
        onClose={handleAppMenuClose}
      >
        <Link to={gitbookLink} target='_blank'>
          <S.MenuItem container>
            <S.Icon>
              <GitBookIcon />
            </S.Icon>
            <Typography variant='h4'>Documentation</Typography>
          </S.MenuItem>
        </Link>
        <Link to={slackLink} target='_blank'>
          <S.MenuItem container>
            <S.Icon>
              <SlackIcon />
            </S.Icon>
            <Typography variant='h4'>Slack</Typography>
          </S.MenuItem>
        </Link>
        {projectVersion}
        <Link to={reviewLink} target='_blank'>
          <S.MenuItem container $last>
            <S.Icon>
              <FeedbackIcon />
            </S.Icon>
            <Typography variant='h4'>Leave a feedback</Typography>
          </S.MenuItem>
        </Link>
        {projectLinks}
      </AppMenu>
    </Grid>
  );
};

export default AppInfoMenu;
