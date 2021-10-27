import React, { ChangeEvent, SyntheticEvent } from 'react';
import { Skeleton, Tab, TabProps, Tabs, Typography } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import { Link, LinkProps } from 'react-router-dom';
import cx from 'classnames';
import NumberFormatted from 'components/shared/NumberFormatted/NumberFormatted';
import { styles, StylesType } from './AppTabsStyles';

const LinkTab: React.ComponentType<
  TabProps & LinkProps
> = Tab as React.ComponentType<TabProps & LinkProps>;

export type AppTabItem<ValueT = number | string> = {
  name: string;
  link?: string;
  hint?: number | string;
  value?: ValueT;
  hidden?: boolean;
};

interface AppTabsProps extends StylesType {
  className?: string;
  items: AppTabItem[];
  handleTabChange: (newTab: number) => void;
  selectedTab?: number | boolean;
  variant: 'primary' | 'secondary' | 'secondarySmall' | 'menu';
  orientation?: 'horizontal' | 'vertical';
  isHintUpdated?: boolean;
}

const AppTabs: React.FC<AppTabsProps> = ({
  classes,
  className,
  items,
  handleTabChange,
  selectedTab,
  variant,
  orientation,
  isHintUpdated = false,
}) => {
  const [currentTab, setCurrent] = React.useState<
    number | boolean | undefined
  >(selectedTab);

  const handleChange = (event: SyntheticEvent, newTab: number) => {
    setCurrent(newTab);
    handleTabChange(newTab);
  };

  React.useEffect(() => {
    setCurrent(selectedTab);
  }, [selectedTab]);

  return (
    <div className={cx(classes.container, className)}>
      <Tabs
        value={currentTab}
        onChange={handleChange}
        variant="scrollable"
        orientation={orientation}
        scrollButtons="auto"
        classes={{
          root: cx(classes.tabsContainer, variant, orientation),
          indicator: cx(classes.tabIndicator, variant),
        }}
      >
        {items.map(item =>
          item.link ? (
            <LinkTab
              hidden={item.hidden}
              key={item.name}
              label={
                <Typography
                  variant="body1"
                  className={classes.tabItemLabel}
                  component="span"
                >
                  {item.name}
                  {item.hint !== undefined &&
                    variant === 'primary' &&
                    !isHintUpdated && (
                      <div className={classes.hintContainer}>
                        <NumberFormatted value={item.hint} precision={0} />
                      </div>
                    )}
                  {variant === 'primary' && isHintUpdated && (
                    <div className={classes.hintContainer}>
                      <Skeleton width="18px" height="27px" />
                    </div>
                  )}
                </Typography>
              }
              to={item.link}
              component={Link}
              classes={{
                root: cx(classes.tabItem, variant, orientation),
                selected: cx(classes.tabItemSelected, variant),
              }}
            />
          ) : (
            <Tab
              hidden={item.hidden}
              key={item.name}
              label={
                <Typography
                  variant="body1"
                  className={classes.tabItemLabel}
                  component="span"
                >
                  {item.name}
                  {item.hint !== undefined &&
                    variant === 'primary' &&
                    !isHintUpdated && (
                      <div className={classes.hintContainer}>
                        <NumberFormatted value={item.hint} precision={0} />
                      </div>
                    )}
                  {variant === 'primary' && isHintUpdated && (
                    <div className={classes.hintContainer}>
                      <Skeleton width="18px" height="27px" />
                    </div>
                  )}
                </Typography>
              }
              classes={{
                root: cx(classes.tabItem, variant, orientation),
                selected: cx(classes.tabItemSelected, variant),
              }}
            />
          )
        )}
      </Tabs>
    </div>
  );
};

export default withStyles(styles)(AppTabs);
