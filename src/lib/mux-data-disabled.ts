// disableTracking stops collection but still bundles Mux Data. Vite replaces
// that SDK with only the utilities playback-core needs, keeping telemetry inert.
export default {
  utils: {
    now: Date.now,
    generateUUID: () => crypto.randomUUID(),
  },
  monitor: () => undefined,
}
