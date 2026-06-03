function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-logo">S</span>
          ShortLink
        </div>
        <div className="stack">
          <h2>{title}</h2>
          {subtitle && <p className="auth-sub">{subtitle}</p>}
        </div>
        {children}
        {footer && <div className="auth-footer">{footer}</div>}
      </div>
    </div>
  );
}

export default AuthLayout;
