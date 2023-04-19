import React from 'react';
import {
  JSONEditor,
  type JSONEditorPropsOptional,
  type JSONValue,
  Mode,
  parsePath,
  type TextContent,
  type ValidationError,
  ValidationSeverity,
} from 'vanilla-jsoneditor';
import Ajv2019 from 'ajv/dist/2019';
import 'components/shared/elements/AppJSONEditor/AppJSONEditorStyles.css';

interface DefaultSchemaObject {
  id?: string;
  $id?: string;
  $schema?: string;
  [x: string]: unknown;
}

export interface SchemaObject {
  id?: string;
  $id?: string;
  $schema?: string;
  $async?: false;
  [x: string]: unknown;
}

export interface AsyncSchema extends DefaultSchemaObject {
  $async: true;
}

export type AnySchemaObject = SchemaObject | AsyncSchema;

interface ErrorObject<
  K extends string = string,
  P = Record<string, unknown>,
  S = unknown
> {
  keyword: K;
  instancePath: string;
  schemaPath: string;
  params: P;
  propertyName?: string;
  message?: string;
  schema?: S;
  parentSchema?: AnySchemaObject;
  data?: unknown;
}

interface JSONEditorProps extends JSONEditorPropsOptional {
  onValidate: (isValid: boolean, result: string) => void;
  schema: Record<string, unknown>;
}

const AppJSONEditor: React.FC<JSONEditorProps> = ({ onValidate, schema, ...props }) => {
  const refContainer = React.useRef<HTMLDivElement>(null);
  const refEditor = React.useRef<JSONEditor | null>(null);
  const ajv = new Ajv2019({ allErrors: true });
  const validate = ajv.compile(schema);

  const improveAjvError = (ajvError: ErrorObject) => {
    if (ajvError.keyword === 'enum' && Array.isArray(ajvError.schema)) {
      let enums = ajvError.schema;
      if (enums) {
        enums = enums.map(value => JSON.stringify(value));

        if (enums.length > 5) {
          const more = [`(${enums.length - 5} more...)`];
          enums = enums.slice(0, 5);
          enums.push(more);
        }
        ajvError.message = `Should be equal to one of: ${enums.join(', ')}`;
      }
    }

    if (ajvError.keyword === 'additionalProperties') {
      ajvError.message = `Should NOT have additional property: ${ajvError.params.additionalProperty}`;
    }

    return ajvError;
  };

  const normalizeAjvError = (
    json: JSONValue,
    ajvError: ErrorObject
  ): ValidationError => ({
    path: parsePath(json, ajvError.instancePath),
    message: ajvError.message || 'error',
    severity: ValidationSeverity.warning,
  });

  const validator = (json: JSONValue): ValidationError[] => {
    validate(json);
    const ajvErrors = validate.errors || [];

    return ajvErrors.map(improveAjvError).map(error => normalizeAjvError(json, error));
  };

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
          navigationBar: false,
          onChange: (content, previousContent, OnChangeStatus) => {
            if (props.onChange) {
              props.onChange(content, previousContent, OnChangeStatus);
            }
            if ((content as TextContent).text.length === 0) {
              return onValidate(false, '');
            }

            return onValidate(valid(), (content as TextContent).text);
          },
        },
      });
    }

    refEditor.current?.updateProps(props);

    return () => {
      if (refEditor.current) {
        refEditor.current.destroy();
        refEditor.current = null;
      }
    };
  }, [refEditor, refContainer]);

  return <div className='svelte-jsoneditor-react' ref={refContainer} />;
};

export default AppJSONEditor;
