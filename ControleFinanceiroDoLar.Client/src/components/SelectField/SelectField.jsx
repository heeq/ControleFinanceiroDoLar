
import React from "react";
import styles from "./SelectField.module.css";

export default function SelectField({
    value,
    onChange,
    options = [],
    label,
    placeholder,
    disabled = false,
    size = "md", // "sm" | "md"
    className = "",
    selectClassName = "",
    id: idProp,
    showChecked = false,
    name,
}) {
    const autoId = React.useId();
    const id = idProp || autoId;

    const handleChange = (e) => {
        onChange && onChange(e.target.value, e);
    };

    const safeOptions = Array.isArray(options) ? options : [];
    const selectedOption = safeOptions.find((o) => String(o.value) === String(value));

    return (
        <div className={`${styles.wrapper} ${className}`}>
            {label ? (
                <label className={styles.label} htmlFor={id}>
                    {label}
                </label>
            ) : null}

            <div className={styles.control}>
                <select
                    id={id}
                    name={name}
                    className={`${styles.select} ${styles[size] || ""} ${selectClassName}`}
                    value={value}
                    onChange={handleChange}
                    disabled={disabled}
                    style={{
                        // deixa o texto do select com a cor do item selecionado (funciona sempre)
                        color: selectedOption?.color || undefined,
                    }}
                >
                    {placeholder ? (
                        <option value="" disabled style={{ color: "#9ca3af" }}>
                            {placeholder}
                        </option>
                    ) : null}

                    {options.map((opt) => (
                        <option
                            key={opt.value}
                            value={opt.value}
                            style={{
                                color: opt.color || undefined,
                                backgroundColor: opt.backgroundColor || undefined, // pode ser ignorado pelo browser
                            }}
                        >
                            {opt.label}
                        </option>
                    ))}
                </select>

                <span className={styles.chevron} aria-hidden="true" />

            </div>

                            {(showChecked ? 
                (<span className={styles.savedCheck} title="Atualizado" aria-hidden="false" >
                    ✓
                </span>) : null)}
        </div>
    );
}


/*
import React from "react";
import PropTypes from "prop-types";

/**
 * SelectField
 *
 * Controlled select component with support for:
 * - label
 * - helper text and error state
 * - single or multiple selection
 * - array of options or grouped options
 *
 * Options format:
 * - Simple: [{ value: '1', label: 'One' }, ...]
 * - Grouped: [{ label: 'Group', options: [{ value, label }, ...] }, ...]
 

function isGroupedOptions(options) {
  return Array.isArray(options) && options.length > 0 && options[0].options;
}

const SelectField = React.forwardRef(function SelectField(
  {
    id,
    name,
    label,
    options,
    value,
    onChange,
    placeholder,
    required,
    disabled,
    className,
    error,
    helperText,
    multiple,
    ...rest
  },
  ref
) {
  const describedBy = helperText ? `${id}-helper` : undefined;
  const handleChange = (e) => {
    if (multiple) {
      // For multiple selects, return an array of selected values
      const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
      onChange && onChange(selected, e);
    } else {
      onChange && onChange(e.target.value, e);
    }
  };

  const renderOption = (opt) => {
    if (typeof opt === "string" || typeof opt === "number") {
      const stringVal = String(opt);
      return (
        <option key={stringVal} value={stringVal}>
          {stringVal}
        </option>
      );
    }

    return (
      <option key={opt.value} value={opt.value} disabled={opt.disabled}>
        {opt.label}
      </option>
    );
  };

  return (
    <div className={["select-field", className, error ? "select-field--error" : null]
      .filter(Boolean)
      .join(" ")}>
      {label && (
        <label htmlFor={id} className="select-field__label">
          {label}
          {required ? " *" : ""}
        </label>
      )}

      <select
        id={id}
        name={name}
        ref={ref}
        value={value === undefined ? (multiple ? [] : "") : value}
        onChange={handleChange}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        required={required}
        disabled={disabled}
        multiple={multiple}
        className="select-field__select"
        {...rest}
      >
        {placeholder && !multiple && (
          <option value="" disabled={required}>
            {placeholder}
          </option>
        )}

        {isGroupedOptions(options)
          ? options.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {Array.isArray(group.options) &&
                  group.options.map((opt) => renderOption(opt))}
              </optgroup>
            ))
          : Array.isArray(options) &&
            options.map((opt) => renderOption(opt))}
      </select>

      {(helperText || error) && (
        <div
          id={describedBy}
          className={["select-field__helper", error ? "select-field__helper--error" : null]
            .filter(Boolean)
            .join(" ")}
        >
          {error || helperText}
        </div>
      )}
    </div>
  );
});

SelectField.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  label: PropTypes.node,
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      // simple option
      PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        label: PropTypes.node.isRequired,
        disabled: PropTypes.bool,
      }),
      // grouped options
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        options: PropTypes.array,
      }),
      // shorthand string/number option
      PropTypes.string,
    ])
  ),
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  ]),
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  helperText: PropTypes.node,
  multiple: PropTypes.bool,
};

SelectField.defaultProps = {
  name: undefined,
  label: undefined,
  options: [],
  value: undefined,
  onChange: undefined,
  placeholder: undefined,
  required: false,
  disabled: false,
  className: undefined,
  error: undefined,
  helperText: undefined,
  multiple: false,
};

export default SelectField;

*/