import { useState } from 'react'
import { Button } from '@/components/ui/button'

const sharePayload = {
  title: 'My Next Filing',
  text: 'Estimate income tax and see filing and payment dates for supported solo freelancers in India.',
  url: 'https://mynextfiling.wekeep.in/',
} as const

export function ShareLink() {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle')

  const share = async () => {
    setStatus('idle')
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share(sharePayload)
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError'))
          setStatus('failed')
      }
      return
    }
    if (!navigator.clipboard) {
      setStatus('failed')
      return
    }
    try {
      await navigator.clipboard.writeText(sharePayload.url)
      setStatus('copied')
    } catch {
      setStatus('failed')
    }
  }

  return (
    <>
      <Button
        className="font-extrabold!"
        variant="link"
        type="button"
        onClick={share}
      >
        share My Next Filing
      </Button>
      {status === 'copied' && (
        <span className="font-extrabold text-primary" role="status">
          {' '}
          Site link copied
        </span>
      )}
      {status === 'failed' && (
        <span
          className="text-journey leading-[1.6] font-bold text-destructive"
          role="alert"
        >
          {' '}
          Couldn't share the link. Copy it from the address bar instead
        </span>
      )}
    </>
  )
}
