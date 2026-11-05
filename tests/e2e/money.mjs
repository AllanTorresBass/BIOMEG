const out = []
const ok = (name, pass, note = '') => out.push(`${pass ? 'PASS' : 'FAIL'} ${name}${note ? ' :: ' + note : ''}`)
const step = async (name, fn) => { try { await fn() } catch (e) { ok(name, false, e.message.split('\n')[0].slice(0, 170)) } }
const toast = async (p) => { await p.waitForTimeout(500); const all = await p.locator('[data-sonner-toast]').allInnerTexts(); return all[0] ?? '(no toast)' }
export async function runMoney(chromium, B, pw) {
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const errors = []
  const fresh = async () => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
    const page = await ctx.newPage()
    page.on('pageerror', (e) => errors.push(page.url().replace(B, '') + ' :: ' + e.message.slice(0, 120)))
    return page
  }
  const signIn = async (p, user) => {
    await p.goto(B + '/entrar'); await p.fill('input[name=username]', user); await p.fill('input[name=password]', pw)
    await p.click('button[type=submit]'); await p.waitForURL((u) => !u.pathname.startsWith('/entrar'), { timeout: 8000 })
  }
  const rec = await fresh(); let orderUrl = ''
  await step('order wizard', async () => {
    await signIn(rec, 'recepcion')
    await rec.goto(B + '/ordenes/nueva'); await rec.waitForURL(/d=/, { timeout: 8000 })
    await rec.fill('form[role=search] input', 'Uno'); await rec.click('form[role=search] button[type=submit]')
    await rec.getByRole('button', { name: 'Elegir' }).first().click(); await rec.waitForTimeout(900)
    await rec.getByRole('button', { name: /siguiente/i }).click(); await rec.waitForTimeout(900)
    const selects = rec.locator('main select')
    const n = await selects.count()
    for (let i = 0; i < n; i += 1) {
      const options = await selects.nth(i).locator('option').allInnerTexts()
      const label = await selects.nth(i).evaluate((el) => el.closest('label')?.innerText ?? '')
      if (/costo|Examen|Columna/i.test(label)) await selects.nth(i).selectOption({ index: options.length > 1 ? 1 : 0 })
    }
    await rec.getByRole('button', { name: /^agregar/i }).first().click(); await rec.waitForTimeout(900)
    const confirm = rec.locator('dialog[open] button').last()
    if (await confirm.count()) {
      const box = rec.locator('dialog[open] textarea, dialog[open] input')
      if (await box.count()) await box.first().fill('Prueba')
      await confirm.click(); await rec.waitForTimeout(700)
    }
    await rec.getByRole('button', { name: /siguiente/i }).click(); await rec.waitForTimeout(800)
    await rec.getByRole('button', { name: /siguiente/i }).click(); await rec.waitForTimeout(800)
    await rec.getByRole('button', { name: /^guardar/i }).first().click(); await rec.waitForTimeout(1500)
    const link = rec.locator('main a[href*="/ordenes/o-"]').first()
    orderUrl = await link.getAttribute('href')
    ok('order saved through the wizard', !!orderUrl, orderUrl)
  })
  await step('abono', async () => {
    const id = orderUrl.split('/').pop()
    await rec.goto(B + orderUrl); await rec.waitForTimeout(500)
    await rec.getByRole('link', { name: /agregar abono/i }).click(); await rec.waitForURL(/pagos\/abono/)
    await rec.waitForTimeout(400)
    const before = await rec.locator('main dl').innerText()
    await rec.getByLabel('Monto').fill('1,00'); await rec.getByRole('button', { name: /registrar abono/i }).click()
    const t = await toast(rec); ok('abono records and toasts', /Abono registrado/.test(t), t)
    const after = await rec.locator('main dl').innerText()
    ok('screen shows the new Abono and Resta', before !== after)
    await rec.getByLabel('Monto').fill('999999'); await rec.getByRole('button', { name: /registrar abono/i }).click(); await rec.waitForTimeout(600)
    ok('overpayment is refused inline', (await rec.locator('form [role=alert]').count()) > 0)
  })
  await step('reverse', async () => {
    await rec.goto(B + '/pagos/registro'); await rec.waitForTimeout(500)
    const rows = await rec.locator('table tbody tr').count(); ok('registry lists the payment', rows >= 1, rows + ' rows')
    await rec.getByRole('button', { name: 'Reversar' }).first().click(); await rec.waitForTimeout(300)
    const dlg = rec.locator('dialog[open]')
    ok('reversal asks for a motivo', (await dlg.locator('textarea, input').count()) > 0)
    await dlg.locator('textarea, input').first().fill('Error de prueba')
    await dlg.locator('button').last().click()
    const t = await toast(rec); ok('reversal done', /reversado/i.test(t), t)
    await rec.waitForTimeout(500)
    const text = await rec.locator('table').first().innerText()
    ok('original and reversal both listed', /Reversado/.test(text) && /Reverso/.test(text))
  })
  await step('close own drawer', async () => {
    await rec.goto(B + orderUrl.replace(/.*/, '/pagos/abono?o=' + orderUrl.split('/').pop())); await rec.waitForTimeout(400)
    await rec.getByLabel('Monto').fill('1,00'); await rec.getByRole('button', { name: /registrar abono/i }).click(); await toast(rec)
    await rec.getByRole('banner').waitFor(); await rec.goto(B + '/pagos/cierre'); await rec.waitForTimeout(500)
    await rec.getByRole('button', { name: 'Cerrar caja' }).click()
    const t = await toast(rec); ok('own close has no gesture and keeps payments', /cerrada/i.test(t), t)
    await rec.goto(B + '/pagos/registro'); await rec.waitForTimeout(400)
    ok('payments remain after the close', (await rec.locator('table tbody tr').count()) >= 3)
    await rec.goto(B + '/pagos/cierre-mensual'); await rec.waitForTimeout(400)
    ok('Recepción cannot reach Cierre mensual', (await rec.locator('main').innerText()).includes('bloqueado') || (await rec.locator('main').innerText()).includes('BLOQUEADO'))
  })
  await step('second payment then admin close', async () => {
    await rec.goto(B + '/pagos/abono?o=' + orderUrl.split('/').pop()); await rec.waitForTimeout(400)
    await rec.getByLabel('Monto').fill('1,00'); await rec.getByRole('button', { name: /registrar abono/i }).click(); await toast(rec)
    const adm = await fresh(); await signIn(adm, 'administracion')
    await adm.goto(B + '/pagos/cierre'); await adm.waitForTimeout(500)
    const options = await adm.locator('select option').allInnerTexts(); ok('Administración sees open drawers', options.some((o) => /Recepci/.test(o)), options.join(' | '))
    const value = await adm.locator('select option', { hasText: /Recepci/ }).first().getAttribute('value')
    await adm.locator('select').first().selectOption(value); await adm.waitForURL(/usuario=/); await adm.waitForTimeout(500)
    await adm.getByRole('button', { name: 'Cerrar caja' }).click(); await adm.waitForTimeout(300)
    let dlg = adm.locator('dialog[open]')
    await dlg.locator('textarea, input').first().fill('Ausente al cierre'); await dlg.locator('button').last().click(); await adm.waitForTimeout(700)
    const pass = adm.locator('dialog[open] input[type=password]')
    ok("another's drawer asks for the password", (await pass.count()) > 0)
    await pass.fill(pw); await pass.press('Enter')
    const t = await toast(adm); ok("another's drawer closes", /cerrada/i.test(t), t)
    await adm.waitForTimeout(500); await adm.getByRole('button', { name: 'Reabrir' }).first().click(); await adm.waitForTimeout(300)
    dlg = adm.locator('dialog[open]'); await dlg.locator('textarea, input').first().fill('Faltó un pago'); await dlg.locator('button').last().click()
    const t2 = await toast(adm); ok('reopen works', /reabierto/i.test(t2), t2)
    await adm.goto(B + '/pagos/cierre-mensual'); await adm.waitForTimeout(400)
    await adm.getByRole('button', { name: 'Cerrar mes' }).click(); await adm.waitForTimeout(500)
    const p2 = adm.locator('dialog[open] input[type=password]')
    if (await p2.count()) { await p2.fill(pw); await p2.press('Enter') }
    const t3 = await toast(adm); ok('month closes', /cerrado/i.test(t3), t3)
    await adm.goto(B + '/p/cobros-cashea'); await adm.waitForTimeout(300)
    ok('Cobros Cashea invents no columns', (await adm.locator('main').innerText()).includes('no están capturadas'))
  })
  await browser.close()
  return { results: out, errors: [...new Set(errors)] }
}
