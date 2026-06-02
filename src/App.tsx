import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Logo from './components/Logo'
import LanguageSwitcher from './components/LanguageSwitcher'
import HomePage from './pages/HomePage'
import PrivacyPage from './pages/PrivacyPage'
import LegalPage from './pages/LegalPage'

function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  const location = useLocation()
  const isLegalPage = location.pathname === '/privacy' || location.pathname === '/legal'

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        padding: '6px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        height: '48px',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <Logo size={28} />
          <span style={{ color: 'var(--red-primary)', fontWeight: 700, fontSize: '16px' }}>
            {t('app.name')}
          </span>
        </Link>
        <LanguageSwitcher />
      </header>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: isLegalPage ? 'auto' : 'hidden' }}>
        {children}
      </main>
      <div style={{
        background: 'var(--bg-accent, #f0f0f0)',
        padding: '6px 12px',
        textAlign: 'center',
        fontSize: '11px',
        color: 'var(--text-muted)',
        flexShrink: 0,
        lineHeight: 1.4,
      }}>
        {t('footer.notice')}
      </div>
      <footer style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border)',
        padding: '6px 12px',
        textAlign: 'center',
        fontSize: '11px',
        color: 'var(--text-muted)',
        flexShrink: 0,
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      }}>
        <Link to="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>{t('footer.privacy')}</Link>
        <span style={{ color: 'var(--border)' }}>·</span>
        <Link to="/legal" style={{ color: 'inherit', textDecoration: 'none' }}>{t('footer.legal')}</Link>
        <span style={{ color: 'var(--border)' }}>·</span>
        <span>{t('footer.rights')}</span>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/legal" element={<LegalPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
