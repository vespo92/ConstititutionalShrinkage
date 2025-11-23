import React, { useId } from 'react';
import { VisuallyHidden } from './VisuallyHidden';

export interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'textarea';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  placeholder?: string;
  className?: string;
}

/**
 * Accessible form field with proper label association and error handling
 */
export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  hint,
  required = false,
  disabled = false,
  autoComplete,
  placeholder,
  className = '',
}: FormFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const describedBy = [hint ? hintId : null, error ? errorId : null]
    .filter(Boolean)
    .join(' ') || undefined;

  const inputProps = {
    id,
    name,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
    'aria-describedby': describedBy,
    'aria-invalid': error ? true : undefined,
    'aria-required': required,
    disabled,
    autoComplete,
    placeholder,
    className: `form-field-input ${error ? 'form-field-input--error' : ''}`.trim(),
  };

  return (
    <div className={`form-field ${className}`.trim()}>
      <label htmlFor={id} className="form-field-label">
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="form-field-required">
              {' '}*
            </span>
            <VisuallyHidden> (required)</VisuallyHidden>
          </>
        )}
      </label>
      {hint && (
        <p id={hintId} className="form-field-hint">
          {hint}
        </p>
      )}
      {type === 'textarea' ? (
        <textarea {...inputProps} rows={4} />
      ) : (
        <input type={type} {...inputProps} />
      )}
      {error && (
        <p id={errorId} className="form-field-error" role="alert">
          <span aria-hidden="true">⚠ </span>
          {error}
        </p>
      )}
    </div>
  );
}

export interface FormGroupProps {
  legend: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}

/**
 * Accessible form group (fieldset) with legend
 */
export function FormGroup({
  legend,
  children,
  error,
  hint,
  required = false,
  className = '',
}: FormGroupProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  return (
    <fieldset
      className={`form-group ${className}`.trim()}
      aria-describedby={[hint ? hintId : null, error ? errorId : null]
        .filter(Boolean)
        .join(' ') || undefined}
    >
      <legend className="form-group-legend">
        {legend}
        {required && (
          <>
            <span aria-hidden="true" className="form-field-required">
              {' '}*
            </span>
            <VisuallyHidden> (required)</VisuallyHidden>
          </>
        )}
      </legend>
      {hint && (
        <p id={hintId} className="form-group-hint">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={errorId} className="form-group-error" role="alert">
          <span aria-hidden="true">⚠ </span>
          {error}
        </p>
      )}
    </fieldset>
  );
}

export interface RadioOptionProps {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: (value: string) => void;
  disabled?: boolean;
  description?: string;
}

/**
 * Accessible radio option with proper labeling
 */
export function RadioOption({
  name,
  value,
  label,
  checked,
  onChange,
  disabled = false,
  description,
}: RadioOptionProps) {
  const id = useId();
  const descriptionId = `${id}-description`;

  return (
    <div className="radio-option">
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        disabled={disabled}
        aria-describedby={description ? descriptionId : undefined}
      />
      <label htmlFor={id}>{label}</label>
      {description && (
        <p id={descriptionId} className="radio-option-description">
          {description}
        </p>
      )}
    </div>
  );
}

export default FormField;
