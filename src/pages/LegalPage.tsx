import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function LegalPage() {
  const { t } = useTranslation()

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
      <Link to="/" style={{ color: 'var(--red-primary)', textDecoration: 'none', fontSize: 14 }}>
        ← {t('legal.back')}
      </Link>

      <h1 style={{ marginTop: 16 }}>{t('legal.title')}</h1>

      <section style={{ marginTop: 24 }}>
        <h2>{t('legal.identity_title')}</h2>
        <p>{t('legal.identity_body')}</p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>{t('legal.terms_title')}</h2>
        <p>{t('legal.terms_body')}</p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>{t('legal.disclaimer_title')}</h2>
        <p>{t('legal.disclaimer_body1')}</p>
        <p style={{ marginTop: 12 }}>{t('legal.disclaimer_body2')}</p>
        <p style={{ marginTop: 12 }}><strong>{t('legal.disclaimer_body3')}</strong></p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>{t('legal.usage_title')}</h2>
        <p>{t('legal.usage_body')}</p>
        <ul>
          <li>{t('legal.usage_no_doxxing')}</li>
          <li>{t('legal.usage_no_hate')}</li>
          <li>{t('legal.usage_no_false')}</li>
          <li>{t('legal.usage_no_illegal')}</li>
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>{t('legal.ip_title')}</h2>
        <p>{t('legal.ip_body')}</p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>{t('legal.changes_title')}</h2>
        <p>{t('legal.changes_body')}</p>
      </section>
    </div>
  )
}
