function AuthLayout({
  title,
  children,
}) {

  return (

    <div
      className="auth-container"
    >

      <div
        className="auth-card"
      >

        <h2>
          {title}
        </h2>

        {children}

      </div>

    </div>

  );

}

export default AuthLayout;