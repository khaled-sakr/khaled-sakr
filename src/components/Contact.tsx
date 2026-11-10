import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';

// Set VITE_WEB3FORMS_KEY in .env.local (see .env.example). Without it the form
// falls back to opening the visitor's email app.
const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY?.trim() ?? '';
const CONTACT_EMAIL = 'khaledsakr12345@gmail.com';

const socials = [
  { icon: <FaGithub className="text-2xl" aria-hidden="true" />, label: 'GitHub', href: 'https://github.com/khaled-sakr' },
  { icon: <FaLinkedin className="text-2xl" aria-hidden="true" />, label: 'LinkedIn', href: 'https://linkedin.com/in/khaledskr' },
  { icon: <FaEnvelope className="text-2xl" aria-hidden="true" />, label: 'Email', href: `mailto:${CONTACT_EMAIL}` },
];

type Status = 'idle' | 'sending' | 'sent' | 'error' | 'mailto';

const inputClass =
  'w-full px-4 py-3 border border-slate/60 rounded-lg bg-black text-snow placeholder:text-slate/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-orchid focus-visible:border-orchid transition-shadow';

function buildMailto(name: string, email: string, message: string) {
  const subject = `Portfolio message from ${name || 'a visitor'}`;
  const body = `${message}\n\n— ${name}${email ? ` (${email})` : ''}`;
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function Contact() {
  const [status, setStatus] = useState<Status>('idle');
  const [mailtoHref, setMailtoHref] = useState(`mailto:${CONTACT_EMAIL}`);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get('name') ?? '');
    const email = String(formData.get('email') ?? '');
    const message = String(formData.get('message') ?? '');
    const href = buildMailto(name, email, message);
    setMailtoHref(href);

    if (!WEB3FORMS_KEY) {
      // No form backend configured: don't post, hand off to the email client instead.
      setStatus('mailto');
      window.location.href = href;
      return;
    }

    setStatus('sending');
    formData.append('access_key', WEB3FORMS_KEY);

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });
      const data = (await res.json().catch(() => null)) as { success?: boolean } | null;

      if (res.ok && data?.success !== false) {
        setStatus('sent');
        form.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="py-24 px-6 md:px-16 lg:px-24 bg-black">
      <div className="max-w-3xl mx-auto">
        {/* Social Icons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center gap-4 mb-10"
        >
          {socials.map((s) => {
            const isMail = s.href.startsWith('mailto:');
            return (
              <a
                key={s.label}
                href={s.href}
                target={isMail ? undefined : '_blank'}
                rel={isMail ? undefined : 'noopener noreferrer'}
                className="w-12 h-12 rounded-full bg-panel border border-slate/30 text-snow flex items-center justify-center hover:bg-rose hover:border-rose transition-colors"
                aria-label={s.label}
              >
                {s.icon}
              </a>
            );
          })}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="hero-heading text-5xl md:text-7xl font-black uppercase tracking-tight leading-none text-center mb-10"
        >
          Want to get in touch?
          <br />
          Drop me a line
        </motion.h2>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-panel border border-slate/20 rounded-2xl p-6 sm:p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium text-snow mb-2">Name</label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Enter your name"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium text-snow mb-2">Email Address</label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                className={inputClass}
                required
              />
            </div>
          </div>
          <div className="mb-6">
            <label htmlFor="contact-message" className="block text-sm font-medium text-snow mb-2">Message</label>
            <textarea
              id="contact-message"
              name="message"
              placeholder="Enter your message"
              rows={5}
              className={`${inputClass} resize-y`}
              required
            />
          </div>
          <button
            type="submit"
            disabled={status === 'sending'}
            className="contact-btn disabled:opacity-50"
          >
            {status === 'sending' ? 'Sending...' : 'Submit'}
          </button>

          <div role="status" aria-live="polite" className="mt-4 text-sm">
            {status === 'sent' && (
              <p className="text-snow font-medium border-l-2 border-orchid pl-3">Thanks! Your message was sent. I&apos;ll get back to you soon.</p>
            )}
            {status === 'error' && (
              <p className="text-snow font-medium border-l-2 border-rose pl-3">
                Sorry, the message couldn&apos;t be sent. Please try again or{' '}
                <a href={mailtoHref} className="underline underline-offset-2">email me directly at {CONTACT_EMAIL}</a>.
              </p>
            )}
            {status === 'mailto' && (
              <p className="text-slate">
                The contact form isn&apos;t connected yet, so your email app should open with your message. If it
                didn&apos;t, <a href={mailtoHref} className="font-medium underline underline-offset-2">send it by email</a> or
                write to <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium underline underline-offset-2">{CONTACT_EMAIL}</a>.
              </p>
            )}
          </div>
        </motion.form>
      </div>
    </section>
  );
}
