import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { themeInitScript } from '../lib/theme.ts'

for (const [saved, systemDark, expected] of [['dark', false, 'dark'], ['light', true, 'light'], [null, true, 'dark'], [null, false, 'light'], ['invalid', true, 'dark'], ['denied', true, 'dark']]) {
  test(`theme before hydration: saved=${saved}, systemDark=${systemDark}`, () => {
    let darkClass
    const root = { dataset: {}, style: {}, classList: { toggle: (name, value) => { assert.equal(name, 'dark'); darkClass = value } } }
    vm.runInNewContext(themeInitScript, {
      document: { documentElement: root },
      localStorage: { getItem: () => { if (saved === 'denied') throw new Error('Storage denied'); return saved } },
      window: { matchMedia: () => ({ matches: systemDark }) },
    })
    assert.equal(root.dataset.theme, expected)
    assert.equal(root.style.colorScheme, expected)
    assert.equal(darkClass, expected === 'dark')
  })
}
