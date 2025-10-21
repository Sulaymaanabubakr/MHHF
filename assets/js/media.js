import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from 'https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

const configReady =
  firebaseConfig &&
  Object.values(firebaseConfig).every((value) =>
    typeof value !== 'string' ? true : value && !value.startsWith('YOUR_FIREBASE'),
  );

let db = null;
if (configReady) {
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  db = getFirestore(app);
} else {
  console.warn('Firebase configuration is incomplete. Media content will not load until it is updated.');
}

const homeGalleryGrid = document.querySelector('[data-gallery-grid]');
const homeVideoGrid = document.querySelector('[data-video-grid]');
const galleryGrid = document.querySelector('[data-gallery-full-grid]');
const videoGrid = document.querySelector('[data-video-full-grid]');
const galleryModal = document.querySelector('[data-gallery-modal]');

const truncate = (text = '', length = 110) =>
  text.length > length ? `${text.slice(0, length - 3)}...` : text;

const normaliseImageRecord = (record) => ({
  id: record.id,
  title: record.title || 'Untitled',
  description: record.description || '—',
  url: record.imageUrl || record.mediaUrl || '',
});

const normaliseVideoRecord = (record) => ({
  id: record.id,
  title: record.title || 'Untitled',
  description: record.description || '—',
  url: record.videoUrl || record.mediaUrl || '',
});

const setEmptyState = (container, message) => {
  if (!container) return;
  container.innerHTML = '';
  const empty = document.createElement('p');
  empty.className = 'media-empty';
  empty.textContent = message;
  container.appendChild(empty);
};

const fetchMedia = async (collectionName, limitValue) => {
  if (!db) {
    throw new Error('Firebase has not been configured.');
  }
  const constraints = [orderBy('createdAt', 'desc')];
  if (typeof limitValue === 'number') {
    constraints.push(limit(limitValue));
  }
  const snapshot = await getDocs(query(collection(db, collectionName), ...constraints));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const createImageCard = (item, enableModal = false) => {
  const card = document.createElement('article');
  card.className = 'media-card';
  const figure = document.createElement('img');
  figure.loading = 'lazy';
  figure.src = item.url;
  figure.alt = item.title;
  card.appendChild(figure);

  const body = document.createElement('div');
  body.className = 'media-card__body';

  const title = document.createElement('h3');
  title.className = 'media-card__title';
  title.textContent = item.title;

  const description = document.createElement('p');
  description.className = 'media-card__description';
  description.textContent = enableModal ? item.description : truncate(item.description, 90);

  body.append(title, description);
  card.appendChild(body);

  if (enableModal && galleryModal) {
    card.addEventListener('click', () => openGalleryModal(item));
  }

  return card;
};

const createVideoCard = (item) => {
  const card = document.createElement('article');
  card.className = 'media-card';

  const video = document.createElement('video');
  video.controls = true;
  video.preload = 'metadata';
  video.src = item.url;
  card.appendChild(video);

  const body = document.createElement('div');
  body.className = 'media-card__body';

  const title = document.createElement('h3');
  title.className = 'media-card__title';
  title.textContent = item.title;

  const description = document.createElement('p');
  description.className = 'media-card__description';
  description.textContent = truncate(item.description, 110);

  body.append(title, description);
  card.appendChild(body);

  return card;
};

const renderImages = async (container, limitValue, enableModal = false) => {
  if (!container) return;
  try {
    const records = (await fetchMedia('media_images', limitValue)).map(normaliseImageRecord);
    if (!records.length) {
      setEmptyState(container, 'No gallery items have been uploaded yet.');
      return;
    }
    container.innerHTML = '';
    records.forEach((record) => {
      if (!record.url) return;
      container.appendChild(createImageCard(record, enableModal));
    });
  } catch (error) {
    console.error('Unable to load gallery assets', error);
    setEmptyState(container, 'Unable to load gallery items at the moment. Please try again later.');
  }
};

const renderVideos = async (container, limitValue) => {
  if (!container) return;
  try {
    const records = (await fetchMedia('media_videos', limitValue)).map(normaliseVideoRecord);
    if (!records.length) {
      setEmptyState(container, 'No videos have been uploaded yet.');
      return;
    }
    container.innerHTML = '';
    records.forEach((record) => {
      if (!record.url) return;
      container.appendChild(createVideoCard(record));
    });
  } catch (error) {
    console.error('Unable to load videos', error);
    setEmptyState(container, 'Unable to load videos at the moment. Please try again later.');
  }
};

function openGalleryModal(item) {
  if (!galleryModal) return;
  const image = galleryModal.querySelector('[data-gallery-modal-image]');
  const title = galleryModal.querySelector('[data-gallery-modal-title]');
  const description = galleryModal.querySelector('[data-gallery-modal-description]');
  if (image) {
    image.src = item.url;
    image.alt = item.title;
  }
  if (title) title.textContent = item.title;
  if (description) description.textContent = item.description;
  galleryModal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
}

function closeGalleryModal() {
  if (!galleryModal) return;
  galleryModal.setAttribute('hidden', '');
  const image = galleryModal.querySelector('[data-gallery-modal-image]');
  if (image) {
    image.src = '';
    image.alt = '';
  }
  document.body.style.overflow = '';
}

if (galleryModal) {
  galleryModal.addEventListener('click', (event) => {
    if (event.target === galleryModal || event.target.closest('[data-gallery-modal-close]')) {
      closeGalleryModal();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !galleryModal.hasAttribute('hidden')) {
      closeGalleryModal();
    }
  });
}

if (homeGalleryGrid) {
  renderImages(homeGalleryGrid, 10);
}

if (galleryGrid) {
  renderImages(galleryGrid, undefined, true);
}

if (homeVideoGrid) {
  renderVideos(homeVideoGrid, 4);
}

if (videoGrid) {
  renderVideos(videoGrid);
}
