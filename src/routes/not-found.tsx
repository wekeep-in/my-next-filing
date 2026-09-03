import { Link } from 'react-router-dom'

export function NotFoundRoute() {
  return (
    <section className="reference-page" aria-labelledby="not-found-title">
      <p className="period">Page not found</p>
      <h1 id="not-found-title">That page does not exist.</h1>
      <p>Return home to start an estimate or learn what this version supports.</p>
      <Link className="button button--primary" to="/">
        Go home
      </Link>
    </section>
  )
}
