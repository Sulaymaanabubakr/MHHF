// =======================
// NAVIGATION TOGGLE
// =======================
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

// =======================
// SCROLL ANIMATIONS
// =======================
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);
document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));

// =======================
// COUNTERS
// =======================
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

// =======================
// CONTACT FORM (WhatsApp redirect)
// =======================
const contactForm = document.querySelector('[data-contact-form]');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const button = contactForm.querySelector('button[type="submit"]');
    const formData = new FormData(contactForm);

    const name = (formData.get('name') || 'A concerned supporter').toString().trim();
    const email = (formData.get('email') || 'Not provided').toString().trim();
    const phone = (formData.get('phone') || 'Not provided').toString().trim();
    const enquiry = (formData.get('message') || '').toString().trim();

    const intro = "As salaamu alaykum warahmotullahi wabarakaatuhu, I'd like to ";
    const messageIntent = enquiry
      ? `${intro}${enquiry}`
      : `${intro}learn more about the Muslims Helping Humanity Foundation.`;

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

// =======================
// PAYSTACK DONATION
// =======================
window.payWithPaystack = function payWithPaystack(amountNaira) {
  let amount = Number(amountNaira);
  if (!amount || Number.isNaN(amount)) {
    const promptValue = window.prompt('Enter the amount you would like to donate (NGN):');
    amount = Number(promptValue);
  }

  if (!amount || Number.isNaN(amount) || amount < 100) {
    showDonationNotification({
      variant: 'error',
      title: '❌ Transaction Unsuccessful',
      message: `SubhanAllah, your donation did not go through. Please enter a valid amount of at least ₦100 and try again. May Allah reward your sincere intention.`,
      showRetry: true,
    });
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
      showDonationNotification({
        variant: 'success',
        title: '🎉 Alhamdulillah! Your Donation Was Successful!',
        message: `JazakAllahu Khayran for your generous contribution to the <strong>Muslims Helping Humanity Foundation (MHHF)</strong>.<br><br>Your kindness will support widows, orphans, and the less privileged — and may Allah accept it as <em>Sadaqah Jariyah</em> for you and your loved ones.<br><br>We pray that Allah (SWT) blesses your wealth, multiplies your reward, and grants you goodness in this world and the Hereafter.<br><br><em>"The believer’s shade on the Day of Judgment will be his charity." – Prophet Muhammad ﷺ</em><br><br><strong>Thank you for being part of our mission to spread compassion and hope.</strong>`,
      });
    },
    onClose() {
      showDonationNotification({
        variant: 'error',
        title: '❌ Transaction Unsuccessful',
        message: `SubhanAllah, your donation didn’t go through this time — but please don’t be disheartened.<br><br>Allah (SWT) rewards every good intention even before it becomes action. The Prophet ﷺ said: <em>"Whoever intends to do a good deed but does not do it, Allah records it as a full good deed."</em> (Sahih Muslim)<br><br>Your intention to give in charity is already recorded with Allah, and He knows your sincerity.<br><br>You can try again in a few moments or contact us if you continue to experience issues.<br><br><strong>May Allah bless your wealth, ease your affairs, and accept all your good intentions as acts of worship.</strong>`,
        showRetry: true,
      });
    },
  });

  handler.openIframe();
};

// =======================
// DONATION BUTTON HANDLER
// =======================
const donationButtons = document.querySelectorAll('[data-donation-button]');
donationButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const donationBlock = button.closest('[data-donation]');
    const amountField = donationBlock?.querySelector('[data-donation-amount]');
    const rawValue = amountField?.value?.trim();
    const amount = Number(rawValue);

    if (!amount || Number.isNaN(amount) || amount < 100) {
      showDonationNotification({
        variant: 'error',
        title: '❌ Transaction Unsuccessful',
        message: `SubhanAllah, your donation didn’t go through. Please enter at least ₦100 so we can process it. Remember, Allah counts every sincere intention as a full good deed.`,
        showRetry: true,
      });
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

// =======================
// DONATION NOTIFICATION UI
// =======================
const donationNotice = (() => {
  const wrapper = document.createElement('div');
  wrapper.className = 'donation-notice';
  wrapper.setAttribute('hidden', '');
  wrapper.innerHTML = `
    <div class="donation-notice__dialog">
      <button type="button" class="donation-notice__close" aria-label="Close">&times;</button>
      <div class="donation-notice__title" data-notice-title></div>
      <div class="donation-notice__body" data-notice-body></div>
      <div class="donation-notice__actions">
        <button type="button" class="btn btn--primary" data-notice-retry hidden>🔁 Try Again</button>
        <button type="button" class="btn btn--outline" data-notice-home hidden>🏠 Return Home</button>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper);
  return wrapper;
})();

function showDonationNotification({ variant, title, message, showRetry = false }) {
  const dialog = donationNotice.querySelector('.donation-notice__dialog');
  const titleEl = donationNotice.querySelector('[data-notice-title]');
  const bodyEl = donationNotice.querySelector('[data-notice-body]');
  const retryBtn = donationNotice.querySelector('[data-notice-retry]');
  const homeBtn = donationNotice.querySelector('[data-notice-home]');

  dialog.classList.toggle('donation-notice__dialog--success', variant === 'success');
  dialog.classList.toggle('donation-notice__dialog--error', variant === 'error');

  titleEl.textContent = title;
  bodyEl.innerHTML = message;
  retryBtn.hidden = !showRetry;
  homeBtn.hidden = false;

  // Function to close the pop-up
  const closeNotice = () => {
    donationNotice.setAttribute('hidden', '');
    document.body.style.overflow = ''; // re-enable background scrolling
  };

  // Assign the close function to buttons
  donationNotice.querySelector('.donation-notice__close').onclick = closeNotice;
  retryBtn.onclick = closeNotice;
  homeBtn.onclick = () => {
    closeNotice();
    window.location.href = 'index.html';
  };

  // Show the pop-up
  donationNotice.removeAttribute('hidden');
  document.body.style.overflow = 'hidden'; // disable background scroll
}