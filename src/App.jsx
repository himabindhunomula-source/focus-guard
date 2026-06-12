import { useEffect, useMemo, useState } from 'react'
import History from "./History";
import { supabase } from './supabase'

import './App.css'

const TIMER_OPTIONS = [25, 45, 60]
const DISTRACTION_APPS = ['Instagram', 'TikTok', 'YouTube', 'Snapchat']
const WEEKLY_FOCUS_DATA = [
  { day: 'Mon', minutes: 95 },
  { day: 'Tue', minutes: 130 },
  { day: 'Wed', minutes: 80 },
  { day: 'Thu', minutes: 145 },
  { day: 'Fri', minutes: 120 },
  { day: 'Sat', minutes: 70 },
  { day: 'Sun', minutes: 105 },
]
const MOTIVATION_QUOTES = [
  'Small progress every day adds up to big results.',
  'Discipline is choosing between what you want now and what you want most.',
  'Focus on the step in front of you, not the whole staircase.',
  'Your future self is watching what you do today.',
  'Deep work today creates freedom tomorrow.',
]

const initialSelections = DISTRACTION_APPS.reduce((acc, app) => {
  acc[app] = true
  return acc
}, {})

function App() {
  const [quote, setQuote] = useState("");
  useEffect(() => {
  fetch("http://127.0.0.1:8000/quote")
    .then((res) => res.json())
    .then((data) => setQuote(data.quote))
    .catch((err) => console.error(err));
}, []);
  const [screen, setScreen] = useState('login')
  const [displayScreen, setDisplayScreen] = useState('login')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [selectedMinutes, setSelectedMinutes] = useState(25)
  const [blockedSelections, setBlockedSelections] = useState(initialSelections)

  const [secondsLeft, setSecondsLeft] = useState(0)
  const [activeMinutes, setActiveMinutes] = useState(0)
  const [activeBlockedApps, setActiveBlockedApps] = useState([])
  const [quoteIndex, setQuoteIndex] = useState(0)

  const [dailyProgress] = useState(72)
  const [streak, setStreak] = useState(9)

  const TRANSITION_MS = 260

  const selectedBlockedApps = useMemo(
    () => Object.entries(blockedSelections).filter(([, checked]) => checked).map(([app]) => app),
    [blockedSelections],
  )

  useEffect(() => {
    if (screen !== 'active-session' || secondsLeft <= 0) return

    const timer = window.setInterval(() => {
      setSecondsLeft((previous) => {
        if (previous <= 1) {
          window.clearInterval(timer)
          setStreak((current) => current + 1)
          setScreen('session-complete')
          return 0
        }

        return previous - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [screen, secondsLeft])

  useEffect(() => {
    if (screen !== 'active-session') return

    const quoteTimer = window.setInterval(() => {
      setQuoteIndex((current) => (current + 1) % MOTIVATION_QUOTES.length)
    }, 25000)

    return () => window.clearInterval(quoteTimer)
  }, [screen])

  const handleLogin = (event) => {
    event.preventDefault()
    if (!email.trim() || !password.trim()) return
    setScreen('dashboard')
  }

  const handleStartSession = () => {
    const blockedApps = selectedBlockedApps.length > 0 ? selectedBlockedApps : DISTRACTION_APPS

    setActiveMinutes(selectedMinutes)
    setSecondsLeft(selectedMinutes * 60)
    setActiveBlockedApps(blockedApps)
    setQuoteIndex(Math.floor(Math.random() * MOTIVATION_QUOTES.length))
    setScreen('active-session')
  }

  const handleEndSession = async () => {
  try {
    const { data, error } = await supabase
      .from('study_session')
      .insert([
        {
          minutes: activeMinutes,
          completed_at: new Date().toLocaleString(),
          blocked_apps: activeBlockedApps.join(', ')
        }
      ])

    console.log("DATA:", data)
    console.log("ERROR:", error)

    setScreen("session-complete")
  } catch (error) {
    console.error(error)
  }
}
  const resetToDashboard = () => {
    setSelectedMinutes(25)
    setBlockedSelections(initialSelections)
    setScreen('dashboard')
  }

  useEffect(() => {
    if (screen === displayScreen) return

    setIsTransitioning(true)

    const switchTimer = window.setTimeout(() => {
      setDisplayScreen(screen)
      setIsTransitioning(false)
    }, TRANSITION_MS)

    return () => window.clearTimeout(switchTimer)
  }, [screen, displayScreen])

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const today = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const weeklyTotalMinutes = WEEKLY_FOCUS_DATA.reduce((sum, item) => sum + item.minutes, 0)
  const weeklyAverageMinutes = Math.round(weeklyTotalMinutes / WEEKLY_FOCUS_DATA.length)
  const bestDay = WEEKLY_FOCUS_DATA.reduce((best, current) =>
    current.minutes > best.minutes ? current : best,
  )
  const chartMax = Math.max(...WEEKLY_FOCUS_DATA.map((item) => item.minutes))
  const activeQuote = MOTIVATION_QUOTES[quoteIndex]

  return (
    <main className="app-shell">
      <div className="app-glow app-glow--top" />
      <div className="app-glow app-glow--bottom" />

      {displayScreen === 'login' && (
        <section className={`screen screen--narrow ${isTransitioning ? 'screen-transition-exit' : 'screen-transition-enter'}`}>
          <p className="badge">Focus Guard</p>
          <h1>Protect your study focus.</h1>
          <p className="subtext">
            Block distractions, keep your momentum, and build a streak you can be proud of.
          </p>

          <form className="card form-card" onSubmit={handleLogin}>
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="student@university.edu"
            />

            <label className="field-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />

            <button className="btn btn-primary" type="submit">
              Login
            </button>
          </form>
        </section>
      )}

      {displayScreen === 'dashboard' && (
        <section className={`screen ${isTransitioning ? 'screen-transition-exit' : 'screen-transition-enter'}`}>
          <div className="header-row">
            <div className="dashboard-hero-copy">
              <p className="badge">Dashboard</p>
              <h1>Welcome back, Scholar 👋</h1>
              <p className="subtext">{today}</p>
            </div>
            <button
              className="btn btn-primary dashboard-cta"
              onClick={() => setScreen('setup-session')}
            >
              Start Focus Session
            </button>
          </div>

          <div className="grid metrics-grid">
            <article className="card metric-card">
              <h2>Daily Study Goal</h2>
              <p className="metric-value">{dailyProgress}% complete</p>
              <div className="progress-track" aria-label="Daily progress bar">
                <div className="progress-fill" style={{ width: `${dailyProgress}%` }} />
              </div>
            </article>

            <article className="card metric-card">
              <h2>Streak Counter</h2>
              <p className="metric-value">🔥 {streak} days</p>
              <p className="subtext">You’ve stayed focused every day this week.</p>
            </article>
          </div>

          <article className="card chart-card">
            <div className="chart-header">
              <h2>Weekly Focus Statistics</h2>
              <p className="subtext">Focused minutes this week</p>
            </div>

            <div className="weekly-chart" role="img" aria-label="Weekly focus minutes bar chart">
              {WEEKLY_FOCUS_DATA.map((entry) => {
                const barHeight = Math.max((entry.minutes / chartMax) * 100, 8)

                return (
                  <div key={entry.day} className="chart-column">
                    <span className="chart-value">{entry.minutes}m</span>
                    <div className="chart-bar-track">
                      <div
                        className={`chart-bar ${entry.day === bestDay.day ? 'chart-bar--highlight' : ''}`}
                        style={{ height: `${barHeight}%` }}
                      />
                    </div>
                    <span className="chart-day">{entry.day}</span>
                  </div>
                )
              })}
            </div>

            <div className="chart-stats-grid">
              <div className="chart-stat-item">
                <span>Total</span>
                <strong>{weeklyTotalMinutes} mins</strong>
              </div>
              <div className="chart-stat-item">
                <span>Daily Avg</span>
                <strong>{weeklyAverageMinutes} mins</strong>
              </div>
              <div className="chart-stat-item">
                <span>Best Day</span>
                <strong>
                  {bestDay.day} ({bestDay.minutes}m)
                </strong>
              </div>
            </div>
          </article>
        </section>
      )}

      {displayScreen === 'setup-session' && (
        <section className={`screen screen--narrow ${isTransitioning ? 'screen-transition-exit' : 'screen-transition-enter'}`}>
          <button className="back-nav" type="button" onClick={() => setScreen('dashboard')}>
            <span aria-hidden="true">←</span>
            Back
          </button>

          <p className="badge">Focus Session Setup</p>
          <h1 className="setup-title">Choose your session plan</h1>
          <p className="subtext">Select a timer and apps to block during this session.</p>

          <div className="card setup-card">
            <h2>Timer Options</h2>
            <div className="option-row">
              {TIMER_OPTIONS.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  className={`chip ${selectedMinutes === minutes ? 'chip--selected' : ''}`}
                  onClick={() => setSelectedMinutes(minutes)}
                >
                  {minutes} mins
                </button>
              ))}
            </div>

            <h2>Apps to Block</h2>
            <div className="option-row option-row--wrap">
              {DISTRACTION_APPS.map((app) => (
                <button
                  key={app}
                  type="button"
                  className={`chip ${blockedSelections[app] ? 'chip--selected' : ''}`}
                  onClick={() =>
                    setBlockedSelections((current) => ({
                      ...current,
                      [app]: !current[app],
                    }))
                  }
                >
                  {app}
                </button>
              ))}
            </div>

            <button className="btn btn-primary" type="button" onClick={handleStartSession}>
              Start Session
            </button>
            <button className="btn btn-secondary"onClick={() => setScreen("history")}>
               View History
            </button>
          </div>
        </section>
      )}

      {displayScreen === 'active-session' && (
        <section className={`screen screen--narrow ${isTransitioning ? 'screen-transition-exit' : 'screen-transition-enter'}`}>
          <button className="back-nav" type="button" onClick={() => setScreen('setup-session')}>
            <span aria-hidden="true">←</span>
            Back
          </button>

          <p className="badge">Focus Session Active</p>
          <h1 className="timer-display">{formatTime(secondsLeft)}</h1>
          <p className="subtext">Stay locked in. Distractions are blocked.</p>

          <article className="card">
            <h2>Blocked Apps</h2>
            <div className="option-row option-row--wrap">
              {activeBlockedApps.map((app) => (
                <span key={app} className="chip chip--selected">
                  {app}
                </span>
              ))}
            </div>
          </article>

          <article className="card quote-card" aria-live="polite">
            <p className="quote-label">Motivation</p>
            <p className="quote-text">“{quote || activeQuote}”</p>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => setQuoteIndex((current) => (current + 1) % MOTIVATION_QUOTES.length)}
            >
              New Quote
            </button>
          </article>

          <button className="btn btn-danger" type="button" onClick={handleEndSession}>
            End Session
          </button>
        </section>
      )}
      {displayScreen === "history" && (
      <section className="screen">
      <History />

      <button className="btn btn-primary" onClick={() => setScreen("dashboard")}>
        Back to Dashboard
      </button>
    </section>
)}
      {displayScreen === 'session-complete' && (
        <section className={`screen screen--narrow ${isTransitioning ? 'screen-transition-exit' : 'screen-transition-enter'}`}>
          <p className="badge">Session Complete</p>
          <h1>Great work! 🎉</h1>
          <p className="subtext">You protected your focus and made meaningful progress today.</p>

          <article className="card summary-list">
            <div className="summary-item">
              <span>Time focused</span>
              <strong>{activeMinutes} minutes</strong>
            </div>
            <div className="summary-item">
              <span>Apps blocked</span>
              <strong>{activeBlockedApps.join(', ')}</strong>
            </div>
            <div className="summary-item">
              <span>Current streak</span>
              <strong>🔥 {streak} days</strong>
            </div>
          </article>

          <button className="btn btn-primary" type="button" onClick={resetToDashboard}>
            Return Dashboard
          </button>
        </section>
      )}
    </main>
  )
}

export default App
