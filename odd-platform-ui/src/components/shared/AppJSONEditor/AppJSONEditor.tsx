import React, { FC } from 'react';
import {
  createAjvValidator,
  JSONEditor,
  type JSONEditorPropsOptional,
  JSONValue,
  Mode,
  TextContent,
} from 'vanilla-jsoneditor';
import { JSONValue as AppJSONValue } from 'lib/interfaces';

interface JSONEditorProps extends JSONEditorPropsOptional {
  onValidate: (isValid: boolean, result: string) => void;
  schema: AppJSONValue;
}

const AppJSONEditor: FC<JSONEditorProps> = ({
  onValidate,
  schema,
  onChange,
  ...props
}) => {
  const refContainer = React.useRef<HTMLDivElement>(null);
  const refEditor = React.useRef<JSONEditor | null>(null);
  const validator = createAjvValidator(schema as JSONValue, {}, { allErrors: true });

  const valid = () => {
    const errors = refEditor.current?.validate();
    if (errors && 'validationErrors' in errors) {
      return !errors.validationErrors.length;
    }

    return false;
  };

  React.useEffect(() => {
    if (refContainer.current) {
      refEditor.current = new JSONEditor({
        target: refContainer.current,
        props: {
          validator,
          mode: Mode.text,
          onChange: (content, previousContent, OnChangeStatus) => {
            if (onChange) {
              onChange(content, previousContent, OnChangeStatus);
            }
            if ((content as TextContent).text.length === 0) {
              return onValidate(false, '');
            }

            return onValidate(valid(), (content as TextContent).text);
          },
        },
      });
    }

    return () => {
      if (refEditor.current) {
        refEditor.current.destroy();
        refEditor.current = null;
      }
    };
  }, [refEditor.current, refContainer.current]);

  React.useEffect(() => {
    if (refEditor.current) {
      refEditor.current.updateProps(props);
    }
  }, [props]);

  return <div className='svelte-jsoneditor-react' ref={refContainer} />;
};

export default AppJSONEditor;
