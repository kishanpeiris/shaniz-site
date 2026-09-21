import React from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import { useBusinessInfo } from '../hooks/useBusinessInfo.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useConsent } from '../context/ConsentContext.jsx'

const LAST_UPDATED = '20 September 2026'

const H2 = ({ id, children }) => (
  <h2 id={id} className="mb-3 mt-10 scroll-mt-28 font-serif text-2xl text-forestDeep">
    {children}
  </h2>
)
const P = ({ children }) => <p className="mb-3 text-base leading-relaxed text-[#4a4739]">{children}</p>
const Li = ({ children }) => <li className="mb-1.5 text-base leading-relaxed text-[#4a4739]">{children}</li>

function Table({ head, rows }) {
  return (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-gold/40 text-xs uppercase tracking-wide text-moss">
            {head.map((h) => (
              <th key={h} className="py-2 pr-4 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-gold/20 align-top text-[#4a4739]">
              {r.map((c, j) => (
                <td key={j} className="py-2.5 pr-4">{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function PrivacyPolicyPage() {
  const info = useBusinessInfo()
  const { t } = useLanguage()
  const { openSettings } = useConsent()

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-7 sm:py-14">
        <h1 className="text-4xl text-forestDeep">{t('privacy_title')}</h1>
        <p className="mt-1 text-sm text-[#6a6656]">Last updated: {LAST_UPDATED}</p>
        <p className="mt-3 text-sm italic text-[#6a6656]">{t('privacy_english_note')}</p>

        <div className="mt-8 rounded-sm border border-gold/40 bg-ivory p-6">
          <h2 className="font-serif text-xl text-forestDeep">Our promise to you</h2>
          <ul className="mt-3 list-disc pl-5">
            <Li>We do <strong>not</strong> run third-party advertising on this website, and we do not use advertising or tracking cookies.</Li>
            <Li>We do <strong>not</strong> sell, rent or trade your personal information — to anyone, ever.</Li>
            <Li>We keep your information secure and protected, and we collect only what we need.</Li>
            <Li>Shani&rsquo;z earns only from the products and services we provide. Your data is not part of our business model.</Li>
          </ul>
        </div>

        <div className="mt-6 rounded-sm border border-gold/30 p-5">
          <h2 className="font-serif text-xl text-forestDeep">Privacy statement in short</h2>
          <P>
            We collect only the personal information we need to sell to you, deliver your order and run your bookings.
            We use it only for those purposes, keep it only as long as needed, protect it with appropriate security, and
            never sell it. You can see, correct or delete it, and change your cookie and email choices, whenever you like.
            The details are below.
          </P>
        </div>

        <H2 id="who">1. Who we are</H2>
        <P>
          This website is run by Shani&rsquo;z Herbal Hair &amp; Skin Care, a Sri Lankan business selling herbal hair and
          skin care products and booking beauty services. We are the &ldquo;controller&rdquo; of the personal information
          described here. We handle personal information in line with Sri Lanka&rsquo;s <strong>Personal Data Protection Act,
          No. 9 of 2022</strong>, the Electronic Transactions Act, No. 19 of 2006, and the other laws that apply to online
          shops. You can reach us at{' '}
          <a href={`mailto:${info.email}`} className="underline text-forestDeep">{info.email}</a>
          {info.phone && !info.phone.includes('XX') ? <> or {info.phone}</> : null}.
        </P>

        <H2 id="collect">2. What we collect, and why</H2>
        <Table
          head={['Information', 'Why we need it']}
          rows={[
            ['Name, email, mobile number and password (stored only as an irreversible scrambled “hash” — nobody, including us, can read it)', 'To create and run your account and let you sign in.'],
            ['Delivery / billing address, phone number, email, and what you ordered', 'To deliver your order, send confirmations and invoices, and keep the sales records the law requires.'],
            ['Name, email, phone (mobile or home) and the appointment you book', 'To run your booking, confirm it, and remind you the day before.'],
            ['Payment details', 'Card and wallet details are typed on our payment partners’ own secure pages. We never see or store your full card number. If you choose “save this card”, we keep only a token and the last 4 digits.'],
            ['Your IP address (on orders only)', 'To spot fraud such as repeated stolen-card attempts. It is erased automatically after 90 days.'],
            ['Messages you send us (contact form, email, WhatsApp)', 'To reply to you.'],
            ['Your basket and language choice', 'So your basket is still there when you return, and the site appears in your language.'],
          ]}
        />
        <P>
          Our lawful reasons are: to carry out the contract with you (orders, bookings, accounts); to meet legal
          obligations (tax and accounting records); our legitimate interest in preventing fraud and keeping the site
          secure; and your consent (for optional cookies and optional emails). You can withdraw consent at any time.
        </P>

        <H2 id="sharing">3. Who we share it with</H2>
        <P>
          We share information only with companies that help us run the shop, only what they need, and only for that
          purpose. They are not allowed to use it for their own advertising.
        </P>
        <ul className="mb-3 list-disc pl-5">
          <Li><strong>Payment partners</strong> (such as PayHere, Koko and IntPay) — to take your payment.</Li>
          <Li><strong>Email and SMS delivery services</strong> — to send your order and booking messages.</Li>
          <Li><strong>Delivery partners</strong> — your name, address and phone number, so they can deliver.</Li>
          <Li><strong>Address-suggestion service</strong> — when you type in the address box at checkout, the text you type is sent to a map-data provider (LocationIQ / OpenStreetMap) to offer suggestions.</Li>
          <Li><strong>Website hosting, database and image-storage providers</strong> — who store the site and its data securely for us.</Li>
          <Li><strong>Authorities</strong>, only where the law requires it.</Li>
        </ul>
        <P>We never sell or rent your information, and we do not share it with advertisers or data brokers.</P>

        <H2 id="cookies">4. Cookies and similar technologies</H2>
        <P>
          A cookie is a small file a website saves on your device. We use very few, and there are no advertising or
          tracking cookies on this site.
        </P>
        <Table
          head={['Name', 'What it does', 'Type', 'How long']}
          rows={[
            ['shaniz_session', 'Keeps you signed in', 'Essential', '2 hours'],
            ['shaniz_cart (device storage)', 'Remembers your basket', 'Essential', 'Until you check out or clear it'],
            ['shaniz_cookie_consent (device storage)', 'Remembers your cookie choices', 'Essential', '—'],
            ['shaniz_language (device storage)', 'Remembers your language', 'Preferences (needs your OK)', 'Until you clear it'],
            ['Google Maps', 'Shows the map on branch cards', 'Third-party (needs your OK)', 'Set by Google'],
            ['Facebook video player', 'Shows our video, when we have not uploaded our own', 'Third-party (needs your OK)', 'Set by Facebook'],
          ]}
        />
        <P>
          Maps and Facebook video stay switched off until you allow them, so those companies receive nothing from you
          before then. Our fonts are stored on our own site, not loaded from another company.
        </P>
        <button
          type="button"
          onClick={openSettings}
          className="mb-2 rounded-full bg-forestDeep px-5 py-2.5 text-xs uppercase tracking-wide text-cream"
        >
          {t('cookie_manage')}
        </button>

        <H2 id="emails">5. Emails we send</H2>
        <P>
          <strong>Always sent</strong> because you need them: order confirmations, shipping updates, invoices, booking
          confirmations and changes, password resets and email verification.
        </P>
        <P>
          <strong>Optional</strong>: basket reminders and booking reminders. Every one includes an unsubscribe link, and
          you can switch them on or off any time under <Link to="/account" className="underline text-forestDeep">My Account → Email notifications</Link>.
          We send no advertising newsletters.
        </P>

        <H2 id="keep">6. How long we keep information</H2>
        <ul className="mb-3 list-disc pl-5">
          <Li>Account details — until you delete your account.</Li>
          <Li>Order and booking records — for as long as Sri Lankan tax and accounting law requires. If you delete your account, these are kept but stripped of your name, contact details and addresses.</Li>
          <Li>IP addresses stored with orders — 90 days.</Li>
          <Li>Staff activity logs — 15 to 30 days.</Li>
          <Li>Saved basket — until you check out, empty it, or delete your account.</Li>
        </ul>

        <H2 id="security">7. How we protect your information</H2>
        <ul className="mb-3 list-disc pl-5">
          <Li>The whole site uses encrypted (HTTPS) connections.</Li>
          <Li>Passwords are stored only as one-way hashes. Card numbers are never stored by us.</Li>
          <Li>Access to customer records is limited to staff who need it, by role, and staff actions are logged.</Li>
          <Li>Sign-in attempts are rate-limited, sessions expire, and forms are checked to block common attacks.</Li>
          <Li>Databases are backed up, and software is kept up to date.</Li>
        </ul>
        <P>
          No system is perfectly secure. If a breach ever put your information at risk, we would tell you and the
          Data Protection Authority as the law requires, and explain what happened and what to do.
        </P>

        <H2 id="rights">8. Your rights</H2>
        <P>You have the right to:</P>
        <ul className="mb-3 list-disc pl-5">
          <Li>know what we hold about you and get a copy — use <Link to="/account" className="underline text-forestDeep">My Account → Download my data</Link>;</Li>
          <Li>correct anything that is wrong — edit your profile and addresses in your account;</Li>
          <Li>have your information erased — use <Link to="/account" className="underline text-forestDeep">My Account → Delete my account</Link> (some order records must be kept, as explained above);</Li>
          <Li>withdraw consent, or object to how we use your information — change cookie and email choices at any time, or contact us;</Li>
          <Li>be told how your information is used (this policy) and to object to uses you do not agree with;</Li>
          <Li>complain to the Data Protection Authority of Sri Lanka (or the data-protection authority where you live) if you think we have not treated your information properly. We would appreciate the chance to put things right first.</Li>
        </ul>
        <P>Guests who checked out without an account can write to us and we will help in the same way.</P>

        <H2 id="fraud">9. Fraud checks</H2>
        <P>
          To protect you and us from fraud, orders go through simple automatic checks (for example, many orders from
          one address in a short time). A flagged order is looked at by a person before any action is taken — no one is
          refused solely by an automatic decision.
        </P>

        <H2 id="transfers">10. Storing information outside Sri Lanka</H2>
        <P>
          Some of our service providers may keep information on servers in other countries. We choose reputable
          providers, share only what is needed, and rely on their security commitments and our agreements with them.
        </P>

        <H2 id="children">11. Children</H2>
        <P>
          Our shop is meant for adults. We do not knowingly collect information from anyone under 18 without a
          parent&rsquo;s or guardian&rsquo;s consent. If you think a child has given us information, please contact us
          and we will delete it.
        </P>

        <H2 id="changes">12. Changes to this policy</H2>
        <P>
          If we change how we handle information, we will update this page and the date above. If a change is
          significant, we will tell you clearly on the site.
        </P>

        <H2 id="contact">13. Contact us</H2>
        <P>
          Questions, requests or concerns about your privacy:{' '}
          <a href={`mailto:${info.email}`} className="underline text-forestDeep">{info.email}</a>.
        </P>
      </main>
      <Footer />
    </>
  )
}
