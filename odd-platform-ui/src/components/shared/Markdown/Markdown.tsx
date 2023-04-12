import React, { type FC, useCallback, useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import CopyButton from 'components/shared/CopyButton/CopyButton';
import * as S from './Markdown.styles';

interface MarkdownProps {
  value: string;
  editor?: boolean;
  disableCopy?: boolean;
}

const Markdown: FC<MarkdownProps> = ({ value, editor = false, disableCopy = true }) => {
  const [showCopyBtn, setShowCopyBtn] = useState(false);

  const wrapperElement = { 'data-color-mode': 'light' } as {
    'data-color-mode'?: 'light' | 'dark';
  };

  const handleOnMouseEnter = useCallback(() => {
    if (!disableCopy) {
      setShowCopyBtn(true);
    }
  }, [disableCopy]);

  const handleOnMouseLeave = useCallback(() => {
    if (!disableCopy) {
      setShowCopyBtn(false);
    }
  }, [disableCopy]);

  return editor ? (
    <MDEditor
      value={value}
      preview='edit'
      previewOptions={{ wrapperElement, disableCopy: true }}
    />
  ) : (
    <S.Container onMouseEnter={handleOnMouseEnter} onMouseLeave={handleOnMouseLeave}>
      <MDEditor.Markdown
        source={value}
        style={{ width: '100%' }}
        wrapperElement={wrapperElement}
        disableCopy
      />
      {!disableCopy && (
        <CopyButton
          text='Copy'
          stringToCopy={value}
          sx={{
            visibility: showCopyBtn ? 'auto' : 'hidden',
            position: 'absolute',
            right: '12px',
            top: '12px',
          }}
        />
      )}
    </S.Container>
  );
};

export default Markdown;
