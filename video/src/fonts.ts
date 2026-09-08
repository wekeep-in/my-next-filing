import { cancelRender, continueRender, delayRender, staticFile } from 'remotion'

if (typeof document !== 'undefined') {
  const handle = delayRender('Load local video fonts')
  Promise.all(
    [
      ['Inter', 'inter.woff2', '100 900'],
      ['Caveat', 'caveat.woff2', '400 700'],
    ].map(async ([family, file, weight]) => {
      const face = new FontFace(family, `url(${staticFile(`fonts/${file}`)})`, {
        weight,
      })
      document.fonts.add(await face.load())
    }),
  )
    .then(() => continueRender(handle))
    .catch(cancelRender)
}
