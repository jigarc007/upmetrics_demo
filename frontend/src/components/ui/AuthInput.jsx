import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const AuthInput = ({
  type,
  placeholder,
  value,
  onChange,
  icon,
  error,
  label,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    width: '100%',
  };

  const labelStyle = {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'hsl(var(--foreground))',
  };

  const inputWrapperStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.875rem 1rem',
    paddingLeft: icon ? '2.75rem' : '1rem',
    paddingRight: isPassword ? '2.75rem' : '1rem',
    fontSize: '0.9375rem',
    backgroundColor: 'hsl(var(--card))',
    border: error
      ? '2px solid hsl(var(--destructive))'
      : '2px solid hsl(var(--border))',
    borderRadius: 'var(--radius)',
    color: 'hsl(var(--foreground))',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxShadow: 'var(--shadow-sm)',
  };

  const iconStyle = {
    position: 'absolute',
    left: '1rem',
    color: 'hsl(var(--muted-foreground))',
    pointerEvents: 'none',
  };

  const passwordToggleStyle = {
    position: 'absolute',
    right: '1rem',
    color: 'hsl(var(--muted-foreground))',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const errorStyle = {
    fontSize: '0.8125rem',
    color: 'hsl(var(--destructive))',
  };

  return (
    <div style={containerStyle}>
      {label && <label style={labelStyle}>{label}</label>}

      <div style={inputWrapperStyle}>
        {icon && <span style={iconStyle}>{icon}</span>}

        <input
          type={isPassword && showPassword ? 'text' : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={inputStyle}
          onFocus={(e) => {
            e.target.style.borderColor = 'hsl(var(--primary))';
            e.target.style.boxShadow = 'var(--shadow-glow)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error
              ? 'hsl(var(--destructive))'
              : 'hsl(var(--border))';
            e.target.style.boxShadow = 'var(--shadow-sm)';
          }}
        />

        {isPassword && (
          <button
            type="button"
            style={passwordToggleStyle}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && <span style={errorStyle}>{error}</span>}
    </div>
  );
};

export default AuthInput;
