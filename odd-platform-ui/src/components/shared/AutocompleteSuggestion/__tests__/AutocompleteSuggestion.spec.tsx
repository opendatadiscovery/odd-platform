import React from 'react';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import AutocompleteSuggestion, {
  AutocompleteSuggestionProps,
} from '../AutocompleteSuggestion';

describe('AutocompleteSuggestion', () => {
  const setupComponent = (props?: Partial<AutocompleteSuggestionProps>) =>
    render(
      <AutocompleteSuggestion optionLabel="" optionName="" {...props}>
        AutocompleteSuggestionChild
      </AutocompleteSuggestion>
    );

  it('AutocompleteSuggestion renders correctly ', () => {
    setupComponent();
    const autocompleteSuggestion = screen.getByLabelText(
      'AutocompleteSuggestion'
    );
    expect(autocompleteSuggestion).toBeInTheDocument();
  });

  it('AutocompleteSuggestions renders optionLabel and optionName correctly ', () => {
    const optionLabelProp = 'optionLabelProp';
    const optionNameProp = 'optionNameProp';
    setupComponent({
      optionName: optionNameProp,
      optionLabel: optionLabelProp,
    });
    const autocompleteSuggestion = screen.getByLabelText(
      'AutocompleteSuggestion'
    );
    expect(autocompleteSuggestion).toHaveTextContent(optionLabelProp);
    expect(autocompleteSuggestion).toHaveTextContent(optionNameProp);
  });
});
