import React from 'react';
import { getByTestID, render } from 'lib/testHelpers';
import NumberFormatted, {
  type NumberFormattedProps,
} from 'components/shared/elements/NumberFormatted/NumberFormatted';

describe('NumberFormatted', () => {
  const setupComponent = (props?: Partial<NumberFormattedProps>) =>
    render(<NumberFormatted value='' {...props} />);

  it('NumberFormatted should return formatted number from string', () => {
    setupComponent({ value: '1000000' });
    expect(getByTestID('number-formatted-component').textContent).toBe('1M');
  });

  it('NumberFormatted should return formatted number from number', () => {
    setupComponent({ value: 250_000_000 });
    expect(getByTestID('number-formatted-component').textContent).toBe('250M');
  });

  it('NumberFormatted should return empty string with wrong string value', () => {
    setupComponent({ value: 'a10aaa' });
    expect(getByTestID('number-formatted-component').textContent).toBe('');
  });

  it('NumberFormatted should return empty string with undefined value', () => {
    setupComponent({ value: null });
    expect(getByTestID('number-formatted-component').textContent).toBe('');
  });

  it('NumberFormatted should return 0 with 0 value', () => {
    setupComponent({ value: 0 });
    expect(getByTestID('number-formatted-component').textContent).toBe('0');
  });
});
