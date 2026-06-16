import React from 'react';

export interface PageLayoutProps {
  /** The content of the header (title, logo, tabs, etc.) */
  header?: React.ReactNode;
  /** The main content sections */
  children: React.ReactNode;
  /** Add a specific dir attribute to the layout. Often 'rtl' for Hebrew. */
  dir?: 'ltr' | 'rtl';
}

/**
 * A standardized layout container that implements the Layered Dark Mode 
 * aesthetics and global grid alignment across all calculator pages.
 */
export const PageLayout: React.FC<PageLayoutProps> = ({ header, children, dir = 'rtl' }) => {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] font-sans p-3 sm:p-6 flex flex-col items-center">
      {header && (
        <header className="w-full max-w-[1800px] mx-auto mb-6 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[var(--color-border)] pb-5">
          {header}
        </header>
      )}

      <main className="w-full max-w-[1800px] mx-auto flex flex-col gap-6" dir={dir}>
        {children}
      </main>
    </div>
  );
};
