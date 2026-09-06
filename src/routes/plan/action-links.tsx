import { ExternalLink } from '@/components/external-link'
import type { ReactNode } from 'react'
import { buttonVariants } from '@/components/ui/button'
import type { ObligationKind } from '@/evaluation'
import { sourceRegistry } from '@/rules'

const gstLogin = 'https://services.gst.gov.in/services/login'
// Fixed public entry points. Review: .scratch/plan-action-links/source-review.md.
const destinations = {
  'advance-tax': {
    url: 'https://eportal.incometax.gov.in/iec/foservices/#/e-pay-tax-prelogin/user-details',
    label: 'Open e-Pay Tax',
    help: 'How to pay',
    guide: 'official e-Pay Tax guide',
    hint: 'Choose the tax period and payment type on the Income Tax portal.',
  },
  'annual-return': {
    url: 'https://eportal.incometax.gov.in/iec/foservices/#/login',
    label: 'Open e-Filing portal',
    help: 'How to file',
    guide: 'official e-Filing guide',
    hint: 'After signing in, go to e-File → Income Tax Returns → File Income Tax Return. This plan does not choose a return form.',
  },
  'gst-registration': {
    url: 'https://reg.gst.gov.in/registration/',
    label: 'Start GST registration',
    help: 'How to register',
    guide: 'official GST registration guide',
    hint: 'Prepare your details before starting the registration application.',
  },
  'gst-gstr1': {
    url: gstLogin,
    label: 'Open GST portal',
    guide: 'official GSTR-1 guide',
    help: 'How to file',
    hint: 'After signing in, go to Services → Returns → Returns Dashboard → GSTR-1.',
  },
  'gst-gstr3b': {
    url: gstLogin,
    label: 'Open GST portal',
    guide: 'official GSTR-3B guide',
    help: 'How to file',
    hint: 'After signing in, go to Services → Returns → Returns Dashboard → GSTR-3B.',
  },
  'gst-qrmp-payment': {
    url: gstLogin,
    label: 'Open GST portal',
    guide: 'official QRMP payment guide',
    help: 'How to review and pay',
    hint: 'Review your ledgers first. If a deposit is needed, go to Services → Payments → Create Challan.',
  },
  'gst-lut': {
    url: gstLogin,
    label: 'Open GST portal',
    guide: 'official LUT guide',
    help: 'How to submit an LUT',
    hint: 'After signing in, go to Services → User Services → Furnish Letter of Undertaking (LUT).',
  },
} satisfies Record<
  ObligationKind,
  {
    readonly url: string
    readonly label: string
    readonly help: string
    readonly guide: string
    readonly hint: string
  }
>

export function ActionLinks({
  kind,
  prominent = false,
  children,
}: {
  readonly kind: ObligationKind
  readonly prominent?: boolean
  readonly children?: ReactNode
}) {
  const destination = destinations[kind]
  const tutorial = sourceRegistry.find(
    (source) =>
      source.kind === 'tutorial' &&
      source.status === 'approved' &&
      source.coveredObligation === kind,
  )
  const portalLink = (
    <ExternalLink
      href={destination.url}
      className={buttonVariants({
        variant: prominent ? 'default' : 'link',
        className: prominent
          ? 'max-w-full whitespace-normal text-center'
          : undefined,
      })}
    >
      {destination.label}
    </ExternalLink>
  )
  const guideLink = tutorial && (
    <ExternalLink href={tutorial.url}>{destination.guide}</ExternalLink>
  )
  return (
    <>
      {prominent && <div className="attention-portals">{portalLink}</div>}
      {children}
      <details className="action-help">
        <summary>{destination.help}</summary>
        <p>
          {destination.hint}
          {guideLink && <> See the {guideLink}.</>}
          {!prominent && <> {portalLink}.</>}
        </p>
      </details>
    </>
  )
}
