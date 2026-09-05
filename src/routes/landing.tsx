import type { MouseEvent } from 'react'
import MuxPlayer from '@mux/mux-player-react/lazy'
import { cn } from 'cn'
import { Link } from 'react-router-dom'
import { useApp } from '@/app-context'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { JourneySidebar, calculationStep } from '@/components/journey-sidebar'
import { LandingFaqs } from '@/components/landing-faqs'
import { ShareLink } from '@/components/share-link'
import { sessionMatchesWorkspace } from '@/routes/plan/model'

export function LandingRoute() {
  const app = useApp()
  const { savedWorkspace, personalSession } = app
  const hasSaved =
    savedWorkspace.kind === 'ready' && Boolean(savedWorkspace.workspace.active)

  const entryLabel = personalSession
    ? personalSession.kind === 'complete'
      ? 'Continue your plan'
      : 'Continue your estimate'
    : hasSaved
      ? 'Continue your saved workspace'
      : 'Start your estimate'
  const entryPath =
    personalSession?.kind === 'complete' || (!personalSession && hasSaved)
      ? '/plan'
      : '/check'
  const enter = (event: MouseEvent<HTMLAnchorElement>, action: () => void) => {
    if (
      event.button !== 0 ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    )
      return
    event.preventDefault()
    action()
  }
  const continueEntry = () =>
    personalSession
      ? app.returnPersonal()
      : hasSaved
        ? app.openWorkspace()
        : app.startPersonal()

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
          <Link to="/check" onClick={(event) => enter(event, app.startExample)}>
            fictional example
          </Link>
          {' or '}
          <ShareLink />.
        </p>
      </header>

      <JourneySidebar
        className="landing-sidebar"
        activeStep={0}
        backAction={
          hasSaved &&
          !sessionMatchesWorkspace(personalSession, savedWorkspace) ? (
            <Link
              className={buttonVariants({
                variant: 'outline',
                className: 'w-full min-w-0 whitespace-normal',
              })}
              to={personalSession ? '/plan' : '/check'}
              onClick={(event) =>
                enter(
                  event,
                  personalSession ? app.openWorkspace : app.startPersonal,
                )
              }
            >
              {personalSession
                ? 'Open saved workspace'
                : 'Start a separate estimate'}
            </Link>
          ) : null
        }
        action={
          <Link
            className={cn(
              buttonVariants(),
              'landing-start w-full min-w-0 px-[.65rem] text-primary-foreground!',
            )}
            to={entryPath}
            onClick={(event) => enter(event, continueEntry)}
          >
            {entryLabel}
          </Link>
        }
        disabledSteps={[2, 3, 4, 5, 6, 7, calculationStep]}
        onStepSelect={(step) =>
          step === 0 ? window.scrollTo(0, 0) : continueEntry()
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
