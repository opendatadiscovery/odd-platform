import React from 'react';
import { getEllipsisTextByWidth } from 'lib/helpers';

interface TruncatedSvgTextProps extends React.SVGProps<SVGTextElement | SVGTSpanElement> {
  tagName: 'tspan' | 'text';
  text: string | undefined;
  title?: string;
  width: number;
}

const TruncatedSvgText: React.FC<TruncatedSvgTextProps> = ({
  text,
  title,
  tagName,
  width,
  ...props
}) => {
  const Wrapper = tagName;

  const textRef = React.useRef<SVGTSpanElement>(null);

  React.useEffect(() => {
    getEllipsisTextByWidth(textRef.current, text, width);
  }, [textRef, text, width]);

  return (
    <>
      {title && <title>{title}</title>}
      <Wrapper ref={textRef} {...props}>
        {text}
      </Wrapper>
    </>
  );
};

export default TruncatedSvgText;
