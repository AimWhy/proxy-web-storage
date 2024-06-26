import { expect, test } from '@playwright/test'
import './global.d.ts'

async function delay(ms?: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

test.describe('expired', () => {
  test('setExpires', async ({ page }) => {
    await page.goto('/')

    expect(await page.evaluate(() => {
      const { createProxyStorage } = window.stokado
      const local = createProxyStorage(localStorage)
      local.test = 'hello stokado'
      local.setExpires('test', Date.now() + 1000)
      return local.test
    })).toBe('hello stokado')

    await delay(500)

    expect(await page.evaluate(() => {
      const { createProxyStorage } = window.stokado
      const local = createProxyStorage(localStorage)
      return local.test
    })).toBe('hello stokado')

    await delay(500)

    expect(await page.evaluate(() => {
      const { createProxyStorage } = window.stokado
      const local = createProxyStorage(localStorage)
      return local.test
    })).toBeUndefined()
  })

  test('getExpires', async ({ page }) => {
    await page.goto('/')

    const expires = Date.now() + 1000
    await page.evaluate((expires) => {
      const { createProxyStorage } = window.stokado
      const local = createProxyStorage(localStorage)
      local.test = 'hello stokado'
      local.setExpires('test', expires)
      return local.test
    }, expires)

    expect(await page.evaluate(() => {
      const { createProxyStorage } = window.stokado
      const local = createProxyStorage(localStorage)
      return local.getExpires('test')
    })).toEqual(new Date(expires))
  })

  test('removeExpires', async ({ page }) => {
    await page.goto('/')

    await page.evaluate(() => {
      const { createProxyStorage } = window.stokado
      const local = createProxyStorage(localStorage)
      local.test = 'hello stokado'
      local.setExpires('test', Date.now() + 1000)
    })

    await page.evaluate(() => {
      const { createProxyStorage } = window.stokado
      const local = createProxyStorage(localStorage)
      local.removeExpires('test')
    })

    delay(1200)

    expect(await page.evaluate(() => {
      const { createProxyStorage } = window.stokado
      const local = createProxyStorage(localStorage)
      return local.test
    })).toEqual('hello stokado')
  })

  test('setExpires with object', async ({ page }) => {
    await page.goto('/')

    const expires = Date.now() + 1000
    expect(await page.evaluate((expires) => {
      const { createProxyStorage } = window.stokado
      const local = createProxyStorage(localStorage)
      local.test = { hello: 'world' }
      local.setExpires('test', expires)
      local.test.hello = 'stokado'
      local.test.other = 'stokado'
      return local.test
    }, expires)).toEqual({ hello: 'stokado', other: 'stokado' })

    expect(await page.evaluate(() => {
      const { createProxyStorage } = window.stokado
      const local = createProxyStorage(localStorage)
      return local.getExpires('test')
    })).toEqual(new Date(expires))

    await delay(1000)

    expect(await page.evaluate(() => {
      const { createProxyStorage } = window.stokado
      const local = createProxyStorage(localStorage)
      return local.test
    })).toBeUndefined()
  })
})
