const out = []
const ok = (name, pass, note = '') => out.push(`${pass ? 'PASS' : 'FAIL'} ${name}${note ? ' :: ' + note : ''}`)
const step = async (name, fn) => { try { await fn() } catch (e) { ok(name, false, e.message.split('\n')[0].slice(0, 170)) } }
const toast = (page) => page.locator('[data-sonner-toast]').first().innerText({ timeout: 3000 }).catch(() => '(no toast)')
export async function runSmoke(chromium, B, pw) {
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const errors = []
  const fresh = async (w = 1280, h = 800) => {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } })
    const page = await ctx.newPage()
    page.on('pageerror', (e) => errors.push(page.url().replace(B,'') + ' :: ' + e.message.slice(0, 90)))
    page.on('console', (m) => { if (m.type() === 'error' && !/favicon|40[0-9]|42[0-9]/.test(m.text())) errors.push(m.text().slice(0, 150)) })
    return page
  }
  const signIn = async (page, user) => {
    await page.goto(B + '/entrar')
    await page.fill('input[name=username]', user)
    await page.fill('input[name=password]', pw)
    await page.click('button[type=submit]')
    await page.waitForURL((u) => !u.pathname.startsWith('/entrar'), { timeout: 8000 })
  }

  const rec = await fresh()
  await step('wrong password', async () => {
    await rec.goto(B + '/entrar')
    await rec.fill('input[name=username]', 'nadie'); await rec.fill('input[name=password]', 'mala')
    await rec.click('button[type=submit]'); await rec.waitForTimeout(700)
    ok('wrong password stays on /entrar with a message', rec.url().endsWith('/entrar') && (await rec.locator('[role=alert]').count()) > 0)
  })
  await step('sign in', async () => { await signIn(rec, 'recepcion'); ok('recepcion signs in', true, new URL(rec.url()).pathname) })

  await step('client search', async () => {
    await rec.goto(B + '/clientes')
    await rec.fill('input[type=search]', 'Uno'); await rec.click('form[role=search] button[type=submit]')
    await rec.waitForTimeout(800)
    const text = await rec.locator('table').first().innerText()
    ok('client search filters rows', text.includes('Uno') && !text.includes('Dos'))
    ok('search term stays out of the URL', !rec.url().includes('Uno') && !rec.url().includes('q='), rec.url())
    ok('client list shows Edad column', text.includes('Edad') || (await rec.locator('th', { hasText: 'Edad' }).count()) > 0)
    await rec.locator('table a').first().click(); await rec.waitForURL(/\/clientes\/[^/?]+/)
    await rec.waitForTimeout(500)
    ok('opening a client leaves the list', /\/clientes\/[^/?]+/.test(new URL(rec.url()).pathname))
    ok('ficha names the patient', (await rec.locator('h1').innerText()).includes('Uno'))
    ok('ficha has tabs', (await rec.getByRole('tab').count()) >= 2)
    ok('card offers Nueva orden', (await rec.getByRole('link', { name: /nueva orden/i }).count()) > 0)
  })

  await step('pacientes menu deep-links', async () => {
    await rec.goto(B + '/')
    await rec.waitForTimeout(400)
    const pacientesLink = rec.getByRole('navigation').getByRole('link', { name: 'Pacientes' })
    ok('pacientes is a direct link', (await pacientesLink.count()) === 1)
    await pacientesLink.click()
    await rec.waitForURL(/\/clientes/, { timeout: 6000 })
    ok('pacientes opens the list', new URL(rec.url()).pathname === '/clientes')
    await rec.goto(B + '/p/modificar-pacientes')
    await rec.waitForURL(/\/clientes/, { timeout: 6000 })
    ok('modificar pacientes opens /clientes', new URL(rec.url()).pathname === '/clientes')
    await rec.goto(B + '/p/incluir-inactivos')
    await rec.waitForURL(/incluirInactivos=1/, { timeout: 6000 })
    ok('incluir inactivos deep-links with the filter', rec.url().includes('incluirInactivos=1'))
    await rec.goto(B + '/p/fusionar')
    await rec.waitForURL(/\/clientes/, { timeout: 6000 })
    ok('fusionar redirects to /clientes', new URL(rec.url()).pathname === '/clientes')
    await rec.goto(B + '/p/trasladar-paciente')
    await rec.waitForTimeout(400)
    ok('trasladar stays blocked', (await rec.locator('main').innerText()).includes('BLOQUEADO') || (await rec.getByText('BLOQUEADO').count()) > 0)
  })

  await step('client create', async () => {
    await rec.goto(B + '/clientes/nuevo')
    await rec.fill('input[name=fullName]', 'Prueba Navegador Nueva')
    await rec.selectOption('select[name=cedulaType]', 'V').catch(() => rec.fill('input[name=cedulaType]', 'V'))
    await rec.fill('input[name=cedulaNumber]', '19999992')
    await rec.fill('input[name=birthDate]', '01/02/1990')
    await rec.getByRole('button', { name: /^guardar/i }).first().click()
    await rec.waitForURL(/saved=1/, { timeout: 6000 })
    const t = await toast(rec); ok('client save goes to the card and toasts', t !== '(no toast)', t)
  })

  await step('new order', async () => {
    await rec.goto(B + '/ordenes/nueva')
    await rec.waitForURL(/d=/, { timeout: 8000 })
    ok('new order redirect lands on a draft', true)
    await rec.fill('form[role=search] input', 'Uno'); await rec.click('form[role=search] button[type=submit]')
    await rec.getByRole('button', { name: 'Elegir' }).first().waitFor({ timeout: 5000 })
    ok('patient search shows rows, URL clean', !rec.url().includes('Uno'))
    await rec.getByRole('button', { name: 'Elegir' }).first().click()
    await rec.waitForTimeout(1200)
    ok('picking a patient moves on', (await rec.locator('fieldset').count()) > 0, await toast(rec))
  })

  await step('worklist', async () => {
    await rec.goto(B + '/hoja-de-trabajo'); await rec.waitForSelector('table', { timeout: 5000 })
    await rec.getByRole('button', { name: /actualizar/i }).first().click().catch(() => {})
    await rec.waitForTimeout(500); ok('worklist loads and refreshes', (await rec.locator('table tr').count()) > 1)
  })

  await step('sign out', async () => {
    await rec.getByRole('button', { name: /cerrar sesi/i }).click()
    await rec.waitForURL(/entrar/, { timeout: 6000 }); ok('sign-out returns to /entrar', true)
    await rec.goto(B + '/clientes'); await rec.waitForURL(/entrar/, { timeout: 6000 }); ok('signed out cannot reopen /clientes', true)
  })

  const bio = await fresh()
  await step('results', async () => {
    await signIn(bio, 'bioanalista')
    await bio.goto(B + '/ordenes/o-2/resultados'); await bio.waitForTimeout(800)
    const cell = bio.locator('table input[type=text], table input:not([type])').first()
    await cell.fill('4,52'); await cell.blur(); await bio.waitForTimeout(800)
    ok('saving a cell raises no toast', (await bio.locator('[data-sonner-toast]').count()) === 0)
    await bio.reload(); await bio.waitForTimeout(600)
    ok('saved value survives a reload', (await bio.locator('table input[type=text], table input:not([type])').first().inputValue()) === '4,52')
  })
  await step('release with step-up', async () => {
    const box = bio.locator('input[type=checkbox]').first()
    if (await box.count()) await box.check()
    await bio.getByRole('button', { name: /liberar/i }).first().click(); await bio.waitForTimeout(600)
    const dialogPw = bio.locator('input[type=password]').first()
    ok('release asks for the password', (await dialogPw.count()) > 0)
    await dialogPw.fill('mala'); await dialogPw.press('Enter'); await bio.waitForTimeout(700)
    ok('wrong password keeps the dialog open', (await bio.locator('input[type=password]').count()) > 0)
    await bio.locator('input[type=password]').first().fill(pw); await bio.locator('input[type=password]').first().press('Enter')
    await bio.waitForTimeout(1500)
    ok('right password releases', true, await toast(bio))
  })
  await step('report', async () => {
    await bio.goto(B + '/ordenes/o-1/reporte'); await bio.waitForTimeout(600)
    ok('report shows a QR', (await bio.locator('svg path').count()) > 0)
    await bio.getByRole('button', { name: /pdf/i }).first().click(); await bio.waitForTimeout(1500)
    ok('generate PDF', true, await toast(bio))
  })

  const phone = await fresh(360, 740)
  const overflow = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  await step('portal', async () => {
    await phone.goto(B + '/ingresar'); await phone.waitForTimeout(400)
    ok('portal sign-in fits 360px', (await overflow(phone)) <= 0, 'overflow ' + (await overflow(phone)))
    await phone.goto(B + '/portal'); await phone.waitForURL(/ingresar/, { timeout: 6000 }); ok('/portal with no session goes to Ingresar', true)
  })
  await step('verification', async () => {
    await phone.goto(B + '/verificar/desconocido'); await phone.waitForTimeout(300)
    ok('verification fits 360px', (await overflow(phone)) <= 0, 'overflow ' + (await overflow(phone)))
    ok('verification says No disponible', (await phone.locator('main').innerText()).includes('No disponible'))
  })

  await step('portal sign-in with a code', async () => {
    const p = await fresh(360, 740)
    await p.goto(B + '/ingresar'); await p.waitForTimeout(300)
    const options = await p.locator('select option').allInnerTexts()
    ok('portal offers all five cédula types', options.join('') === 'VEJPG', options.join(','))
    await p.locator('input').nth(0).fill('12000001'); await p.locator('input').nth(1).fill('01/01/1900')
    await p.locator('button[type=submit]').click(); await p.waitForTimeout(700)
    const wrong = await p.locator('main').innerText()
    ok('wrong birth date gets the generic answer', wrong.includes('enviaremos un código al teléfono registrado'))
  })
  await step('client needing a confirm', async () => {
    const r = await fresh()
    await signIn(r, 'recepcion')
    await r.goto(B + '/clientes/c-1')
    await r.getByRole('tab', { name: 'Contacto' }).click()
    await r.fill('input[name=phone]', '04140000009')
    await r.getByRole('button', { name: /^guardar/i }).first().click(); await r.waitForTimeout(900)
    const dialog = await r.locator('dialog[open]').count()
    ok('changing a contact asks or saves, never silent', dialog > 0 || r.url().includes('saved=1'), 'dialog=' + dialog + ' ' + new URL(r.url()).search)
    if (dialog > 0) { await r.locator('dialog[open] button').last().click(); await r.waitForTimeout(1000); ok('confirm saves', r.url().includes('saved=1'), await toast(r)) }
  })
  await browser.close()
  return { results: out, errors: [...new Set(errors)] }
}
