import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  return (
    <section id="center">
      <button className="counter" onClick={() => navigate('/countdown')}>
        count down
      </button>
    </section>
  )
}

export default Home
