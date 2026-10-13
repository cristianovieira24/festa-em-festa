'use strict';
(() => {
  const root = document.documentElement;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let savedMotion = false;
  try { savedMotion = localStorage.getItem('festa-reduce-motion') === 'true'; } catch (_) {}
  let reduced = prefersReduced.matches || savedMotion;
  const motionButton = document.querySelector('.motion-toggle');
  const applyMotion = () => {
    root.classList.toggle('no-motion', reduced);
    root.classList.toggle('js-motion', !reduced);
    motionButton.setAttribute('aria-pressed', String(reduced));
    motionButton.textContent = reduced ? 'Movimento reduzido' : 'Reduzir movimento';
  };
  applyMotion();
  motionButton.addEventListener('click', () => {
    reduced = !reduced;
    try { localStorage.setItem('festa-reduce-motion', String(reduced)); } catch (_) {}
    applyMotion();
    updateScroll();
  });
  prefersReduced.addEventListener('change', e => { reduced = e.matches; applyMotion(); updateScroll(); });

  const menu = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#navigation');
  function closeMenu() {
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Abrir menu');
    navigation.classList.remove('open');
    document.body.classList.remove('menu-open');
  }
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    navigation.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
    if (e.key === 'Tab' && navigation.classList.contains('open')) {
      const links = [...navigation.querySelectorAll('a'), menu];
      const first = links[0], last = links[links.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  navigation.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  window.matchMedia('(max-width:760px)').addEventListener('change', closeMenu);

  const revealElements = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.08, rootMargin: '0px 0px -25px 0px' });
    revealElements.forEach(el => observer.observe(el));
  } else revealElements.forEach(el => el.classList.add('visible'));

  const readTitle = document.querySelector('[data-reading]');
  if (readTitle) {
    const children = [...readTitle.childNodes];
    children.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const fragment = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(word => {
          if (!word.trim()) fragment.append(document.createTextNode(word));
          else { const span = document.createElement('span'); span.className = 'word'; span.textContent = word; fragment.append(span); }
        });
        node.replaceWith(fragment);
      }
    });
  }
  const words = readTitle ? [...readTitle.querySelectorAll('.word')] : [];
  const experience = document.querySelector('.experience');
  const experiencePanels = [...document.querySelectorAll('[data-experience]')];
  const experienceButtons = [...document.querySelectorAll('[data-step]')];
  const mobile = window.matchMedia('(max-width:760px)');
  let activeExperience = 0;
  function setExperience(index) {
    activeExperience = index;
    experiencePanels.forEach((panel, i) => {
      const active = i === index;
      panel.classList.toggle('active', active);
      panel.inert = !active && !reduced;
      panel.setAttribute('aria-hidden', String(!active && !reduced));
    });
    experienceButtons.forEach((button, i) => {
      button.classList.toggle('active', i === index);
      button.setAttribute('aria-pressed', String(i === index));
    });
    const counter = document.querySelector('.experience-count');
    if (counter) counter.textContent = `0${index + 1} / 03`;
  }
  experienceButtons.forEach(button => button.addEventListener('click', () => {
    const index = Number(button.dataset.step);
    if (mobile.matches || reduced) setExperience(index);
    else {
      const top = experience.getBoundingClientRect().top + window.scrollY - 108;
      const range = experience.offsetHeight - (window.innerHeight - 108);
      window.scrollTo({ top: top + range * (index / 3 + 0.13), behavior: 'smooth' });
    }
  }));
  const progress = document.querySelector('.reading-progress');
  const stickyCTA = document.querySelector('.mobile-cta');
  function updateScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    document.querySelector('.header').classList.toggle('scrolled', y > 10);
    stickyCTA.classList.toggle('shown', y > 420);
    if (readTitle && !reduced) {
      const rect = readTitle.getBoundingClientRect();
      const amount = Math.max(0, Math.min(1, (window.innerHeight * .88 - rect.top) / (window.innerHeight * .48)));
      words.forEach((word, i) => { word.style.opacity = amount >= i / words.length ? '1' : '.24'; });
    }
    if (experience) {
      if (!mobile.matches && !reduced) {
        const range = experience.offsetHeight - (window.innerHeight - 108);
        const amount = Math.max(0, Math.min(.999, (108 - experience.getBoundingClientRect().top) / Math.max(1, range)));
        const index = Math.floor(amount * 3);
        if (index !== activeExperience) setExperience(index);
      }
      experiencePanels.forEach((panel,i) => { panel.inert = !reduced && i !== activeExperience; panel.setAttribute('aria-hidden', String(!reduced && i !== activeExperience)); });
    }
  }
  let ticking = false;
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { updateScroll(); ticking = false; }); } }, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });
  updateScroll();

  document.querySelectorAll('[data-tilt]').forEach(el => {
    const base = el.classList.contains('hero-photo') ? 3 : 3;
    el.addEventListener('pointermove', event => {
      if (reduced || event.pointerType !== 'mouse' || mobile.matches) return;
      const r = el.getBoundingClientRect();
      const x = (event.clientX - r.left) / r.width - .5;
      const y = (event.clientY - r.top) / r.height - .5;
      el.style.transform = `perspective(1100px) rotateX(${-y*5}deg) rotateY(${x*6}deg) rotate(${base}deg)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  const dialog = document.querySelector('#lightbox');
  let lastImageTrigger = null;
  document.querySelectorAll('.zoomable').forEach(figure => {
    figure.tabIndex = 0;
    figure.setAttribute('role', 'button');
    figure.setAttribute('aria-label', 'Ampliar imagem ilustrativa: ' + figure.querySelector('img').alt);
    const open = () => {
      lastImageTrigger = figure;
      const source = figure.querySelector('img');
      dialog.querySelector('img').src = source.src;
      dialog.querySelector('img').alt = source.alt;
      dialog.querySelector('p').textContent = figure.querySelector('figcaption').textContent + ' · Não representa o espaço real.';
      dialog.showModal();
    };
    figure.addEventListener('click', open);
    figure.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => lastImageTrigger?.focus());

  const form = document.querySelector('#party-form');
  if (form) {
    let currentStep = 0;
    const fieldsets = [...form.querySelectorAll('[data-form-step]')];
    const progressSteps = [...document.querySelectorAll('.form-progress span')];
    const params = new URLSearchParams(window.location.search);
    const type = params.get('tipo');
    if (type) [...form.querySelectorAll('[name=tipo]')].find(radio => radio.value === type)?.setAttribute('checked', 'checked');
    const interest = params.get('interesse');
    if (interest) form.elements.mensagem.value = `Gostaria de saber mais sobre: ${interest}.`;
    const now = new Date();
    const lisbonDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
    form.elements.data.min = lisbonDate;
    function data() { return Object.fromEntries(new FormData(form).entries()); }
    const formatDate = FestaBooking.formatDate;
    function message() { return FestaBooking.buildMessage(data()); }
    function updateSummary() {
      const d = data();
      document.querySelector('#summary-type').textContent = d.tipo;
      document.querySelector('#summary-date').textContent = formatDate(d.data);
      document.querySelector('#summary-guests').textContent = `${Number(d.criancas || 0) + Number(d.adultos || 0)} pessoas · estimativa`;
      document.querySelector('#message-preview').textContent = message();
    }
    function validateStep(index) {
      for (const field of fieldsets[index].querySelectorAll('input,select,textarea')) {
        if (!field.checkValidity()) { field.reportValidity(); return false; }
      }
      if (index === 1 && Number(form.elements.criancas.value) + Number(form.elements.adultos.value) < 1) {
        form.querySelector('.form-error').textContent = 'Indique pelo menos um convidado para prepararmos o pedido.';
        form.elements.adultos.focus();
        return false;
      }
      form.querySelector('.form-error').textContent = '';
      return true;
    }
    function showStep(index) {
      currentStep = index;
      fieldsets.forEach((el, i) => { el.hidden = i !== index; });
      progressSteps.forEach((el, i) => { el.classList.toggle('active', i <= index); if (i === index) el.setAttribute('aria-current','step'); else el.removeAttribute('aria-current'); });
      updateSummary();
      const legend = fieldsets[index].querySelector('legend');
      legend.tabIndex = -1;
      legend.focus({ preventScroll: true });
      if (mobile.matches) document.querySelector('.planner-main').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    }
    form.querySelectorAll('[data-next]').forEach(b => b.addEventListener('click', () => { if (validateStep(currentStep)) showStep(currentStep + 1); }));
    form.querySelectorAll('[data-prev]').forEach(b => b.addEventListener('click', () => showStep(currentStep - 1)));
    form.addEventListener('input', updateSummary);
    form.addEventListener('change', updateSummary);
    // Validate visible steps ourselves: hidden controls must never block focus or submission.
    form.noValidate = true;
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (currentStep < 2) { if (validateStep(currentStep)) showStep(currentStep + 1); return; }
      if (!validateStep(currentStep)) return;
      if (!form.elements.nome.value.trim()) { form.elements.nome.setCustomValidity('Indique o seu nome.'); form.elements.nome.reportValidity(); return; }
      form.elements.nome.setCustomValidity('');
      const url = FestaBooking.whatsappURL(data());
      const status = form.querySelector('.form-status');
      status.replaceChildren(document.createTextNode('O pedido está preparado. '));
      const fallback = document.createElement('a'); fallback.href = url; fallback.textContent = 'Abrir a mensagem no WhatsApp ↗'; fallback.target = '_blank'; fallback.rel = 'noopener';
      status.append(fallback);
      window.open(url, '_blank', 'noopener,noreferrer');
    });
    form.elements.nome.addEventListener('input', () => form.elements.nome.setCustomValidity(''));
    updateSummary();
  }

  document.querySelectorAll('a[href]').forEach(a => a.addEventListener('click', event => {
    if (reduced || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0 || a.target === '_blank') return;
    const url = new URL(a.href, window.location.href);
    if (url.origin !== window.location.origin || !url.pathname.endsWith('.html') || url.pathname === window.location.pathname) return;
    event.preventDefault(); document.body.classList.add('page-leaving');
    window.setTimeout(() => { window.location.href = url.href; }, 170);
  }));
  window.addEventListener('pageshow', () => document.body.classList.remove('page-leaving'));
})();
