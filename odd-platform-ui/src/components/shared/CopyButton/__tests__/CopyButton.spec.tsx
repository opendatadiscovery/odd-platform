import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import CopyButton, { CopyButtonProps } from '../CopyButton';

describe('CopyButton', () => {
  const setupComponent = (props?: Partial<CopyButtonProps>) =>
    render(
      <CopyButton stringToCopy="CopyButtonStringToCopy" {...props} />
    );

  it('CopyButton renders AppButton correctly ', () => {
    setupComponent({ text: 'CopyButtonText' });
    const copyButton = screen.getByLabelText('AppButton');
    expect(copyButton).toBeInTheDocument();
  });

  it('CopyButton renders AppIconButton correctly ', () => {
    setupComponent();
    const copyButton = screen.getByLabelText('AppIconButton');
    expect(copyButton).toBeInTheDocument();
  });

  it('CopyButton renders icons and error text correctly ', () => {
    setupComponent({ text: 'CopyButtonText' });
    const copyIcon = screen.getByLabelText('CopyIcon');
    const copyButton = screen.getByLabelText('AppButton');
    expect(copyIcon).toBeInTheDocument();
    expect(copyButton.textContent).toBe('CopyButtonText');
    fireEvent.click(copyButton);
    const alertIcon = screen.getByLabelText('AlertIcon');
    expect(alertIcon).toBeInTheDocument();
    expect(copyButton.textContent).toBe('Copy error');
  });
});
