import React, { useCallback, useState } from 'react';
import { Typography } from '@mui/material';
import * as S from './ObjectRenderStyles';

const PREVIEW_COUNT = 3;

type ObjectRenderProps = {
  input: any;
  deep?: number;
  isOpen?: boolean;
  preview?: boolean;
};

const ObjectRender: React.FC<ObjectRenderProps> = ({
  input,
  deep = 0,
  isOpen = deep === 0,
  preview = false,
}) => {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const onToggle = useCallback(e => {
    const key = e.target?.dataset.key;
    setOpen(s => ({ ...s, [key]: !s[key] }));
  }, []);

  if (input == null)
    return (
      <Typography component="span" color="texts.secondary">
        null
      </Typography>
    );

  if (typeof input === 'object') {
    const isArray = input instanceof Array;
    const entries = Object.entries(input);

    return (
      <>
        <Typography component="span" color="texts.secondary">
          {isArray ? '[' : '{'}
        </Typography>
        {isOpen ? (
          <>
            <br />
            {entries.map(([key, value]) => (
              <React.Fragment key={key}>
                <S.ObjectRenderKey
                  $deep={deep}
                  $interactive={value != null && typeof value === 'object'}
                  variant="h4"
                  onClick={onToggle}
                  component="span"
                  role="button"
                  data-key={key}
                >
                  {key}:
                </S.ObjectRenderKey>{' '}
                <ObjectRender
                  input={value}
                  deep={deep + 1}
                  isOpen={open[key]}
                  preview
                />
                <br />
              </React.Fragment>
            ))}
          </>
        ) : (
          preview &&
          entries.map(
            ([key, value], i) =>
              i < PREVIEW_COUNT && (
                <React.Fragment key={key}>
                  {!isArray && (
                    <Typography component="span" color="texts.secondary">
                      {key}:{' '}
                    </Typography>
                  )}
                  <ObjectRender input={value} deep={deep + 1} />
                  {i < entries.length - 1 && (
                    <Typography component="span" color="texts.secondary">
                      {', '}
                    </Typography>
                  )}
                </React.Fragment>
              )
          )
        )}

        {!isOpen &&
          ((preview && entries.length > PREVIEW_COUNT) || !preview) && (
            <Typography component="span" color="texts.secondary">
              ...
            </Typography>
          )}

        <Typography
          component="span"
          ml={isOpen ? deep : 0}
          color="texts.secondary"
        >
          {isArray ? ']' : '}'}
        </Typography>
      </>
    );
  }

  if (['number', 'boolean'].includes(typeof input))
    return (
      <Typography component="span" color="runStatus.BROKEN">
        {input.toString()}
      </Typography>
    );

  return (
    <Typography component="span" color="runStatus.SUCCESS">
      &quot;{input}&quot;
    </Typography>
  );
};

ObjectRender.displayName = 'ObjectRender';

export default ObjectRender;
