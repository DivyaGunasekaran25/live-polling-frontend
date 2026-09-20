import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)

  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem('pollToken')
  )

  const [question, setQuestion] = useState('')
  const [option1, setOption1] = useState('')
  const [option2, setOption2] = useState('')
  const [option3, setOption3] = useState('')

  const [poll, setPoll] = useState(null)
  const [votes, setVotes] = useState([0, 0, 0])
  const [shareLink, setShareLink] = useState('')

  // Load a shared poll from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const pollId = params.get('poll')

    if (!pollId) return

    const loadSharedPoll = async () => {
      try {
        const response = await fetch(
          `http://localhost:8081/polls/${pollId}`
        )

        const data = await response.json()

        if (!response.ok) {
          alert(data.message || 'Poll not found')
          return
        }

        setPoll(data)
        setVotes(data.votes || [])
      } catch (error) {
        console.error(error)
        alert('Could not connect to backend')
      }
    }

    loadSharedPoll()
  }, [])

  // Redis live updates through SSE
  useEffect(() => {
    if (!poll) return

    const eventSource = new EventSource(
      `http://localhost:8081/polls/${poll.id}/events`
    )

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.votes) {
          setVotes(data.votes)
        }
      } catch (error) {
        console.error('Live update error:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('Live connection error:', error)
    }

    return () => {
      eventSource.close()
    }
  }, [poll])

  // Login / Signup
  const handleAuth = async () => {
    if (!email || !password) {
      alert('Please enter email and password')
      return
    }

    const endpoint = isLogin
      ? 'http://localhost:8081/auth/login'
      : 'http://localhost:8081/auth/signup'

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || 'Authentication failed')
        return
      }

      localStorage.setItem('pollToken', data.token)
      localStorage.setItem('pollEmail', data.email)

      setLoggedIn(true)

      alert(
        isLogin
          ? 'Login successful!'
          : 'Account created successfully!'
      )
    } catch (error) {
      console.error(error)
      alert('Could not connect to backend')
    }
  }

  // Create poll
  const createPoll = async () => {
    if (!question || !option1 || !option2 || !option3) {
      alert('Please fill in all fields')
      return
    }

    const token = localStorage.getItem('pollToken')

    if (!token) {
      alert('Please login first')
      return
    }

    const pollData = {
      question,
      options: [option1, option2, option3],
    }

    try {
      const response = await fetch(
        'http://localhost:8081/polls',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(pollData),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || 'Failed to create poll')
        return
      }

      setPoll(data.poll)
      setVotes(data.poll.votes || [])

      const link =
        `${window.location.origin}/?poll=${data.poll.id}`

      setShareLink(link)

      alert('Poll created successfully!')
    } catch (error) {
      console.error(error)
      alert('Could not connect to backend')
    }
  }

  // Vote
  const vote = async (index) => {
    if (!poll) return

    try {
      const response = await fetch(
        `http://localhost:8081/polls/${poll.id}/vote`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            optionIndex: index,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || 'Failed to record vote')
        return
      }

      setVotes(data.votes)
    } catch (error) {
      console.error(error)
      alert('Could not connect to backend')
    }
  }

  // Copy link
  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      alert('Poll link copied!')
    } catch (error) {
      console.error(error)
      alert('Could not copy the link')
    }
  }

  // Logout
  const logout = () => {
    localStorage.removeItem('pollToken')
    localStorage.removeItem('pollEmail')

    setLoggedIn(false)
    setPoll(null)
    setShareLink('')

    alert('Logged out')
  }

  // Calculate total votes
  const totalVotes = votes.reduce(
    (total, currentVotes) => total + (currentVotes || 0),
    0
  )

  // Calculate percentage
  const getPercentage = (voteCount) => {
    if (totalVotes === 0) {
      return 0
    }

    return Math.round((voteCount / totalVotes) * 100)
  }

  // Login / Signup screen
  if (!loggedIn && !poll) {
    return (
      <div className="app">
        <div className="poll-box">
          <h1>Live Polling</h1>

          <h2>
            {isLogin ? 'Login' : 'Create Account'}
          </h2>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={handleAuth}>
            {isLogin ? 'Login' : 'Sign Up'}
          </button>

          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{ marginTop: '10px' }}
          >
            {isLogin
              ? 'Create a new account'
              : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <h1>Live Polling</h1>

      {!poll && loggedIn && (
        <div className="poll-box">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <p>
              Logged in as:{' '}
              <strong>
                {localStorage.getItem('pollEmail')}
              </strong>
            </p>

            <button onClick={logout}>
              Logout
            </button>
          </div>

          <h2>Create a Poll</h2>

          <input
            type="text"
            placeholder="Enter your question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          <input
            type="text"
            placeholder="Enter option 1"
            value={option1}
            onChange={(e) => setOption1(e.target.value)}
          />

          <input
            type="text"
            placeholder="Enter option 2"
            value={option2}
            onChange={(e) => setOption2(e.target.value)}
          />

          <input
            type="text"
            placeholder="Enter option 3"
            value={option3}
            onChange={(e) => setOption3(e.target.value)}
          />

          <button onClick={createPoll}>
            Create Poll
          </button>
        </div>
      )}

      {poll && (
        <div className="poll-box">
          <h2>{poll.question}</h2>

          <p>
            🔴 <strong>Live Results</strong>
          </p>

          <p>
            <strong>Total Votes: {totalVotes}</strong>
          </p>

          {poll.options.map((option, index) => {
            const voteCount = votes[index] || 0
            const percentage = getPercentage(voteCount)

            return (
              <div
                key={index}
                style={{
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '6px',
                  }}
                >
                  <strong>{option}</strong>

                  <span>
                    {voteCount} votes · {percentage}%
                  </span>
                </div>

                <div
                  style={{
                    width: '100%',
                    height: '18px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '10px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${percentage}%`,
                      height: '100%',
                      backgroundColor: '#4f46e5',
                      borderRadius: '10px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>

                <button
                  onClick={() => vote(index)}
                  style={{
                    marginTop: '8px',
                  }}
                >
                  Vote for {option}
                </button>
              </div>
            )
          })}

          {shareLink && (
            <div style={{ marginTop: '20px' }}>
              <p>
                <strong>Share this poll:</strong>
              </p>

              <input
                type="text"
                value={shareLink}
                readOnly
                style={{ width: '100%' }}
              />

              <button
                onClick={copyShareLink}
                style={{ marginTop: '10px' }}
              >
                Copy Poll Link
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App