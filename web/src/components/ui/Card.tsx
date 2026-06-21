import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  /** Optional variant for styling background emphasis */
  variant?: 'default' | 'raised' | 'transparent';
}

/**
 * The standard Card component representing the "Layered Dark Mode" section structure.
 */
export const Card: React.FC<CardProps> = ({ children, className = '', variant = 'default', ...props }) => {
  const bgClass = 
    variant === 'raised' ? 'bg-[var(--color-surface-raised)]' :
    variant === 'transparent' ? 'bg-transparent' : 
    'bg-[var(--color-surface)]';

  return (
    <section 
      className={`${bgClass} border border-[var(--color-border)] rounded-lg p-5 sm:p-6 shadow-sm ${className}`} 
      {...props}
    >
      {children}
    </section>
  );
};

export interface CardHeaderProps {
  title: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Standardized header for a Card, providing the icon + title flex layout and bottom border.
 */
export const CardHeader: React.FC<CardHeaderProps> = ({ title, icon, className = '' }) => {
  return (
    <div className={`flex items-center gap-3 mb-4 border-b border-[var(--color-border)] pb-4 ${className}`}>
      {icon && <span className="text-xl flex-shrink-0">{icon}</span>}
      <h2 className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)]">{title}</h2>
    </div>
  );
};

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Container for the card's internal content with standard secondary text color styling.
 */
export const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => {
  return (
    <div className={`text-[var(--color-text-secondary)] ${className}`}>
      {children}
    </div>
  );
};
