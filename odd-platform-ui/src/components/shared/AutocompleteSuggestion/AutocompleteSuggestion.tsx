import React from 'react';
import {
  StylesType,
  styles,
} from 'components/shared/AutocompleteSuggestion/AutocompleteSuggestionStyles';
import withStyles from '@mui/styles/withStyles';

interface AutocompleteSuggestionProps extends StylesType {
  optionLabel: string;
  optionName: string | undefined;
}

const AutocompleteSuggestion: React.FC<AutocompleteSuggestionProps> = ({
  classes,
  optionLabel,
  optionName,
}) => (
  <span className={classes.container}>
    <span className={classes.noResultText}>No result.</span>{' '}
    <span className={classes.createNewOptionText}>
      Create new {optionLabel} &quot;{optionName}&quot;
    </span>
  </span>
);

export default withStyles(styles)(AutocompleteSuggestion);
