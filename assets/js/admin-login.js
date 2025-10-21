import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js';
import { firebaseConfig } from './firebase-config.js';

const configReady =
  firebaseConfig &&
  Object.values(firebaseConfig).every((value) =>
    typeof value !== 'string' ? true : value && !value.startsWith('YOUR_FIREBASE'),
  );

if (!configReady) {
  console.warn('Firebase configuration is incomplete. Update assets/js/firebase-config.js to enable admin login.');
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);

const authPanel = document.querySelector('[data-auth-panel]');
const loginForm = document.querySelector('[data-email-login]');
const emailSubmitBtn = loginForm?.querySelector('[data-email-submit]');
const googleLoginBtn = document.querySelector('[data-google-login]');
const toast = document.querySelector('[data-admin-toast]');

function showToast(message, variant = 'default') {
  if (!toast) return;
  toast.textContent = message;
  toast.dataset.variant = variant;
  toast.removeAttribute('hidden');
  setTimeout(() => toast.setAttribute('hidden', ''), 3600);
}

function setFormBusy(isBusy) {
  if (!emailSubmitBtn) return;
  emailSubmitBtn.disabled = isBusy;
  emailSubmitBtn.innerHTML = isBusy
    ? '<i class="ri-loader-4-line"></i>Signing in...'
    : 'Sign In';
}

if (!configReady) {
  loginForm?.setAttribute('aria-disabled', 'true');
  emailSubmitBtn?.setAttribute('disabled', 'true');
  googleLoginBtn?.setAttribute('disabled', 'true');
  showToast('Admin settings are missing. Please update your Firebase config.', 'error');
}

loginForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!configReady) return;
  const data = new FormData(loginForm);
  const email = data.get('email')?.toString().trim();
  const password = data.get('password')?.toString();

  if (!email || !password) {
    showToast('Enter both email and password.', 'error');
    return;
  }

  setFormBusy(true);
  try {
    await signInWithEmailAndPassword(auth, email, password);
    showToast('Signed in successfully.');
    loginForm.reset();
  } catch (error) {
    console.error('Unable to sign in', error);
    let message = 'Sign-in failed. Check your details and try again.';
    switch (error.code) {
      case 'auth/user-not-found':
        message = 'No admin account found for that email.';
        break;
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        message = 'Incorrect email/password combination.';
        break;
      case 'auth/too-many-requests':
        message = 'Too many attempts. Please wait and try again.';
        break;
      default:
        break;
    }
    showToast(message, 'error');
  } finally {
    setFormBusy(false);
  }
});

googleLoginBtn?.addEventListener('click', async () => {
  if (!configReady) return;
  googleLoginBtn.disabled = true;
  googleLoginBtn.innerHTML = '<i class="ri-loader-4-line"></i>Connecting to Google...';
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    showToast('Signed in with Google.');
  } catch (error) {
    console.error('Google sign-in failed', error);
    let message = 'Google sign-in was cancelled or failed.';
    if (error?.code === 'auth/popup-blocked') {
      message = 'Allow popups to continue with Google sign-in.';
    }
    showToast(message, 'error');
  } finally {
    googleLoginBtn.disabled = false;
    googleLoginBtn.innerHTML = '<i class="ri-google-fill"></i>Continue with Google';
  }
});

onAuthStateChanged(auth, (user) => {
  if (!configReady) {
    return;
  }
  if (user) {
    window.location.replace('admin-mhhf.html');
  } else {
    authPanel?.removeAttribute('hidden');
    document.body?.classList.remove('is-authenticated');
  }
});
