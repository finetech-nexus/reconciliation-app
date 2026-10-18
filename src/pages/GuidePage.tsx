import { useState, type ReactNode } from 'react'
import { useI18n, type MessageKey } from '../i18n'
import { EXT_JSON_SAMPLE, EXT_SAMPLE, GL_JSON_SAMPLE, GL_SAMPLE, REVERSAL_EXT_SAMPLE, REVERSAL_GL_SAMPLE } from './demo'

function Sample({ label, value }: { label: string; value: string }) {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)
  return (
    <div className="source-block">
      <div className="source-bar">
        <span className="language-code">{label}</span>
        <button
          className="btn ghost"
          type="button"
          onClick={() => {
            const clipboard = navigator.clipboard
            const done = () => {
              setCopied(true)
              window.setTimeout(() => setCopied(false), 1200)
            }
            if (clipboard?.writeText) clipboard.writeText(value).then(done).catch(done)
            else done()
          }}
        >
          {copied ? t('guide.copied') : t('guide.copy')}
        </button>
      </div>
      <pre className="source-sample">{value.trim()}</pre>
    </div>
  )
}

function Section({ title, body, children }: { title: string; body: string; children: ReactNode }) {
  return (
    <section className="card source-card">
      <h2>{title}</h2>
      <p className="meta">{body}</p>
      {children}
    </section>
  )
}

const OUTCOMES: MessageKey[] = ['guide.exact', 'guide.grouped', 'guide.amount', 'guide.ambiguous', 'guide.tx', 'guide.entry']

export default function GuidePage() {
  const { t } = useI18n()
  return (
    <div>
      <div className="page-head">
        <div>
          <div className="kicker">{t('guide.kicker')}</div>
          <h1>{t('guide.title')}</h1>
          <p className="lead">{t('guide.lead')}</p>
        </div>
      </div>
      <div className="source-stack">
        <Section title={t('guide.accounting.title')} body={t('guide.accounting.body')}>
          <Sample label={t('guide.csv')} value={GL_SAMPLE} />
          <Sample label={t('guide.json')} value={GL_JSON_SAMPLE} />
        </Section>
        <Section title={t('guide.external.title')} body={t('guide.external.body')}>
          <Sample label={t('guide.csv')} value={EXT_SAMPLE} />
          <Sample label={t('guide.json')} value={EXT_JSON_SAMPLE} />
        </Section>
        <Section title={t('guide.reversal.title')} body={t('guide.reversal.body')}>
          <Sample label={t('guide.reversal.books')} value={REVERSAL_GL_SAMPLE} />
          <Sample label={t('guide.reversal.external')} value={REVERSAL_EXT_SAMPLE} />
        </Section>
        <Section title={t('guide.recurrent.title')} body={t('guide.recurrent.body')}>
          <p className="meta">{t('guide.recurrent.core')}</p>
          <p className="meta">{t('guide.recurrent.bct')}</p>
          <p className="meta">{t('guide.recurrent.corr')}</p>
        </Section>
        <section className="card source-card">
          <h2>{t('guide.outcomes')}</h2>
          <ul className="source-outcomes">
            {OUTCOMES.map((key) => <li key={key}>{t(key)}</li>)}
          </ul>
        </section>
      </div>
    </div>
  )
}
