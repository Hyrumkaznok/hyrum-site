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

// Close mobile nav on link click
navMobile.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navMobile.classList.remove('open'));
});

// Smooth scroll offset for fixed nav
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 72;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// Form submit — abre WhatsApp com mensagem montada
function handleSubmit(e) {
  e.preventDefault();
  const nome = document.getElementById('nome').value.trim();
  const paisSelect = document.getElementById('pais');
  const countryCode = (COUNTRIES[paisSelect?.value] || COUNTRIES.BR).code;
  const telefoneRaw = document.getElementById('telefone').value.replace(/\D/g, '');
  const telefone = '+' + countryCode + ' ' + document.getElementById('telefone').value.trim();
  const interesse = document.getElementById('interesse').value;
  const mensagem = document.getElementById('mensagem').value.trim();

  const interesseTexto = {
    imovel: 'Imóvel',
    veiculo: 'Veículo',
    ambos: 'Imóvel e Veículo',
    duvida: 'Tenho dúvidas ainda'
  }[interesse] || interesse;

  const texto = `Olá Hyrum! Me chamo *${nome}*.\nQuero saber mais sobre consórcio de: *${interesseTexto}*.\nMeu WhatsApp: ${telefone}${mensagem ? '\n\n' + mensagem : ''}`;

  // Mostra tela de sucesso
  document.getElementById('form').style.display = 'none';
  document.getElementById('form-success').style.display = 'block';

  // Abre WhatsApp após 400ms
  setTimeout(() => {
    const fullNumber = countryCode + telefoneRaw;
    const url = `https://wa.me/5541999457725?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  }, 400);
}

// Configuração de países — código, máscara e placeholder
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
  let result = '';
  let di = 0;
  for (let mi = 0; mi < mask.length && di < digits.length; mi++) {
    if (mask[mi] === '#') result += digits[di++];
    else result += mask[mi];
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
    const digits = this.value.replace(/\D/g, '');
    const formatted = applyMask(digits, country.mask);
    this.value = formatted;
  });

  update();
}

setupPhoneField();

// Cotação de câmbio — cache semanal no localStorage
async function updateCambio() {
  const CACHE_KEY = 'hk_cambio';
  const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;
  const FALLBACK = { USD: 1 / 5.70, EUR: 1 / 6.20 };

  let rates = null;
  let fetchedAt = null;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.ts < CACHE_TTL) {
        rates = parsed.rates;
        fetchedAt = new Date(parsed.ts);
      }
    }
  } catch (_) {}

  if (!rates) {
    try {
      const res = await fetch('https://api.frankfurter.app/latest?from=BRL&to=USD,EUR');
      const json = await res.json();
      rates = json.rates;
      fetchedAt = new Date();
      localStorage.setItem(CACHE_KEY, JSON.stringify({ rates, ts: fetchedAt.getTime() }));
    } catch (_) {
      rates = FALLBACK;
    }
  }

  // Atualiza células da tabela
  document.querySelectorAll('[data-brl]').forEach(row => {
    const brl = parseFloat(row.dataset.brl);
    const usdCell = row.querySelector('[data-currency="usd"]');
    const eurCell = row.querySelector('[data-currency="eur"]');
    if (usdCell) usdCell.textContent = `US$ ${Math.round(brl * rates.USD)}/mês`;
    if (eurCell) eurCell.textContent = `€ ${Math.round(brl * rates.EUR)}/mês`;
  });

  // Atualiza badge de câmbio
  const infoEl = document.getElementById('cambio-info');
  const dataEl = document.getElementById('cambio-data');
  if (infoEl) {
    const usdBRL = (1 / rates.USD).toFixed(2).replace('.', ',');
    const eurBRL = (1 / rates.EUR).toFixed(2).replace('.', ',');
    infoEl.textContent = `US$ 1 = R$ ${usdBRL} · € 1 = R$ ${eurBRL}`;
  }
  if (dataEl && fetchedAt) {
    dataEl.textContent = `Atualizado em ${fetchedAt.toLocaleDateString('pt-BR')}`;
  }
}

updateCambio();

// Scroll reveal simples
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.step-card, .tipo-card, .sobre-text, .sobre-visual').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});
