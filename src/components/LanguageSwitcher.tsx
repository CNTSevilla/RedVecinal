/**
 * Selector de idioma.
 * Muestra un <select> con los 7 idiomas disponibles.
 * Al cambiar, persiste en localStorage vía i18next-browser-languagedetector.
 */
import { useTranslation } from 'react-i18next'

const languages = [
  { code: 'es', label: 'Castellano' },
  { code: 'and', label: 'Andaluz' },
  { code: 'ca', label: 'Català' },
  { code: 'eu', label: 'Euskera' },
  { code: 'va', label: 'Valencià' },
  { code: 'gl', label: 'Galego' },
  { code: 'ary', label: 'الدارجة (Marroquí)' },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      style={{
        background: 'var(--bg-tertiary)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '14px',
        cursor: 'pointer',
      }}
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.label}
        </option>
      ))}
    </select>
  )
}
