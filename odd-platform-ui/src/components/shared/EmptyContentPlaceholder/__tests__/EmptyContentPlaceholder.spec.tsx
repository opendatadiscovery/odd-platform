import React from 'react';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import EmptyContentPlaceholder, {
  EmptyContentPlaceholderProps,
} from '../EmptyContentPlaceholder';

describe('EmptyContentPlaceholder', () => {
  const setupComponent = (props?: Partial<EmptyContentPlaceholderProps>) =>
    render(<EmptyContentPlaceholder {...props} />);

  it('EmptyContentPlaceholder renders text content correctly ', () => {
    setupComponent({ text: 'EmptyContentPlaceholderText' });
    const emptyContentPlaceholder = screen.getByLabelText(
      'EmptyContentPlaceholder'
    );
    expect(emptyContentPlaceholder.textContent).toBe(
      'EmptyContentPlaceholderText'
    );
  });
  it('EmptyContentPlaceholder renders empty text content correctly ', () => {
    setupComponent();
    const emptyContentPlaceholder = screen.getByLabelText(
      'EmptyContentPlaceholder'
    );
    expect(emptyContentPlaceholder.textContent).toBe('No content');
  });
});
