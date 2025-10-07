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
    if (button) {
      const originalText = button.textContent;
      button.textContent = 'Sending…';
      button.disabled = true;
      setTimeout(() => {
        button.textContent = 'Message Sent!';
        contactForm.reset();
        setTimeout(() => {
          button.textContent = originalText;
          button.disabled = false;
        }, 2500);
      }, 1200);
    }
  });
}

window.payWithPaystack = function payWithPaystack() {
  const handler = PaystackPop.setup({
    key: 'pk_test_replace_with_live_key',
    email: 'donor@example.com',
    amount: 5000,
    currency: 'NGN',
    ref: `MHHF-${Date.now()}`,
    callback(response) {
      alert('Thank you for supporting MHHF! Transaction reference: ' + response.reference);
    },
    onClose() {
      alert('Donation window closed. You can try again anytime.');
    },
  });

  handler.openIframe();
};
