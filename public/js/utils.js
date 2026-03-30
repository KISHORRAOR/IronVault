// ── Token management ─────────────────────────────────────────
window.IV = {
  saveToken:    t  => sessionStorage.setItem('iv_token', t),
  saveRefresh:  t  => sessionStorage.setItem('iv_refresh', t),
  saveKey:      k  => sessionStorage.setItem('iv_key', k),
  getToken:     ()  => sessionStorage.getItem('iv_token'),
  getRefresh:   ()  => sessionStorage.getItem('iv_refresh'),
  getKey:       ()  => sessionStorage.getItem('iv_key'),
  clear:        ()  => { sessionStorage.removeItem('iv_token'); sessionStorage.removeItem('iv_refresh'); sessionStorage.removeItem('iv_key'); },
  isAuth:       ()  => !!sessionStorage.getItem('iv_token')
}

// ── Toast ─────────────────────────────────────────────────────
function toast(msg, type = 'success') {
  const el = document.getElementById('toast')
  if (!el) return
  el.textContent = msg
  el.className = 'toast ' + type
  el.style.display = 'block'
  clearTimeout(el._t)
  el._t = setTimeout(() => { el.style.display = 'none' }, 3500)
}

// ── Show/hide message divs ────────────────────────────────────
function showMsg(id, msg, type = 'error') {
  const el = document.getElementById(id)
  if (!el) return
  el.textContent = msg
  el.className = 'msg ' + type
  el.style.display = 'block'
}
function hideMsg(id) {
  const el = document.getElementById(id)
  if (el) el.style.display = 'none'
}

// ── Toggle eye ────────────────────────────────────────────────
function toggleEye(inputId, btn) {
  const el = document.getElementById(inputId)
  if (!el) return
  el.type = el.type === 'password' ? 'text' : 'password'
  btn.textContent = el.type === 'password' ? '👁' : '🙈'
}

// ── Password strength ─────────────────────────────────────────
function checkStrength(pw, barPrefix, labelId) {
  let s = 0
  if (pw.length >= 8)  s++
  if (pw.length >= 12) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[a-z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  ;[1,2,3,4].forEach(i => {
    const b = document.getElementById(barPrefix + i)
    if (b) b.className = 'bar'
  })
  const lbl = document.getElementById(labelId)
  if (!pw) { if (lbl) lbl.textContent = ''; return }
  if (s <= 2) {
    const b = document.getElementById(barPrefix + '1')
    if (b) b.classList.add('weak')
    if (lbl) lbl.textContent = 'Weak — add uppercase, numbers & symbols'
  } else if (s <= 4) {
    ;[1,2,3].forEach(i => { const b = document.getElementById(barPrefix + i); if (b) b.classList.add('medium') })
    if (lbl) lbl.textContent = 'Medium — try a longer phrase'
  } else {
    ;[1,2,3,4].forEach(i => { const b = document.getElementById(barPrefix + i); if (b) b.classList.add('strong') })
    if (lbl) lbl.textContent = '✓ Strong password'
  }
}

// ── Secure password generator ─────────────────────────────────
function generateSecurePassword() {
  const up = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lo = 'abcdefghijklmnopqrstuvwxyz'
  const nu = '0123456789'
  const sy = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  const all = up + lo + nu + sy
  const rand = arr => {
    let r; const a = new Uint32Array(1)
    do { crypto.getRandomValues(a); r = a[0] } while (r >= Math.floor(0xFFFFFFFF / arr.length) * arr.length)
    return arr[r % arr.length]
  }
  let p = rand(up) + rand(lo) + rand(nu) + rand(sy)
  for (let i = 4; i < 16; i++) p += rand(all)
  return p.split('').sort(() => { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % 2 ? 1 : -1 }).join('')
}

// ── Escape HTML ───────────────────────────────────────────────
function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

// ── Validate mobile ───────────────────────────────────────────
function validMobile(m) { return /^[6-9]\d{9}$/.test(m) }

// ── Auth guard ────────────────────────────────────────────────
function requireAuth() {
  if (!IV.isAuth()) { window.location.href = '/login.html'; return false }
  return true
}
