function Input({
  type = "text",
  name,
  value,
  placeholder,
  onChange,
}) {

  return (

    <input

      type={type}

      name={name}

      value={value}

      placeholder={placeholder}

      onChange={onChange}

      className="input"

    />

  );

}

export default Input;