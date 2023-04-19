import React from 'react';
import { render } from '@testing-library/react';
import { getByText } from 'lib/tests/testHelpers';
import TextFormatted, {
  type TextFormattedProps,
} from 'components/shared/elements/TextFormatted/TextFormatted';

describe('TextFormatted', () => {
  const setupComponent = (props?: Partial<TextFormattedProps>) =>
    render(<TextFormatted value='' {...props} />);

  it('Text formatted should return capitalized value', () => {
    setupComponent({ value: 'float' });
    expect(getByText('Float')).toBeTruthy();
  });

  it('Text formatted should return capitalized value without underscore', () => {
    setupComponent({ value: 'float_value' });
    expect(getByText('Float value')).toBeTruthy();
  });

  it('Text formatted should return capitalized value without prefix', () => {
    setupComponent({
      value: 'float_value',
      removePrefix: true,
    });
    expect(getByText('Value')).toBeTruthy();
  });
});
