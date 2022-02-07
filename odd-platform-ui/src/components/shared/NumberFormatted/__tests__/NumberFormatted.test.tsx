import React from 'react';
import { render } from '@testing-library/react';
import { getByTestID } from 'lib/testHelpers';
import NumberFormatted, { NumberFormattedProps } from '../NumberFormatted';

describe('NumberFormatted', () => {
  const setupComponent = (props?: Partial<NumberFormattedProps>) =>
    render(<NumberFormatted value="" {...props} />);

  it('NumberFormatted should return formatted number', () => {
    const formattedNumber = setupComponent({ value: '1000000' });
    expect(getByTestID('number-formatted-component').textContent).toBe(
      '1000K'
    );
  });

  it('NumberFormatted should return empty string with wrong value', () => {
    const formattedNumber = setupComponent({ value: '10aaa' });
    expect(getByTestID('number-formatted-component').textContent).toBe('');
  });

  it('NumberFormatted should return empty string with undefined value', () => {
    const formattedNumber = setupComponent({ value: undefined });
    expect(getByTestID('number-formatted-component').textContent).toBe('');
  });
});
