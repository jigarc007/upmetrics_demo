import React from 'react';

const AuthButton = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = true,
}) => {
  const getButtonStyle = () => {
    const baseStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: '0.875rem 1.5rem',
      fontSize: '0.9375rem',
      fontWeight: 600,
      borderRadius: 'var(--radius)',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled || loading ? 0.6 : 1,
      transition: 'all 0.2s ease',
      width: fullWidth ? '100%' : 'auto',
      border: 'none',
      outline: 'none',
    };

    if (variant === 'primary') {
      return {
        ...baseStyle,
        background: 'var(--gradient-primary)',
        color: 'hsl(var(--primary-foreground))',
        boxShadow: 'var(--shadow-md), var(--shadow-glow)',
      };
    }

    if (variant === 'secondary') {
      return {
        ...baseStyle,
        backgroundColor: 'hsl(var(--secondary))',
        color: 'hsl(var(--secondary-foreground))',
        border: '2px solid hsl(var(--border))',
        boxShadow: 'var(--shadow-sm)',
      };
    }

    return {
      ...baseStyle,
      backgroundColor: 'transparent',
      color: 'hsl(var(--muted-foreground))',
    };
  };

  const handleMouseEnter = (e) => {
    if (disabled || loading) return;

    if (variant === 'primary') {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow =
        'var(--shadow-lg), var(--shadow-glow)';
    } else if (variant === 'secondary') {
      e.currentTarget.style.borderColor = 'hsl(var(--primary))';
    } else {
      e.currentTarget.style.color = 'hsl(var(--foreground))';
    }
  };

  const handleMouseLeave = (e) => {
    if (variant === 'primary') {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow =
        'var(--shadow-md), var(--shadow-glow)';
    } else if (variant === 'secondary') {
      e.currentTarget.style.borderColor = 'hsl(var(--border))';
    } else {
      e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={getButtonStyle()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {loading ? (
        <>
          <span
            style={{
              width: '1rem',
              height: '1rem',
              border: '2px solid currentColor',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default AuthButton;
