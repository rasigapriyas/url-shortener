function Input({
  type = "text",
  name,
  value,
  placeholder,
  onChange,
  min,
  rows,
}) {

  if (type === "textarea") {
    return (
      <textarea
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        rows={rows || 5}
        className="input"
      />
    );
  }

  return (

    <input

      type={type}

      name={name}

      value={value}

      placeholder={placeholder}

      onChange={onChange}
      min={min}

      className="input"

    />

  );

}

export default Input;
