const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  const toggleMenu = () => {
    navLinks.classList.toggle('open');
    navToggle.classList.toggle('active');
  };

  navToggle.addEventListener('click', toggleMenu);
  navToggle.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleMenu();
    }
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('active');
    });
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2,
  }
);

document.querySelectorAll('.fade-up').forEach((element) => observer.observe(element));

const counters = document.querySelectorAll('[data-counter]');

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.counter, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 1800;
        const increment = Math.max(1, Math.round(target / 80));
        let current = 0;

        const timer = setInterval(() => {
          current = Math.min(current + increment, target);
          el.textContent = `${current}${suffix}`;
          if (current >= target) {
            clearInterval(timer);
            el.textContent = `${target}${suffix}+`;
          }
        }, 20);

        counterObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.3 }
);

counters.forEach((counter) => counterObserver.observe(counter));

const contactForm = document.querySelector('[data-contact-form]');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const button = contactForm.querySelector('button[type="submit"]');
    const formData = new FormData(contactForm);
    const name = formData.get('name')?.toString().trim() || 'A concerned supporter';
    const email = formData.get('email')?.toString().trim() || 'Not provided';
    const phone = formData.get('phone')?.toString().trim() || 'Not provided';
    const enquiry = formData.get('message')?.toString().trim();
    const intro = "As salaamu alaykum warahmotullahi wabarakaatuhu, I'd like to ";
    const messageIntent = enquiry ? `${intro}${enquiry}` : `${intro}learn more about the Muslims Helping Humanity Foundation.`;
    const details = `\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}`;
    const whatsappNumber = '2348039168308';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`${messageIntent}${details}`)}`;

    if (button) {
      const originalText = button.textContent;
      button.textContent = 'Opening WhatsApp…';
      button.disabled = true;
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 1500);
    }

    window.open(whatsappUrl, '_blank');
    contactForm.reset();
  });
}

window.payWithPaystack = function payWithPaystack(amountNaira) {
  let amount = Number(amountNaira);
  if (!amount || Number.isNaN(amount)) {
    const promptValue = window.prompt('Enter the amount you would like to donate (NGN):');
    amount = Number(promptValue);
  }

  if (!amount || Number.isNaN(amount) || amount < 100) {
    alert('Please enter a valid amount of at least ₦100.');
    return;
  }

  const amountKobo = Math.round(amount * 100);
  const handler = PaystackPop.setup({
    key: 'pk_live_f7d549c5c73b6fef7105df1dd3d4cbe209ce396a',
    email: 'donor@example.com',
    amount: amountKobo,
    currency: 'NGN',
    ref: `MHHF-${Date.now()}`,
    callback(response) {
      alert(`Thank you for supporting MHHF! Reference: ${response.reference}`);
    },
    onClose() {
      alert('Donation window closed. You can try again anytime.');
    },
  });

  handler.openIframe();
};


const donationButtons = document.querySelectorAll('[data-donation-button]');
donationButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const donationBlock = button.closest('[data-donation]');
    const amountField = donationBlock?.querySelector('[data-donation-amount]');
    const rawValue = amountField?.value?.trim();
    const amount = Number(rawValue);

    if (!amount || Number.isNaN(amount) || amount < 100) {
      alert('Please enter a valid amount of at least ₦100.');
      amountField?.focus();
      return;
    }

    const originalText = button.textContent;
    button.textContent = 'Redirecting…';
    button.disabled = true;
    payWithPaystack(amount);
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 1800);
  });
});
