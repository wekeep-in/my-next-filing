import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'

export function NotFoundRoute() {
  return (
    <section className="reference-page" aria-labelledby="not-found-title">
      <p className="mb-1 text-sm! leading-[1.3]! font-extrabold text-primary!">
        Page not found
      </p>
      <h1 id="not-found-title">That page does not exist.</h1>
      <p>Return home to start an estimate or learn what this app supports.</p>
      <Link
        className={buttonVariants({ className: 'text-primary-foreground!' })}
        to="/"
      >
        Go home
      </Link>
    </section>
  )
}
