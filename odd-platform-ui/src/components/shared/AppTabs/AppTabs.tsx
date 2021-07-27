import React, { ChangeEvent } from 'react';
import {
  withStyles,
  Tabs,
  Tab,
  TabProps,
  Typography,
} from '@material-ui/core';
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
}

const AppTabs: React.FC<AppTabsProps> = ({
  classes,
  className,
  items,
  handleTabChange,
  selectedTab,
  variant,
  orientation,
}) => {
  const [currentTab, setCurrent] = React.useState<
    number | boolean | undefined
  >(selectedTab);

  const handleChange = (
    event: ChangeEvent<Record<string, never>>,
    newTab: number
  ) => {
    setCurrent(newTab);
    handleTabChange(newTab);
  };

  React.useEffect(() => {
    setCurrent(selectedTab);
  }, [selectedTab]);

  const formatName = (name: string) => {
    const splitName = name.split('_');
    const firstWord =
      splitName[0].charAt(0).toUpperCase() + splitName[0].slice(1);
    splitName[0] = firstWord;
    return splitName.join(' ');
  };

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
              key={formatName(item.name)}
              label={
                <Typography
                  variant="body1"
                  className={classes.tabItemLabel}
                >
                  {formatName(item.name)}
                  {item.hint !== undefined && variant === 'primary' && (
                    <NumberFormatted value={item.hint} precision={0} />
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
              key={formatName(item.name)}
              label={
                <Typography
                  variant="body1"
                  className={classes.tabItemLabel}
                >
                  {formatName(item.name)}
                  {item.hint !== undefined && variant === 'primary' && (
                    <NumberFormatted value={item.hint} precision={0} />
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
