import type { MouseEvent } from 'react'
import MuxPlayer from '@mux/mux-player-react/lazy'
import { cn } from 'cn'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import type { AppOutletContext } from '../app.tsx'
import { Badge } from '../components/ui/badge.tsx'
import { buttonVariants } from '../components/ui/button.tsx'
import {
  JourneySidebar,
  calculationStep,
} from '../components/journey-sidebar.tsx'
import { LandingFaqs } from '../components/landing-faqs.tsx'
import { ShareLink } from '../components/share-link.tsx'

export function LandingRoute() {
  const navigate = useNavigate()
  const { savedWorkspace } = useOutletContext<AppOutletContext>()
  const hasSaved =
    savedWorkspace.kind === 'ready' && Boolean(savedWorkspace.workspace.active)

  const navigateToCheckFromPointer = (
    event: MouseEvent<HTMLAnchorElement>,
    state: { readonly example?: true; readonly personal?: true },
  ) => {
    if (
      event.button !== 0 ||
      event.detail === 0 ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    )
      return
    event.preventDefault()
    navigate('/check', { state: { ...state, animate: true } })
  }

  return (
    <section className="landing" aria-labelledby="landing-title">
      <header className="landing-hero">
        <div className="landing-title-row">
          <Badge variant="period">Tax year 2026-27</Badge>
          <h1 id="landing-title">My Next Filing</h1>
        </div>
        <p className="landing-intro">
          Estimate your taxes and see the next filing dates. This app runs in
          your browser and is made for Indian freelancers.
        </p>
        <p className="landing-example">
          Try a{' '}
          <Link
            to="/check"
            state={{ example: true }}
            onClick={(event) =>
              navigateToCheckFromPointer(event, { example: true })
            }
          >
            fictional example
          </Link>
          {' or '}
          <ShareLink />.
        </p>
      </header>

      <JourneySidebar
        className="landing-sidebar"
        activeStep={0}
        backAction={null}
        action={
          <Link
            className={cn(
              buttonVariants(),
              'landing-start w-full min-w-0 px-[.65rem] text-primary-foreground!',
            )}
            to={hasSaved ? '/plan' : '/check'}
            state={hasSaved ? undefined : { personal: true }}
            onClick={(event) => {
              if (!hasSaved)
                navigateToCheckFromPointer(event, { personal: true })
            }}
          >
            {hasSaved ? 'Continue your saved workspace' : 'Start your estimate'}
          </Link>
        }
        disabledSteps={[2, 3, 4, 5, 6, 7, calculationStep]}
        onStepSelect={(step, animate) =>
          step === 0
            ? window.scrollTo(0, 0)
            : navigate('/check', {
                state: { personal: true, step: step - 1, animate },
              })
        }
      />

      <figure className="product-preview">
        <MuxPlayer
          aria-label="My Next Filing walkthrough"
          src="/video/my-next-filing.m3u8"
          poster="/video/my-next-filing-poster.jpg"
          placeholder="/video/my-next-filing-poster.jpg"
          playsInline
          preload="none"
          loading="viewport"
          streamType="on-demand"
          accentColor="var(--primary)"
          disableTracking
          noMutedPref
          noVolumePref
        >
          <track
            default
            kind="captions"
            label="English"
            src="/video/my-next-filing.en.vtt"
            srcLang="en"
          />
        </MuxPlayer>
      </figure>

      <LandingFaqs />
    </section>
  )
}
