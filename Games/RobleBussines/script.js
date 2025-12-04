const el = {
  start: document.getElementById('start'),
  btnPlay: document.getElementById('btnPlay'),
  topbar: document.getElementById('topbar'),
  game: document.getElementById('game'),
  footer: document.getElementById('footer'),
  money: document.getElementById('money'),
  gold: document.getElementById('gold'),
  rate: document.getElementById('rate'),
  btnClick: document.getElementById('btnClick'),
  clickValue: document.getElementById('clickValue'),
  businessList: document.getElementById('businessList'),
  btnDaily: document.getElementById('btnDaily'),
  dailyModal: document.getElementById('dailyModal'),
  dailyGrid: document.getElementById('dailyGrid'),
  btnClaimDaily: document.getElementById('btnClaimDaily'),
  btnCloseDaily: document.getElementById('btnCloseDaily'),
  btnSettings: document.getElementById('btnSettings'),
  settingsModal: document.getElementById('settingsModal'),
  musicVol: document.getElementById('musicVol'),
  sfxVol: document.getElementById('sfxVol'),
  btnCloseSettings: document.getElementById('btnCloseSettings'),
  btnSkip: document.getElementById('btnSkip'),
  skipModal: document.getElementById('skipModal'),
  skipText: document.getElementById('skipText'),
  btnConfirmSkip: document.getElementById('btnConfirmSkip'),
  btnCloseSkip: document.getElementById('btnCloseSkip'),
  btnManual: document.getElementById('btnManual'),
  manualModal: document.getElementById('manualModal'),
  manualInfo: document.getElementById('manualInfo'),
  btnBuyManual: document.getElementById('btnBuyManual'),
  btnCloseManual: document.getElementById('btnCloseManual'),
  offlineModal: document.getElementById('offlineModal'),
  offlineText: document.getElementById('offlineText'),
  btnCloseOffline: document.getElementById('btnCloseOffline'),
  music: document.getElementById('music'),
  sfxClick: document.getElementById('sfxClick'),
  sfxBuy: document.getElementById('sfxBuy'),
  sfxError: document.getElementById('sfxError'),
}

const keyPrefix = 'RobleBussines_'
const keyState = keyPrefix + 'state'
function setKV(k, v) { try { localStorage.setItem(keyPrefix + k, String(v)) } catch {} }
function getKV(k) { try { return localStorage.getItem(keyPrefix + k) } catch { return null } }
const base = {
  money: 10000,
  gold: 0,
  clickValue: 50,
  daily: { currentDay: 1, lastClaimDate: null },
  volumes: { music: 0.7, sfx: 0.9 },
  businesses: [
    { id: 'heladeria', name: 'Heladería', icon: 'assets/negocios/heladeria.png', baseCost: 10000, baseRate: 20, owned: 0 },
    { id: 'pizzeria', name: 'Pizzería', icon: 'assets/negocios/pizzeria.png', baseCost: 100000, baseRate: 120, owned: 0 },
    { id: 'lavadero', name: 'Lavadero de autos', icon: 'assets/negocios/lavadero_autos.png', baseCost: 500000, baseRate: 700, owned: 0 },
    { id: 'taller', name: 'Taller mecánico', icon: 'assets/negocios/taller_mecanico.png', baseCost: 2000000, baseRate: 3200, owned: 0 },
    { id: 'cine', name: 'Cine', icon: 'assets/negocios/cine.png', baseCost: 10000000, baseRate: 15000, owned: 0 },
    { id: 'super', name: 'Supermercado', icon: 'assets/negocios/supermercado.png', baseCost: 50000000, baseRate: 80000, owned: 0 },
    { id: 'banco', name: 'Banco', icon: 'assets/negocios/banco.png', baseCost: 300000000, baseRate: 450000, owned: 0 },
    { id: 'edificio', name: 'Edificio', icon: 'assets/negocios/edificio.png', baseCost: 2000000000, baseRate: 2800000, owned: 0 },
    { id: 'equipo', name: 'Equipo de fútbol', icon: 'assets/negocios/equipo_futbol.png', baseCost: 20000000000, baseRate: 30000000, owned: 0 },
    { id: 'espacio', name: 'Estación espacial', icon: 'assets/negocios/estacion_espacial.png', baseCost: 200000000000, baseRate: 350000000, owned: 0 },
  ],
  lastSeen: Date.now(),
  clickUpgLevel: 0,
  skipCost: 1,
  started: false,
  playTimeSec: 0,
  playRewards: {},
  bizMilestones: {},
}

let state = load() || base
mergeDefaults()
let offline = { seconds: 0, gain: 0 }

function fmt(n) {
  let v = Number(n) || 0
  const abs = Math.abs(v)
  if (abs < 1_000_000) return Math.floor(v).toLocaleString('es-UY')
  const units = ['K','M','B','T']
  let u = -1
  while (Math.abs(v) >= 1000 && u < units.length-1) { v /= 1000; u++ }
  return `${v.toFixed(2)}${units[u]}`
}

function todayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth()+1).padStart(2,'0')
  const day = String(d.getDate()).padStart(2,'0')
  return `${y}-${m}-${day}`
}

function ratePerSec() {
  return state.businesses.reduce((a,b)=>a + b.owned*b.baseRate, 0)
}

function nextCost(biz) {
  return Math.floor(biz.baseCost * Math.pow(1.15, biz.owned))
}

function setHidden(elm, hidden) {
  elm.setAttribute('aria-hidden', hidden? 'true':'false')
}

function renderBalances() {
  el.money.textContent = `$${fmt(state.money)}`
  el.gold.textContent = `${fmt(state.gold)}`
  el.rate.textContent = `$${fmt(ratePerSec())}`
  renderBusinesses()
}

function renderBusinesses() {
  el.businessList.innerHTML = ''
  state.businesses.forEach((biz, i)=>{
    const card = document.createElement('div')
    const cost = nextCost(biz)
    let cls = 'card'
    if (biz.owned===0 && i>0) cls += ' locked'
    else if (state.money < cost) cls += ' unaffordable'
    else cls += ' affordable'
    card.className = cls
    const icon = document.createElement('div')
    icon.className = 'icon'
    const img = document.createElement('img')
    img.src = biz.icon
    img.alt = biz.name
    icon.appendChild(img)
    const info = document.createElement('div')
    info.className = 'info'
    const name = document.createElement('div')
    name.className = 'name'
    name.textContent = biz.name
    const line1 = document.createElement('div')
    line1.className = 'line'
    line1.textContent = `Propiedad: ${biz.owned}`
    const line2 = document.createElement('div')
    line2.className = 'line'
    line2.textContent = `Produce: $${fmt(biz.baseRate)} / s cada uno`
    info.appendChild(name)
    info.appendChild(line1)
    info.appendChild(line2)
    const buy = document.createElement('div')
    buy.className = 'buy'
    const price = document.createElement('div')
    price.textContent = `$${fmt(nextCost(biz))}`
    const btn = document.createElement('button')
    btn.className = 'btn primary'
    btn.textContent = 'Comprar'
    btn.addEventListener('click', ()=>purchase(i))
    buy.appendChild(price)
    buy.appendChild(btn)
    card.appendChild(icon)
    card.appendChild(info)
    card.appendChild(buy)
    el.businessList.appendChild(card)
  })
}

function spawnFloat(x,y,text) {
  const f = document.createElement('div')
  f.className = 'float'
  f.textContent = text
  const hero = el.game.querySelector('.hero')
  const rect = hero.getBoundingClientRect()
  f.style.left = `${x - rect.left}px`
  f.style.top = `${y - rect.top}px`
  hero.appendChild(f)
  setTimeout(()=>{ f.remove() }, 900)
}

function clickMoney(e) {
  state.money += state.clickValue
  el.clickValue.textContent = `+${fmt(state.clickValue)}`
  playSfx(el.sfxClick)
  renderBalances()
  save()
  el.btnClick.classList.add('pulse')
  setTimeout(()=>{ el.btnClick.classList.remove('pulse') }, 220)
  if (e) {
    spawnFloat(e.clientX, e.clientY, `+${fmt(state.clickValue)}`)
  }
}

function purchase(idx) {
  const biz = state.businesses[idx]
  const cost = nextCost(biz)
  if (state.money < cost) { playSfx(el.sfxError); return }
  state.money -= cost
  biz.owned += 1
  checkBizMilestones(biz)
  renderBalances()
  renderBusinesses()
  playSfx(el.sfxBuy)
  if (biz.owned === 1) { state.gold += 10; renderBalances(); notify(`Primera ${biz.name}: +10 oro`,'success') }
  save()
}

function tick() {
  const r = ratePerSec()
  state.money += r
  renderBalances()
  state.lastSeen = Date.now()
  if (state.started) {
    state.playTimeSec += 1
    checkPlaytimeRewards()
  }
  save()
}

function buildDailyGrid() {
  el.dailyGrid.innerHTML = ''
  for (let d=1; d<=31; d++) {
    const div = document.createElement('div')
    div.className = 'day'
    if (d < state.daily.currentDay) div.classList.add('claimed')
    if (d === state.daily.currentDay) div.classList.add('active')
    if (d > state.daily.currentDay) div.classList.add('locked')
    div.innerHTML = `<div>Día ${d}</div><strong>${fmt(d*5)} oro</strong>`
    el.dailyGrid.appendChild(div)
  }
  const canClaim = state.daily.lastClaimDate !== todayStr()
  el.btnClaimDaily.disabled = !canClaim
}

function claimDaily() {
  if (state.daily.lastClaimDate === todayStr()) { playSfx(el.sfxError); return }
  const d = state.daily.currentDay
  const reward = d*5
  state.gold += reward
  state.daily.lastClaimDate = todayStr()
  state.daily.currentDay = d===31? 1 : d+1
  playSfx(el.sfxBuy)
  renderBalances()
  buildDailyGrid()
  notify(`Recompensa diaria: +${reward} oro`,'success')
  save()
}

function openModal(m) { m.setAttribute('aria-hidden','false') }
function closeModal(m) { m.setAttribute('aria-hidden','true') }

function openSkip() {
  const r = ratePerSec()
  const gain = r*3600
  el.skipText.textContent = `Ganarás $${fmt(gain)} por adelantar 1 hora. Costo: ${state.skipCost} oro.`
  openModal(el.skipModal)
}

function confirmSkip() {
  const r = ratePerSec()
  const gain = r*3600
  if (state.gold < state.skipCost) { playSfx(el.sfxError); return }
  state.gold -= state.skipCost
  state.skipCost += 1
  state.money += gain
  renderBalances()
  playSfx(el.sfxBuy)
  notify(`Adelantaste 1 hora: +$${fmt(gain)}`,'success')
  save()
  closeModal(el.skipModal)
}

function playSfx(a) {
  a.volume = state.volumes.sfx
  a.currentTime = 0
  a.play().catch(()=>{})
}

function applyVolumes() {
  el.music.volume = state.volumes.music
}

function save() {
  try {
    state.lastSeen = Date.now()
    setKV('money', state.money)
    setKV('gold', state.gold)
    setKV('clickValue', state.clickValue)
    setKV('clickUpgLevel', state.clickUpgLevel)
    setKV('skipCost', state.skipCost)
    setKV('daily_currentDay', state.daily.currentDay)
    setKV('daily_lastClaimDate', state.daily.lastClaimDate || '')
    setKV('volumes_music', state.volumes.music)
    setKV('volumes_sfx', state.volumes.sfx)
    setKV('lastSeen', state.lastSeen)
    setKV('playTimeSec', state.playTimeSec)
    localStorage.setItem(keyPrefix+'playRewards', JSON.stringify(state.playRewards))
    localStorage.setItem(keyPrefix+'bizMilestones', JSON.stringify(state.bizMilestones))
    state.businesses.forEach(b=> setKV(b.id, b.owned))
  } catch {}
}

function load() {
  try {
    // Prefer multi-key
    const hasMulti = getKV('money') !== null || getKV('gold') !== null
    if (hasMulti) {
      const s = JSON.parse(JSON.stringify(base))
      s.money = Number(getKV('money') ?? s.money)
      s.gold = Number(getKV('gold') ?? s.gold)
      s.clickValue = Number(getKV('clickValue') ?? s.clickValue)
      s.clickUpgLevel = Number(getKV('clickUpgLevel') ?? 0)
      s.skipCost = Number(getKV('skipCost') ?? 1)
      s.daily.currentDay = Number(getKV('daily_currentDay') ?? s.daily.currentDay)
      s.daily.lastClaimDate = getKV('daily_lastClaimDate') || null
      s.volumes.music = Number(getKV('volumes_music') ?? s.volumes.music)
      s.volumes.sfx = Number(getKV('volumes_sfx') ?? s.volumes.sfx)
      s.lastSeen = Number(getKV('lastSeen') ?? Date.now())
      s.playTimeSec = Number(getKV('playTimeSec') ?? 0)
      try { const pr = localStorage.getItem(keyPrefix+'playRewards'); s.playRewards = pr? JSON.parse(pr): {} } catch { s.playRewards = {} }
      try { const bm = localStorage.getItem(keyPrefix+'bizMilestones'); s.bizMilestones = bm? JSON.parse(bm): {} } catch { s.bizMilestones = {} }
      s.businesses = base.businesses.map(b=> ({...b, owned: Number(getKV(b.id) ?? 0)}))
      return s
    }
    // Migrate from single-key state or legacy
    const single = localStorage.getItem(keyState)
    const legacy = localStorage.getItem('roble_business_v1')
    const raw = single || legacy
    if (raw) {
      const parsed = JSON.parse(raw)
      Object.assign(base, parsed)
      state = base
      save()
      return state
    }
    return null
  } catch { return null }
}

function mergeDefaults() {
  const d = base
  state.money = Number(state.money ?? d.money)
  state.gold = Number(state.gold ?? d.gold)
  state.clickValue = Number(state.clickValue ?? d.clickValue)
  state.daily = state.daily ?? { currentDay: 1, lastClaimDate: null }
  state.volumes = state.volumes ?? { music: 0.7, sfx: 0.9 }
  state.businesses = state.businesses ?? d.businesses
  state.lastSeen = Number(state.lastSeen ?? Date.now())
  state.clickUpgLevel = Number(state.clickUpgLevel ?? 0)
  state.skipCost = Number(state.skipCost ?? 1)
  state.started = Boolean(state.started ?? false)
  state.playTimeSec = Number(state.playTimeSec ?? 0)
  state.playRewards = state.playRewards ?? {}
  state.bizMilestones = state.bizMilestones ?? {}
}

function startGame() {
  setHidden(el.start,true)
  el.music.currentTime = 0
  el.music.loop = true
  applyVolumes()
  el.music.play().catch(()=>{})
  state.started = true
  if (offline.gain > 0) {
    state.money += offline.gain
    renderBalances()
    el.offlineText.textContent = `Estuviste fuera ${Math.floor(offline.seconds/3600)}h ${Math.floor((offline.seconds%3600)/60)}m y ganaste $${fmt(offline.gain)}.`
    openModal(el.offlineModal)
  }
}

function init() {
  el.musicVol.value = state.volumes.music
  el.sfxVol.value = state.volumes.sfx
  renderBalances()
  renderBusinesses()
  buildDailyGrid()
  el.btnPlay.addEventListener('click', startGame)
  el.btnClick.addEventListener('click', (e)=>clickMoney(e))
  el.btnDaily.addEventListener('click', ()=>{ buildDailyGrid(); openModal(el.dailyModal) })
  el.btnCloseDaily.addEventListener('click', ()=>closeModal(el.dailyModal))
  el.btnClaimDaily.addEventListener('click', claimDaily)
  el.btnSettings.addEventListener('click', ()=>openModal(el.settingsModal))
  el.btnCloseSettings.addEventListener('click', ()=>closeModal(el.settingsModal))
  el.musicVol.addEventListener('input', (e)=>{ state.volumes.music = parseFloat(e.target.value); applyVolumes(); save() })
  el.sfxVol.addEventListener('input', (e)=>{ state.volumes.sfx = parseFloat(e.target.value); save() })
  el.btnSkip.addEventListener('click', openSkip)
  el.btnCloseSkip.addEventListener('click', ()=>closeModal(el.skipModal))
  el.btnConfirmSkip.addEventListener('click', confirmSkip)
  el.btnCloseOffline.addEventListener('click', ()=>closeModal(el.offlineModal))
  el.btnManual.addEventListener('click', ()=>{ renderManualInfo(); openModal(el.manualModal) })
  el.btnCloseManual.addEventListener('click', ()=>closeModal(el.manualModal))
  el.btnBuyManual.addEventListener('click', buyManual)
  const now = Date.now()
  const last = state.lastSeen || now
  offline.seconds = Math.max(0, Math.floor((now - last)/1000))
  offline.gain = ratePerSec() * offline.seconds
  document.addEventListener('visibilitychange', ()=>{ if (document.hidden) save() })
  setInterval(tick, 1000)
}

function manualCost() {
  const lvl = Number(state.clickUpgLevel || 0)
  return Math.floor(50000 * Math.pow(1.8, lvl))
}

function renderManualInfo() {
  el.manualInfo.textContent = `Producción por click: +${fmt(state.clickValue)} | Próxima mejora: +${fmt(50)} | Costo: $${fmt(manualCost())}`
}

function buyManual() {
  const cost = manualCost()
  if (state.money < cost) { playSfx(el.sfxError); return }
  state.money -= cost
  state.clickUpgLevel += 1
  state.clickValue += 50
  renderBalances()
  renderManualInfo()
  playSfx(el.sfxBuy)
  notify(`Mejoraste el click a +${fmt(state.clickValue)}`,'success')
  save()
}

function notify(text, type='success') {
  const box = document.getElementById('toasts')
  const t = document.createElement('div')
  t.className = 'toast ' + type
  t.textContent = text
  box.appendChild(t)
  setTimeout(()=>{ t.remove() }, 2500)
}

function checkBizMilestones(biz) {
  if (!state.bizMilestones[biz.id]) state.bizMilestones[biz.id] = {}
  const owned = biz.owned
  const thresholds = [5,10,50,100]
  const rewards = [5,5,10,10]
  let gained = 0
  thresholds.forEach((th, i)=>{
    if (owned >= th && !state.bizMilestones[biz.id][th]) {
      state.bizMilestones[biz.id][th] = true
      gained += rewards[i]
      notify(`Logro ${biz.name}: ${th} unidades (+${rewards[i]} oro)`, 'success')
    }
  })
  if (gained>0) { state.gold += gained; renderBalances() }
}

function checkPlaytimeRewards() {
  const m = state.playRewards
  const s = state.playTimeSec
  const grant = (key, gold, label) => { if (!m[key] && s >= key) { m[key] = true; state.gold += gold; notify(`Recompensa por tiempo: ${label} (+${gold} oro)`, 'success'); renderBalances(); save() } }
  grant(900, 1, '15 min')
  grant(3600, 3, '1 hora')
  grant(10800, 10, '3 horas')
}

init()
