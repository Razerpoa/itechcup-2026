// Test-only mock for `next/headers` used by tsx-hooks.mjs so node:test can
// exercise src/app/page.tsx. The device type is controlled per-test via
// globalThis.__TEST_DEVICE_TYPE (unset => header absent).
export async function headers() {
  const value = globalThis.__TEST_DEVICE_TYPE
  const requestHeaders = new globalThis.Headers()
  if (value !== undefined) {
    requestHeaders.set('x-device-type', value)
  }
  return requestHeaders
}
