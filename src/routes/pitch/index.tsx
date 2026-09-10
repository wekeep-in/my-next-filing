import { useEffect, useRef, useState } from 'react'
import { Player, Thumbnail } from '@remotion/player'
import type { PlayerRef } from '@remotion/player'
import {
  ArrowLeft,
  ArrowRight,
  Expand,
  Minimize,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PitchScene, framesForSlide } from './scene'
import { slides } from './slides'
import './pitch.css'

function PitchPlaybackError() {
  return (
    <div className="pitch-player-error">
      <h1>This slide couldn't play</h1>
      <p>Advance to continue, or reload to retry.</p>
    </div>
  )
}

export function PitchRoute() {
  const location = useLocation()
  const navigate = useNavigate()
  const requestedSlide = /^#[1-9]\d*$/.test(location.hash)
    ? Number(location.hash.slice(1))
    : 0
  const index =
    requestedSlide <= slides.length && requestedSlide > 0
      ? requestedSlide - 1
      : 0
  const [previous, setPrevious] = useState<number | null>(null)
  const player = useRef<PlayerRef>(null)
  const stage = useRef<HTMLDivElement>(null)
  const selectedPreview = useRef<HTMLButtonElement>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [message, setMessage] = useState('')
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const slide = slides[index]

  useEffect(() => {
    selectedPreview.current?.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
    })
  }, [index])

  useEffect(() => {
    const original = document.title
    document.title = 'My Next Filing · Stage pitch'
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const changed = () => setReduced(media.matches)
    const fullscreenChanged = () =>
      setFullscreen(document.fullscreenElement === stage.current)
    media.addEventListener('change', changed)
    document.addEventListener('fullscreenchange', fullscreenChanged)
    return () => {
      document.title = original
      media.removeEventListener('change', changed)
      document.removeEventListener('fullscreenchange', fullscreenChanged)
    }
  }, [])

  useEffect(() => {
    const instance = player.current
    if (!instance) return
    const play = () => setPlaying(true)
    const pause = () => setPlaying(false)
    instance.addEventListener('play', play)
    instance.addEventListener('pause', pause)
    instance.addEventListener('ended', pause)
    setPlaying(instance.isPlaying())
    return () => {
      instance.removeEventListener('play', play)
      instance.removeEventListener('pause', pause)
      instance.removeEventListener('ended', pause)
    }
  }, [index, reduced])

  const move = (next: number) => {
    if (next < 0 || next >= slides.length || next === index) return
    setPrevious(index)
    void navigate(
      { pathname: '/pitch', hash: `#${next + 1}` },
      { replace: true },
    )
  }
  const replay = () => {
    player.current?.seekTo(0)
    player.current?.play()
  }
  const togglePlayback = () => {
    if (player.current?.isPlaying()) player.current.pause()
    else if (
      (player.current?.getCurrentFrame() ?? 0) >=
      framesForSlide(index) - 1
    )
      replay()
    else player.current?.play()
  }
  const toggleFullscreen = async () => {
    setMessage('')
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else if (stage.current?.requestFullscreen) {
        await stage.current.requestFullscreen()
        stage.current.focus({ preventScroll: true })
      } else
        setMessage(
          'Fullscreen is unavailable in this browser. Use its presentation or fullscreen mode.',
        )
    } catch {
      setMessage(
        'Fullscreen could not start. Try the browser’s fullscreen control.',
      )
    }
  }

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return
      if (
        event.target instanceof HTMLElement &&
        event.target.closest(
          'input, textarea, select, [contenteditable="true"], summary',
        )
      )
        return
      const keyboardAction =
        event.key === 'ArrowRight' || event.key === 'PageDown'
          ? () => move(index + 1)
          : event.key === 'ArrowLeft' || event.key === 'PageUp'
            ? () => move(index - 1)
            : event.key === 'Home'
              ? () => move(0)
              : event.key === 'End'
                ? () => move(slides.length - 1)
                : event.key.toLowerCase() === 'f'
                  ? () => {
                      void toggleFullscreen()
                    }
                  : event.key.toLowerCase() === 'r'
                    ? replay
                    : event.key === ' ' &&
                        !(
                          event.target instanceof HTMLElement &&
                          event.target.closest('button, a')
                        )
                      ? togglePlayback
                      : null
      if (keyboardAction) {
        event.preventDefault()
        keyboardAction()
      }
    }
    window.addEventListener('keydown', keydown)
    return () => window.removeEventListener('keydown', keydown)
  })

  return (
    <main className="pitch-page">
      <span className="sr-only" role="status">
        Slide {index + 1}: {slide.title}
      </span>
      <nav className="pitch-navigation" aria-label="Slides">
        <h2>
          Slides <span>{slides.length}</span>
        </h2>
        <ScrollArea className="pitch-preview-scroll">
          <ol className="pitch-slide-list">
            {slides.map((item, number) => (
              <li key={number}>
                <button
                  type="button"
                  className="pitch-preview-button"
                  ref={number === index ? selectedPreview : undefined}
                  onClick={() => move(number)}
                  aria-current={number === index ? 'step' : undefined}
                  aria-label={`Slide ${number + 1}: ${item.title}`}
                >
                  <div className="pitch-preview" aria-hidden="true" inert>
                    <Thumbnail
                      component={PitchScene}
                      inputProps={{
                        index: number,
                        previous: null,
                        reduced: true,
                        preview: true,
                      }}
                      frameToDisplay={framesForSlide(number) - 1}
                      durationInFrames={framesForSlide(number)}
                      compositionWidth={1280}
                      compositionHeight={720}
                      fps={30}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <span className="pitch-preview-caption">
                    <span>{number + 1}</span>
                    <span>{item.title}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </ScrollArea>
      </nav>
      <section className="pitch-workspace" aria-label="Slide workspace">
        <div
          className="pitch-stage-wrap"
          data-kind={slide.kind}
          ref={stage}
          tabIndex={-1}
          aria-label="Pitch presentation"
        >
          <div
            className="pitch-stage"
            aria-label={`Slide ${index + 1} of ${slides.length}: ${slide.title}`}
          >
            <Player
              key={`${index}-${reduced}`}
              ref={player}
              component={PitchScene}
              inputProps={{ index, previous, reduced }}
              durationInFrames={framesForSlide(index)}
              compositionWidth={1280}
              compositionHeight={720}
              fps={30}
              style={{ width: '100%', height: '100%' }}
              autoPlay={!reduced}
              controls={false}
              clickToPlay={false}
              spaceKeyToPlayOrPause={false}
              moveToBeginningWhenEnded={false}
              numberOfSharedAudioTags={0}
              initiallyMuted
              showVolumeControls={false}
              errorFallback={PitchPlaybackError}
            />
          </div>
          <div className="pitch-control-row">
            <div className="pitch-controls" aria-label="Presentation controls">
              <Button
                variant="outline"
                size="icon"
                aria-label="Previous slide"
                disabled={index === 0}
                onClick={() => move(index - 1)}
              >
                <ArrowLeft size={20} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Next slide"
                disabled={index === slides.length - 1}
                onClick={() => move(index + 1)}
              >
                <ArrowRight size={20} />
              </Button>
              <Button
                className="pitch-play-control"
                variant="outline"
                size="icon"
                aria-label={playing ? 'Pause slide' : 'Play slide'}
                onClick={togglePlayback}
              >
                {playing ? <Pause size={19} /> : <Play size={19} />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Replay slide"
                onClick={replay}
              >
                <RotateCcw size={19} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                title={
                  fullscreen ? 'Exit fullscreen (F)' : 'Enter fullscreen (F)'
                }
                onClick={() => {
                  void toggleFullscreen()
                }}
              >
                {fullscreen ? <Minimize size={18} /> : <Expand size={18} />}
              </Button>
            </div>
            <div
              className="pitch-keyboard-help"
              aria-label="Keyboard shortcuts"
            >
              <span>
                <KbdGroup>
                  <Kbd aria-label="Left arrow">←</Kbd>
                  <Kbd aria-label="Right arrow">→</Kbd>
                </KbdGroup>{' '}
                slides
              </span>
              <span>
                <Kbd>Space</Kbd> pause / play
              </span>
              <span>
                <Kbd>R</Kbd> replay
              </span>
              <span>
                <Kbd>F</Kbd> fullscreen
              </span>
              <span>
                <Kbd>Esc</Kbd> exit
              </span>
            </div>
          </div>
          {message && (
            <p className="pitch-status" role="status">
              {message}
            </p>
          )}
        </div>
      </section>
    </main>
  )
}
