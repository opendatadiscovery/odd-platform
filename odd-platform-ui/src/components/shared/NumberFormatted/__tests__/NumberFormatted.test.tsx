import React from 'react';
import { render } from '@testing-library/react';
import { getByTestID } from 'lib/testHelpers';
import NumberFormatted, { NumberFormattedProps } from '../NumberFormatted';

describe('NumberFormatted', () => {
  const setupComponent = (props?: Partial<NumberFormattedProps>) =>
    render(<NumberFormatted value="" {...props} />);

  it('NumberFormatted should return formatted number from string', () => {
    setupComponent({ value: '1000000' });
    expect(getByTestID('number-formatted-component').textContent).toBe(
      '1M'
    );
  });

  it('NumberFormatted should return formatted number from number', () => {
    setupComponent({ value: 250_000_000 });
    expect(getByTestID('number-formatted-component').textContent).toBe(
      '250M'
    );
  });

  it('NumberFormatted should return empty string with wrong string value', () => {
    setupComponent({ value: 'a10aaa' });
    expect(getByTestID('number-formatted-component').textContent).toBe(
      '0'
    );
  });

  it('NumberFormatted should return empty string with undefined value', () => {
    setupComponent({ value: undefined });
    expect(getByTestID('number-formatted-component').textContent).toBe('');
  });
});
