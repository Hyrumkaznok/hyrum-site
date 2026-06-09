// Nav scroll shadow
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

// Mobile hamburger
const hamburger = document.getElementById('hamburger');
const navMobile = document.getElementById('nav-mobile');
hamburger.addEventListener('click', () => {
  navMobile.classList.toggle('open');
});
navMobile.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navMobile.classList.remove('open'));
});

// Smooth scroll offset for fixed nav
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ── PAÍSES ──
const COUNTRIES = {
  BR: { code: '55',  mask: '(##) #####-####',  placeholder: '(41) 99999-9999' },
  US: { code: '1',   mask: '(###) ###-####',   placeholder: '(555) 123-4567' },
  CA: { code: '1',   mask: '(###) ###-####',   placeholder: '(416) 123-4567' },
  PT: { code: '351', mask: '### ### ###',      placeholder: '912 345 678' },
  DE: { code: '49',  mask: '#### #######',     placeholder: '1512 3456789' },
  GB: { code: '44',  mask: '#### ######',      placeholder: '7911 123456' },
  IT: { code: '39',  mask: '### #######',      placeholder: '312 3456789' },
  FR: { code: '33',  mask: '# ## ## ## ##',    placeholder: '6 12 34 56 78' },
  AU: { code: '61',  mask: '### ### ###',      placeholder: '412 345 678' },
  JP: { code: '81',  mask: '##-####-####',     placeholder: '90-1234-5678' },
  ES: { code: '34',  mask: '### ### ###',      placeholder: '612 345 678' },
};

function applyMask(digits, mask) {
  let result = '', di = 0;
  for (let mi = 0; mi < mask.length && di < digits.length; mi++) {
    result += mask[mi] === '#' ? digits[di++] : mask[mi];
  }
  return result;
}

function setupPhoneField() {
  const paisSelect = document.getElementById('pais');
  const phoneInput = document.getElementById('telefone');
  const prefixEl   = document.getElementById('phone-prefix');
  if (!paisSelect || !phoneInput) return;

  function update() {
    const country = COUNTRIES[paisSelect.value] || COUNTRIES.BR;
    prefixEl.textContent = '+' + country.code;
    phoneInput.placeholder = country.placeholder;
    phoneInput.value = '';
  }

  paisSelect.addEventListener('change', update);
  phoneInput.addEventListener('input', function () {
    const country = COUNTRIES[paisSelect.value] || COUNTRIES.BR;
    this.value = applyMask(this.value.replace(/\D/g, ''), country.mask);
  });
  update();
}
setupPhoneField();

// ── FORM SUBMIT ──
function handleSubmit(e) {
  e.preventDefault();
  const nome = document.getElementById('nome').value.trim();
  const paisSelect = document.getElementById('pais');
  const countryCode = (COUNTRIES[paisSelect?.value] || COUNTRIES.BR).code;
  const telefoneRaw = document.getElementById('telefone').value.replace(/\D/g, '');
  const telefone = '+' + countryCode + ' ' + document.getElementById('telefone').value.trim();
  const interesse = document.getElementById('interesse').value;
  const mensagem = document.getElementById('mensagem').value.trim();
  const interesseTexto = { imovel:'Imóvel', veiculo:'Veículo', ambos:'Imóvel e Veículo', duvida:'Tenho dúvidas ainda' }[interesse] || interesse;
  const texto = `Olá Hyrum! Me chamo *${nome}*.\nQuero saber mais sobre consórcio de: *${interesseTexto}*.\nMeu WhatsApp: ${telefone}${mensagem ? '\n\n' + mensagem : ''}`;
  document.getElementById('form').style.display = 'none';
  document.getElementById('form-success').style.display = 'block';
  setTimeout(() => {
    window.open(`https://wa.me/5541999457725?text=${encodeURIComponent(texto)}`, '_blank');
  }, 400);
}

// ── CÂMBIO ──
let globalRates = null;

async function updateCambio() {
  const CACHE_KEY = 'hk_cambio';
  const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;
  const FALLBACK = { USD: 1 / 5.70, EUR: 1 / 6.20 };
  let rates = null, fetchedAt = null;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const p = JSON.parse(cached);
      if (Date.now() - p.ts < CACHE_TTL) { rates = p.rates; fetchedAt = new Date(p.ts); }
    }
  } catch (_) {}

  if (!rates) {
    try {
      const res = await fetch('https://api.frankfurter.app/latest?from=BRL&to=USD,EUR');
      rates = (await res.json()).rates;
      fetchedAt = new Date();
      localStorage.setItem(CACHE_KEY, JSON.stringify({ rates, ts: fetchedAt.getTime() }));
    } catch (_) { rates = FALLBACK; }
  }

  globalRates = rates;

  document.querySelectorAll('[data-brl]').forEach(row => {
    const brl = parseFloat(row.dataset.brl);
    const usdCell = row.querySelector('[data-currency="usd"]');
    const eurCell = row.querySelector('[data-currency="eur"]');
    if (usdCell) usdCell.textContent = `US$ ${Math.round(brl * rates.USD)}/mês`;
    if (eurCell) eurCell.textContent = `€ ${Math.round(brl * rates.EUR)}/mês`;
  });

  const infoEl = document.getElementById('cambio-info');
  const dataEl = document.getElementById('cambio-data');
  if (infoEl) {
    infoEl.textContent = `US$ 1 = R$ ${(1/rates.USD).toFixed(2).replace('.',',')} · € 1 = R$ ${(1/rates.EUR).toFixed(2).replace('.',',')}`;
  }
  if (dataEl && fetchedAt) {
    dataEl.textContent = `Atualizado em ${fetchedAt.toLocaleDateString('pt-BR')}`;
  }

  updateSimulator();
}
updateCambio();

// ── SIMULADOR ──
function formatBRL(value) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function updateSimulator() {
  const slider = document.getElementById('sim-slider');
  if (!slider) return;
  const value = parseInt(slider.value);

  const parcRed  = value * 0.002615;
  const parcInt  = value * 0.005229;

  document.getElementById('sim-valor-display').textContent =
    'R$ ' + value.toLocaleString('pt-BR');
  document.getElementById('sim-parcela-red').innerHTML =
    `R$ ${formatBRL(parcRed)}<span>/mês</span>`;
  document.getElementById('sim-parcela-int').innerHTML =
    `R$ ${formatBRL(parcInt)}<span>/mês</span>`;

  if (globalRates) {
    const usd = Math.round(parcRed * globalRates.USD);
    const eur = Math.round(parcRed * globalRates.EUR);
    document.getElementById('sim-red-usd').textContent = `US$ ${usd}/mês`;
    document.getElementById('sim-red-eur').textContent = `€ ${eur}/mês`;
  }

  // Atualiza gradiente do slider
  const pct = ((value - 50000) / (600000 - 50000)) * 100;
  slider.style.background = `linear-gradient(to right, var(--accent) ${pct}%, var(--surface-2) ${pct}%)`;
}

const simSlider = document.getElementById('sim-slider');
if (simSlider) {
  simSlider.addEventListener('input', updateSimulator);
  updateSimulator();
}

// ── CONTADORES ANIMADOS ──
function animateCounter(el) {
  const target  = parseInt(el.dataset.target);
  const prefix  = el.dataset.prefix || '';
  const suffix  = el.dataset.suffix || '';
  const duration = 1200;
  const start   = performance.now();

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(target * ease);
    el.textContent = prefix + current + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.animated) {
      entry.target.dataset.animated = 'true';
      animateCounter(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-counter]').forEach(el => counterObserver.observe(el));

// ── FAQ ACCORDION ──
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    document.querySelectorAll('.faq-q').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      b.nextElementSibling.classList.remove('open');
    });
    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      btn.nextElementSibling.classList.add('open');
    }
  });
});

// ── SCROLL REVEAL ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.step-card, .tipo-card, .sobre-text, .sobre-visual, .dep-card, .ext-card, .faq-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  revealObserver.observe(el);
});
