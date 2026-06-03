function Button({
  text,
  type = "button",
  onClick,
  disabled = false,
  variant = "primary",
  block = false,
  children,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}${block ? " btn-block" : ""}`}
    >
      {children || text}
    </button>
  );
}

export default Button;
