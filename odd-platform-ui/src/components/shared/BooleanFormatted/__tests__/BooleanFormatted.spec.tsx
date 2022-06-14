import React from 'react';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import BooleanFormatted, {
  BooleanFormattedProps,
} from '../BooleanFormatted';

describe('BooleanFormatted', () => {
  const setupComponent = (props?: Partial<BooleanFormattedProps>) =>
    render(<BooleanFormatted value {...props} />);

  it('BooleanFormatted renders correctly with true value ', () => {
    setupComponent();
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('BooleanFormatted renders correctly with "true" value', () => {
    setupComponent({ value: 'true' });
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('BooleanFormatted renders correctly with false value', () => {
    setupComponent({ value: false });
    expect(screen.getByText('No')).toBeInTheDocument();
  });
});
