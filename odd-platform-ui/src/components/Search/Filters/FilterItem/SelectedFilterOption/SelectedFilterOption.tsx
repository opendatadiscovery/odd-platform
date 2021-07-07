import React from 'react';
import { useDispatch } from 'react-redux';
import { IconButton, withStyles, Typography } from '@material-ui/core';
import cx from 'classnames';
import { SearchFilter, SearchFilterState } from 'generated-sources';
import * as actions from 'redux/actions';
import CloseIcon from '@material-ui/icons/Close';
import TextFormatted from 'components/shared/TextFormatted/TextFormatted';
import { OptionalFacetNames } from 'redux/interfaces/search';
import { styles, StylesType } from './SelectedFilterOptionStyles';

interface FilterItemProps extends StylesType {
  className?: string;
  filter: SearchFilter | SearchFilterState;
  facetName: OptionalFacetNames;
}

const SelectedFilterOption: React.FC<FilterItemProps> = ({
  classes,
  className,
  filter,
  facetName,
}) => {
  const dispatch = useDispatch();
  const filterId = 'id' in filter ? filter.id : filter.entityId;
  const filterName = 'name' in filter ? filter.name : filter.entityName;
  const onRemoveClick = () => {
    dispatch(
      actions.changeDataEntitySearchFilterAction({
        facetName,
        facetOptionId: filterId,
        facetOptionName: filterName,
        facetOptionState: false,
      })
    );
  };

  return (
    <div className={cx(classes.container, className)}>
      <div className={classes.content}>
        <Typography noWrap title={filterName}>
          <TextFormatted value={filterName} />
        </Typography>
        <IconButton className={classes.removeBtn} onClick={onRemoveClick}>
          <CloseIcon fontSize="inherit" />
        </IconButton>
      </div>
    </div>
  );
};

export default withStyles(styles)(SelectedFilterOption);
