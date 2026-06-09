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
  const telefone = document.getElementById('telefone').value.trim();
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
    const url = `https://wa.me/5541999457725?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  }, 400);
}

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
