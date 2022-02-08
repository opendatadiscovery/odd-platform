import React from 'react';
import { render } from '@testing-library/react';
import { getByTestID } from 'lib/testHelpers';
import NumberFormatted, { NumberFormattedProps } from '../NumberFormatted';

describe('NumberFormatted', () => {
  const setupComponent = (props?: Partial<NumberFormattedProps>) =>
    render(<NumberFormatted value="" {...props} />);

  it('NumberFormatted should return formatted number from string', () => {
    const formattedNumber = setupComponent({ value: '1000000' });
    expect(getByTestID('number-formatted-component').textContent).toBe(
      '1000K'
    );
  });

  it('NumberFormatted should return formatted number from number', () => {
    const formattedNumber = setupComponent({ value: 250_000_000 });
    expect(getByTestID('number-formatted-component').textContent).toBe(
      '250M'
    );
  });

  it('NumberFormatted should return empty string with wrong string value', () => {
    const formattedNumber = setupComponent({ value: 'a10aaa' });
    expect(getByTestID('number-formatted-component').textContent).toBe('');
  });

  it('NumberFormatted should return empty string with undefined value', () => {
    const formattedNumber = setupComponent({ value: undefined });
    expect(getByTestID('number-formatted-component').textContent).toBe('');
  });
});
