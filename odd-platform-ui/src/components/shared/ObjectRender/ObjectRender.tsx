import React, { useCallback, useEffect, useState } from 'react';
import * as S from './ObjectRenderStyles';

const PREVIEW_COUNT = 3;

const isInteractiveNode = (node: any) =>
  node != null && typeof node === 'object' && Object.keys(node).length > 0;

type ObjectRenderProps = {
  input: any;
  parentKey?: string;
  deep?: number;
  isOpen?: boolean;
  isPreview?: boolean;
  onToggle?: (e: React.SyntheticEvent<HTMLSpanElement>) => void;
};

const ObjectRender: React.FC<ObjectRenderProps> = ({
  input,
  parentKey,
  deep = 0,
  isOpen = deep === 0,
  isPreview = false,
  onToggle = () => {},
}) => {
  const [isChildNodeOpen, setChildNodeOpen] = useState<
    Record<string, boolean>
  >({});

  const onToggleChildNode = useCallback(
    (e: React.SyntheticEvent<HTMLSpanElement>) => {
      const target = e.target as HTMLSpanElement;
      const { key } = target.dataset;
      if (key) setChildNodeOpen(s => ({ ...s, [key]: !s[key] }));
    },
    []
  );

  const onOpenCurrentNode = useCallback(
    () => onToggle({ target: { dataset: { key: parentKey } } } as any),
    [onToggle, parentKey]
  );

  useEffect(() => {
    if (!isOpen) setChildNodeOpen({});
  }, [isOpen]);

  if (input == null)
    return (
      <S.ObjectRenderSpan color="texts.secondary">null</S.ObjectRenderSpan>
    );

  if (typeof input === 'object') {
    const isArray = input instanceof Array;
    const entries = Object.entries(input);

    const openBracket = (
      <S.ObjectRenderSpan color="texts.secondary">
        {isArray ? '[' : '{'}
      </S.ObjectRenderSpan>
    );

    const closeBracket = (
      <S.ObjectRenderSpan ml={isOpen ? deep : 0} color="texts.secondary">
        {isArray ? ']' : '}'}
      </S.ObjectRenderSpan>
    );

    const collapses = (
      <S.ObjectRenderSpan color="texts.hint">...</S.ObjectRenderSpan>
    );

    if (isOpen)
      return (
        <>
          {openBracket}
          <br />
          {entries.map(([key, value]) => (
            <React.Fragment key={key}>
              <S.ObjectRenderKey
                $deep={deep}
                variant="h4"
                role="button"
                data-key={key}
                {...(isInteractiveNode(value) && {
                  $interactive: true,
                  onClick: onToggleChildNode,
                  role: 'button',
                })}
              >
                {key}:
              </S.ObjectRenderKey>{' '}
              <ObjectRender
                input={value}
                deep={deep + 1}
                isOpen={isChildNodeOpen[key]}
                isPreview={isOpen}
                onToggle={onToggleChildNode}
                parentKey={key}
              />
              <br />
            </React.Fragment>
          ))}
          {closeBracket}
        </>
      );

    if (isPreview)
      return (
        <S.ObjectRenderInteractiveSpan
          {...(isInteractiveNode(input) && {
            $interactive: true,
            onClick: onOpenCurrentNode,
            role: 'button',
          })}
        >
          {openBracket}
          {entries.map(
            ([key, value], i) =>
              i < PREVIEW_COUNT && (
                <React.Fragment key={key}>
                  {!isArray && (
                    <S.ObjectRenderSpan color="texts.hint">
                      {key}:{' '}
                    </S.ObjectRenderSpan>
                  )}
                  <ObjectRender input={value} deep={deep + 1} />
                  {i < entries.length - 1 && (
                    <S.ObjectRenderSpan color="texts.secondary">
                      {', '}
                    </S.ObjectRenderSpan>
                  )}
                </React.Fragment>
              )
          )}
          {entries.length > PREVIEW_COUNT && collapses}
          {closeBracket}
        </S.ObjectRenderInteractiveSpan>
      );

    return (
      <>
        {openBracket}
        {collapses}
        {closeBracket}
      </>
    );
  }

  if (['number', 'boolean'].includes(typeof input))
    return (
      <S.ObjectRenderSpan color="runStatus.BROKEN">
        {input.toString()}
      </S.ObjectRenderSpan>
    );

  return (
    <S.ObjectRenderSpan color="runStatus.SUCCESS">
      &quot;{input}&quot;
    </S.ObjectRenderSpan>
  );
};

ObjectRender.displayName = 'ObjectRender';

export default ObjectRender;
