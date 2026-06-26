import { useState } from 'react'
import { ArrowRight, BadgeCheck, LockKeyhole, ShieldCheck } from 'lucide-react'
import Brand from '../components/layout/Brand'
import ImpactRow from '../components/shared/ImpactRow'
import { loginApi } from '../api/api'

function LoginPage() {
  const [credentials, setCredentials] = useState({
    username: 'admin',
    password: 'OKrskB7dPt39XPcu',
  })

  

  const handleSubmit = async (event) => {
    event.preventDefault()
    const res = await loginApi(credentials.username, credentials.password);
    localStorage.setItem("lease_token", res.access_token);
    window.location.href = '/lease-extraction';
  }

  return (
    <main className="login-page">
      <section className="login-hero">
        <Brand className="login-brand" />
        <div>
          <div className="pill">
            <ShieldCheck size={16} />
            Secure finance workspace
          </div>
          <h1>Secure access for lease extraction and GL workbook generation.</h1>
          <p>
            Sign in first, then review extracted lease drafts, map GL accounts and prepare
            monthly journal entries for upload.
          </p>
        </div>
        <div className="login-stats">
          <ImpactRow label="Manual monthly process" value="2-3 days" muted />
          <ImpactRow label="Lease schedule volume" value="60-70" />
          <ImpactRow label="Monthly output" value="GL upload file" />
        </div>
      </section>

      <section className="login-card" aria-label="Sign in form">
        <div className="login-card-header">
          <div className="section-icon">
            <LockKeyhole size={18} />
          </div>
          <div>
            <h2>Sign in</h2>
            <p>Access the lease amortization dashboard.</p>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Username</span>
            <input
              autoComplete="username"
              value={credentials.username}
              onChange={(event) =>
                setCredentials((current) => ({
                  ...current,
                  username: event.target.value,
                }))
              }
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              autoComplete="current-password"
              type="password"
              value={credentials.password}
              onChange={(event) =>
                setCredentials((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
            />
          </label>
          <button className="primary-button" type="submit">
            Sign in to Workflow
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="login-note">
          <BadgeCheck size={18} />
          <span>Protected workspace for lease review, account mapping and GL workbook prep.</span>
        </div>
      </section>
    </main>
  )
}

export default LoginPage
