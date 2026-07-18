import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { NewsletterForm } from './NewsletterForm';

describe('NewsletterForm', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders form, label, input, and submit button', () => {
    render(<NewsletterForm />);
    expect(screen.getByRole('form', { name: 'טופס הרשמה לעדכונים' })).toBeInTheDocument();
    expect(screen.getByLabelText('קבל עדכונים על כלים חדשים')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'הרשמה לעדכונים' })).toBeInTheDocument();
  });

  it('rejects an invalid email with aria-invalid and error copy', () => {
    render(<NewsletterForm />);
    const input = screen.getByLabelText('קבל עדכונים על כלים חדשים');
    const submit = screen.getByRole('button', { name: 'הרשמה לעדכונים' });

    fireEvent.change(input, { target: { value: 'not-an-email' } });
    fireEvent.click(submit);

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('status').textContent).toContain('כתובת אימייל לא תקינה');
  });

  it('reaches the honest draft-opener status and clears the input on a valid submit', () => {
    render(<NewsletterForm />);
    const input = screen.getByLabelText('קבל עדכונים על כלים חדשים');
    const submit = screen.getByRole('button', { name: 'הרשמה לעדכונים' });

    fireEvent.change(input, { target: { value: 'student@example.com' } });
    fireEvent.click(submit);

    const status = screen.getByRole('status');
    expect(status.textContent).toContain('פתחנו את תוכנת הדואר');
    expect((input as HTMLInputElement).value).toBe('');
  });

  it('survives a plausible-disabled environment without throwing', () => {
    const originalPlausible = (window as unknown as { plausible?: unknown }).plausible;
    delete (window as unknown as { plausible?: unknown }).plausible;

    try {
      render(<NewsletterForm />);
      const input = screen.getByLabelText('קבל עדכונים על כלים חדשים');
      const submit = screen.getByRole('button', { name: 'הרשמה לעדכונים' });

      expect(() => {
        fireEvent.change(input, { target: { value: 'analyst@uni.edu' } });
        fireEvent.click(submit);
      }).not.toThrow();

      expect(screen.getByRole('status').textContent).toContain('פתחנו את תוכנת הדואר');
    } finally {
      (window as unknown as { plausible?: unknown }).plausible = originalPlausible;
    }
  });
});
