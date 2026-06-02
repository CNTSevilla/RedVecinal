import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function PrivacyPage() {
  const { t } = useTranslation()

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
      <Link to="/" style={{ color: 'var(--red-primary)', textDecoration: 'none', fontSize: 14 }}>
        ← {t('privacy.back')}
      </Link>

      <h1 style={{ marginTop: 16 }}>{t('privacy.title')}</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t('privacy.updated')}</p>

      <section style={{ marginTop: 24 }}>
        <h2>{t('privacy.who_title')}</h2>
        <p>{t('privacy.who_body')}</p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>{t('privacy.data_title')}</h2>
        <p>{t('privacy.data_intro')}</p>
        <ul>
          <li><strong>{t('privacy.data_fingerprint')}</strong> — {t('privacy.data_fingerprint_desc')}</li>
          <li><strong>{t('privacy.data_alert')}</strong> — {t('privacy.data_alert_desc')}</li>
          <li><strong>{t('privacy.data_lang')}</strong> — {t('privacy.data_lang_desc')}</li>
          <li><strong>{t('privacy.data_map')}</strong> — {t('privacy.data_map_desc')}</li>
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>{t('privacy.purpose_title')}</h2>
        <p>{t('privacy.purpose_body')}</p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>{t('privacy.legal_title')}</h2>
        <p>{t('privacy.legal_body')}</p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>{t('privacy.sharing_title')}</h2>
        <p>{t('privacy.sharing_body')}</p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>{t('privacy.retention_title')}</h2>
        <p>{t('privacy.retention_body')}</p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>{t('privacy.rights_title')}</h2>
        <p>{t('privacy.rights_intro')}</p>
        <ul>
          <li>{t('privacy.rights_access')}</li>
          <li>{t('privacy.rights_rectify')}</li>
          <li>{t('privacy.rights_delete')}</li>
          <li>{t('privacy.rights_restrict')}</li>
          <li>{t('privacy.rights_portability')}</li>
        </ul>
        <p>{t('privacy.rights_contact')}</p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>{t('privacy.contact_title')}</h2>
        <p>{t('privacy.contact_body')}</p>
      </section>
    </div>
  )
}
