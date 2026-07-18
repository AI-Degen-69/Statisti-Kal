import { useState, type FormEvent, type ReactElement } from 'react';
import { Mail, Send } from 'lucide-react';

type SubmitStatus = 'idle' | 'sending' | 'sent' | 'error';

interface NewsletterFormProps {
  className?: string;
  recipientEmail?: string;
  buttonLabel?: string;
  heading?: string;
  privacyNote?: string;
}

/**
 * Newsletter signup — opt-in, license-safe (BUSL-1.1).
 * Opens the user's mail client with a pre-filled draft. NOTHING is sent
 * automatically — the user must press "Send" in their mail client for the
 * signup request to arrive. The success copy is honest about that.
 *
 * Privacy: explicit single-line promise + Plausible cookieless tracking only.
 * Plausible custom event `newsletter_signup` is fired before opening mail
 * client so we can later export signups independently of the email.
 *
 * Future backend: replace `triggerMailto` with a fetch to a free endpoint
 * like Formspree, Web3Forms, Buttondown, or a custom Resend worker.
 */
export function NewsletterForm({
  className = '',
  recipientEmail = 'hello@statisti-kal.com',
  buttonLabel = 'הרשמה לעדכונים',
  heading = 'קבל עדכונים על כלים חדשים',
  privacyNote = 'ללא דואר זבל. ניתן להסיר בכל רגע. לא נמסור את האימייל שלך לאף גורם נוסף.',
}: NewsletterFormProps): ReactElement {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');

  // Anchor-click delivery is more reliable than `window.location.href =
  // mailto:...` in onSubmit handlers (some embedded WebViews and Safari iOS
  // variants ignore programmatic mailto navigation triggered from JS).
  // Wrap in try/catch so a popup-blocker or missing-handler exception never
  // crashes the entire submit handler.
  const triggerMailto = (mailtoHref: string): void => {
    try {
      const anchor = document.createElement('a');
      anchor.href = mailtoHref;
      anchor.rel = 'noopener noreferrer';
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } catch {
      // Swallow: the status copy still communicates the "open the mail app"
      // affordance, and the Plausible event has already been emitted.
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const trimmed = email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus('error');
      return;
    }

    setStatus('sending');

    // Plausible cookieless custom event. Free Plausible tier supports named
    // events but not `props` (that requires PRO / Business), so we only pass
    // the event name. Method-specific variants can be split into separate
    // event names later (e.g. newsletter_signup_mailto, newsletter_signup_api).
    try {
      const plausible = (window as unknown as { plausible?: (event: string) => void }).plausible;
      if (typeof plausible === 'function') {
        plausible('newsletter_signup');
      }
    } catch {
      // Analytics failures must never block the user flow.
    }

    const subject = encodeURIComponent('Statisti-Kal — newsletter signup');
    const body = encodeURIComponent(
      `היי,\n\nאשמח להירשם לעדכונים של Statisti-Kal.\n\nהאימייל שלי: ${trimmed}\n\nתודה!`,
    );
    triggerMailto(`mailto:${recipientEmail}?subject=${subject}&body=${body}`);

    setStatus('sent');
    setEmail('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={`flex flex-col gap-2 ${className}`}
      aria-label="טופס הרשמה לעדכונים"
      dir="rtl"
    >
      <label
        htmlFor="newsletter-email"
        className="flex items-center gap-1.5 text-body-sm font-bold text-[var(--color-text-primary)]"
      >
        <Mail className="h-3.5 w-3.5 text-[var(--color-accent-primary)]" strokeWidth={2} aria-hidden="true" />
        <span>{heading}</span>
      </label>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status === 'error' || status === 'sent') setStatus('idle');
          }}
          placeholder="האימייל שלך"
          aria-invalid={status === 'error'}
          aria-describedby="newsletter-status"
          disabled={status === 'sending'}
          className="min-w-0 flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-body-base text-[var(--color-text-primary)] outline-none transition placeholder:text-[var(--color-text-tertiary)] focus-visible:border-[var(--color-accent-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]/40"
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)] px-4 py-2 text-body-base font-bold text-[var(--color-text-primary)] outline-none transition hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]/50 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:hover:scale-100"
        >
          <Send className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          <span>{status === 'sending' ? 'שולח...' : buttonLabel}</span>
        </button>
      </div>

      <p
        id="newsletter-status"
        role="status"
        aria-live="polite"
        className={`text-xs ${status === 'error' ? 'text-[var(--color-error)]' : status === 'sent' ? 'text-[var(--color-success)]' : 'text-[var(--color-text-tertiary)]'}`}
      >
        {status === 'error' && 'כתובת אימייל לא תקינה.'}
        {status === 'sent' &&
          'פתחנו את תוכנת הדואר שלך עם בקשה טיוטה — לחיצה על "שלח" תשלים את ההרשמה.'}
        {status === 'idle' && privacyNote}
        {status === 'sending' && 'פותח את תוכנת הדואר שלך...'}
      </p>
    </form>
  );
}

export default NewsletterForm;
