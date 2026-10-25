// Modo anotações de UX
const btnAnotacoes = document.getElementById('btn-anotacoes');
const legenda = document.getElementById('legenda');

function definirAnotacoes(ativo) {
  document.body.classList.toggle('anotando', ativo);
  legenda.hidden = !ativo;
  btnAnotacoes.setAttribute('aria-pressed', String(ativo));
  btnAnotacoes.textContent = ativo ? 'Ocultar anotações de UX' : 'Mostrar anotações de UX';
}

btnAnotacoes.addEventListener('click', () => {
  definirAnotacoes(!document.body.classList.contains('anotando'));
});

if (new URLSearchParams(location.search).has('anotacoes')) definirAnotacoes(true);

// Menu mobile
const menuBtn = document.querySelector('.menu-btn');
const menu = document.getElementById('menu');

menuBtn.addEventListener('click', () => {
  const aberto = menu.classList.toggle('aberto');
  menuBtn.setAttribute('aria-expanded', String(aberto));
  menuBtn.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  menuBtn.textContent = aberto ? '✕' : '☰';
});

menu.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    if (!menu.classList.contains('aberto')) return;
    menu.classList.remove('aberto');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Abrir menu');
    menuBtn.textContent = '☰';
  });
});

// Destaque do item de menu da seção visível
const linksMenu = [...menu.querySelectorAll('a')];
const secoes = linksMenu.map((l) => document.querySelector(l.getAttribute('href')));

function atualizarMenu() {
  const linha = Math.min(window.innerHeight * 0.45, 400);
  let atual = null;
  secoes.forEach((s) => {
    if (s && s.getBoundingClientRect().top <= linha) atual = s;
  });
  linksMenu.forEach((l) => {
    const ativo = atual !== null && l.getAttribute('href') === `#${atual.id}`;
    l.classList.toggle('ativo', ativo);
    if (ativo) l.setAttribute('aria-current', 'true');
    else l.removeAttribute('aria-current');
  });
}

let agendado = false;
window.addEventListener('scroll', () => {
  if (agendado) return;
  agendado = true;
  requestAnimationFrame(() => { atualizarMenu(); agendado = false; });
}, { passive: true });
atualizarMenu();

// Abas de horários (padrão WAI-ARIA: setas, Home e End)
const abas = [...document.querySelectorAll('[role="tab"]')];

function selecionarAba(aba) {
  abas.forEach((a) => {
    const selecionada = a === aba;
    a.setAttribute('aria-selected', String(selecionada));
    a.tabIndex = selecionada ? 0 : -1;
    document.getElementById(a.getAttribute('aria-controls')).hidden = !selecionada;
  });
  aba.focus();
}

abas.forEach((aba, i) => {
  aba.addEventListener('click', () => selecionarAba(aba));
  aba.addEventListener('keydown', (e) => {
    const destinos = {
      ArrowRight: abas[(i + 1) % abas.length],
      ArrowLeft: abas[(i - 1 + abas.length) % abas.length],
      Home: abas[0],
      End: abas[abas.length - 1],
    };
    if (destinos[e.key]) {
      e.preventDefault();
      selecionarAba(destinos[e.key]);
    }
  });
});

// Formulário de aula experimental
const form = document.getElementById('form-experimental');
const campoNome = document.getElementById('nome');
const campoWhats = document.getElementById('whatsapp');
const sucesso = document.getElementById('sucesso');

campoWhats.addEventListener('input', () => {
  const d = campoWhats.value.replace(/\D/g, '').slice(0, 11);
  let v = d;
  if (d.length > 2) v = `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length > 7) v = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  campoWhats.value = v;
});

const regras = {
  nome: (v) => (v.trim().split(/\s+/).length >= 2 ? '' : 'Informe nome e sobrenome.'),
  whatsapp: (v) => (v.replace(/\D/g, '').length === 11 ? '' : 'Digite o DDD + número com 9 dígitos. Ex.: (11) 91234-5678'),
};

function validar(campo) {
  const msg = regras[campo.name](campo.value);
  document.getElementById(`erro-${campo.name}`).textContent = msg;
  campo.setAttribute('aria-invalid', msg ? 'true' : 'false');
  return !msg;
}

[campoNome, campoWhats].forEach((campo) => {
  campo.addEventListener('blur', () => campo.value && validar(campo));
  campo.addEventListener('input', () => {
    if (campo.getAttribute('aria-invalid') === 'true') validar(campo);
  });
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const nomeOk = validar(campoNome);
  const whatsOk = validar(campoWhats);

  if (!nomeOk || !whatsOk) {
    (nomeOk ? campoWhats : campoNome).focus();
    sucesso.hidden = true;
    return;
  }

  sucesso.hidden = false;
  form.querySelector('button[type="submit"]').textContent = 'Pedido enviado ✓';
});
