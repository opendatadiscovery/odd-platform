import React from 'react';
import { render } from '@testing-library/react';
import TextFormatted, { TextFormattedProps } from '../TextFormatted';

describe('TextFormatted', () => {
  const setupComponent = (props?: Partial<TextFormattedProps>) =>
    render(<TextFormatted value="" {...props} />);

  it('Text formatted should return capitalized value', () => {
    const { getByText } = setupComponent({ value: 'float' });
    expect(getByText('Float')).toBeTruthy();
  });

  it('Text formatted should return capitalized value without underscore', () => {
    const { getByText } = setupComponent({ value: 'float_value' });
    expect(getByText('Float value')).toBeTruthy();
  });

  it('Text formatted should return capitalized value without prefix', () => {
    const { getByText } = setupComponent({
      value: 'float_value',
      removePrefix: true,
    });
    expect(getByText('Value')).toBeTruthy();
  });
});
