import { useState } from 'react';

interface InlineEditorProps {
  editorType: string;
  defaultValue: unknown;
  onUpdate: (newValue: string | unknown) => void;
  className?: string;
}

const InlineEditor = ({
  editorType = 'text',
  defaultValue,
  onUpdate,
  className,
}: InlineEditorProps) => {
  const [value, setValue] = useState<unknown>(defaultValue);

  const props: {
    value?: string | number | readonly string[] | undefined;
    checked?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  } =
    editorType === 'checkbox'
      ? {
          checked: Boolean(value),
          onChange(e: React.ChangeEvent<HTMLInputElement>) {
            setValue(e.currentTarget.checked);
            onUpdate(value);
          },
        }
      : {
          value: value as string | number,
          onChange(e: React.ChangeEvent<HTMLInputElement>) {
            setValue(e.target.value);
          },
        };

  return (
    <input
      type={editorType}
      {...props}
      className={className}
      onBlur={() => {
        onUpdate(value);
      }}
    />
  );
};

export default InlineEditor;
