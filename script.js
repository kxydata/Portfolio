// ---------- theme toggle ----------
const themeToggle = document.getElementById('theme-toggle');
const toggleLabel = themeToggle.querySelector('.toggle-label');

function setTheme(isLight) {
  document.body.classList.toggle('light', isLight);
  themeToggle.setAttribute('aria-pressed', String(isLight));
  toggleLabel.textContent = isLight ? 'light' : 'dark';
}

themeToggle.addEventListener('click', () => {
  setTheme(!document.body.classList.contains('light'));
});

// respect system preference on first load
if (window.matchMedia('(prefers-color-scheme: light)').matches) {
  setTheme(true);
}

// ---------- toast ----------
const toast = document.getElementById('toast');
let toastTimer;

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

document.querySelectorAll('.timeline-item').forEach((item) => {
  const org = item.dataset.org;
  const detail = item.dataset.detail;

  const trigger = () => showToast(detail || `Learn more about my role at ${org}`);

  item.addEventListener('click', trigger);
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      trigger();
    }
  });
});

// ---------- skill bars: animate on scroll into view ----------
const skillBars = document.querySelectorAll('.skill-bar');

const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const bar = entry.target;
      const fill = bar.querySelector('.skill-fill');
      fill.style.width = `${bar.dataset.level}%`;
      skillObserver.unobserve(bar);
    }
  });
}, { threshold: 0.4 });

skillBars.forEach((bar) => skillObserver.observe(bar));

// ---------- contact form validation ----------
const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');

function setFieldError(fieldId, message) {
  const field = document.getElementById(fieldId).closest('.field');
  const errorEl = document.getElementById(`${fieldId}-error`);
  field.classList.toggle('invalid', Boolean(message));
  errorEl.textContent = message || '';
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  status.textContent = '';

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  let valid = true;

  if (!name) {
    setFieldError('name', 'Enter your name.');
    valid = false;
  } else {
    setFieldError('name', '');
  }

  if (!emailPattern.test(email)) {
    setFieldError('email', 'Enter a valid email address.');
    valid = false;
  } else {
    setFieldError('email', '');
  }

  if (message.length < 10) {
    setFieldError('message', 'Message needs at least 10 characters.');
    valid = false;
  } else {
    setFieldError('message', '');
  }

  if (!valid) return;

  status.textContent = 'Message sent — thanks for reaching out. I\u2019ll reply soon.';
  form.reset();
});

// ---------- download resume as PDF ----------
document.getElementById('download-pdf').addEventListener('click', () => {
  const printEl = document.getElementById('resume-print');
  printEl.innerHTML = buildPrintableResume();
  printEl.style.display = 'block';

  const opt = {
    margin: 0.5,
    filename: 'Kanyakorn-Yothachai-Resume.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, backgroundColor: '#ffffff' },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
  };

  html2pdf().set(opt).from(printEl).save().then(() => {
    printEl.style.display = 'none';
  });
});

function buildPrintableResume() {
  const skills = Array.from(document.querySelectorAll('.skill-bar'))
    .map((bar) => bar.querySelector('.skill-label span').textContent)
    .join(', ');

  const experience = Array.from(document.querySelectorAll('.timeline-item')).map((item) => {
    const date = item.querySelector('.timeline-date').textContent;
    const role = item.dataset.role;
    const org = item.dataset.org;
    const detail = item.dataset.detail;
    return `<div style="margin-bottom:14px;">
      <div style="font-weight:600;">${role} — ${org} <span style="font-weight:400;color:#555;">(${date})</span></div>
      <div style="font-size:13px;color:#333;">${detail}</div>
    </div>`;
  }).join('');

  const projects = Array.from(document.querySelectorAll('.project-card')).map((card) => {
    const tag = card.querySelector('.project-tag').textContent;
    const title = card.querySelector('h3').textContent;
    const desc = card.querySelector('.project-desc').textContent;
    return `<div style="margin-bottom:12px;">
      <div style="font-weight:600;">${title} <span style="font-weight:400;color:#555;">— ${tag}</span></div>
      <div style="font-size:13px;color:#333;">${desc}</div>
    </div>`;
  }).join('');

  return `
    <div style="font-family: Georgia, serif; color:#1B2130; padding: 10px;">
      <h1 style="font-family: Arial, sans-serif; margin-bottom:2px;">Kanyakorn "Patti" Yothachai</h1>
      <p style="color:#555; margin-top:0;">Penn State University &middot; B.S. Enterprise Technology Integration &middot; Based in South Korea</p>
      <h2 style="font-family: Arial, sans-serif; font-size:16px; border-bottom:1px solid #ccc; padding-bottom:4px;">Experience</h2>
      ${experience}
      <h2 style="font-family: Arial, sans-serif; font-size:16px; border-bottom:1px solid #ccc; padding-bottom:4px;">Projects</h2>
      ${projects}
      <h2 style="font-family: Arial, sans-serif; font-size:16px; border-bottom:1px solid #ccc; padding-bottom:4px;">Skills</h2>
      <p style="font-size:13px;">${skills}</p>
    </div>
  `;
}
