import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js';
import { firebaseConfig, cloudinaryConfig } from './firebase-config.js';

const configReady =
  firebaseConfig &&
  Object.values(firebaseConfig).every((value) =>
    typeof value !== 'string' ? true : value && !value.startsWith('YOUR_FIREBASE'),
  );

if (!configReady) {
  console.warn('Firebase configuration is incomplete. Update assets/js/firebase-config.js to enable the admin dashboard.');
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const authPanel = document.querySelector('[data-auth-panel]');
const dashboard = document.querySelector('[data-dashboard]');
const adminName = document.querySelector('[data-admin-name]');
const emailLoginForm = document.querySelector('[data-email-login]');
const googleLoginBtn = document.querySelector('[data-google-login]');
const logoutBtn = document.getElementById('logoutBtn');
const tabs = document.querySelectorAll('.dashboard-tab');
const sections = document.querySelectorAll('.dashboard-section');
const imageForm = document.querySelector('[data-image-form]');
const videoForm = document.querySelector('[data-video-form]');
const imagePreviewWrapper = document.querySelector('[data-image-preview-wrapper]');
const imagePreview = document.querySelector('[data-image-preview]');
const videoPreviewWrapper = document.querySelector('[data-video-preview-wrapper]');
const videoPreview = document.querySelector('[data-video-preview]');
const videoUploadBtn = document.querySelector('[data-video-upload-btn]');
const videoUploadHint = document.querySelector('[data-video-upload-hint]');
const imageList = document.querySelector('[data-image-list]');
const videoList = document.querySelector('[data-video-list]');
const toast = document.querySelector('[data-admin-toast]');
const editModal = document.querySelector('[data-admin-modal]');
const editModalContent = document.querySelector('[data-admin-modal-content]');
const confirmModal = document.querySelector('[data-confirm-modal]');
const confirmCancelBtn = document.querySelector('[data-confirm-cancel]');
const confirmAcceptBtn = document.querySelector('[data-confirm-accept]');

let imageUnsubscribe = null;
let videoUnsubscribe = null;
let pendingDelete = null;

const formatter = new Intl.DateTimeFormat('en-NG', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function showToast(message, variant = 'default') {
  if (!toast) return;
  toast.textContent = message;
  toast.dataset.variant = variant;
  toast.removeAttribute('hidden');
  setTimeout(() => toast.setAttribute('hidden', ''), 3600);
}

function toggleView(isAuthenticated) {
  if (!authPanel || !dashboard) return;
  if (isAuthenticated) {
    authPanel.setAttribute('hidden', '');
    dashboard.removeAttribute('hidden');
  } else {
    dashboard.setAttribute('hidden', '');
    authPanel.removeAttribute('hidden');
  }
}

function clearPreviews() {
  if (imagePreviewWrapper && imagePreview) {
    imagePreviewWrapper.setAttribute('hidden', '');
    imagePreview.src = '';
  }
  if (videoPreviewWrapper && videoPreview) {
    videoPreviewWrapper.setAttribute('hidden', '');
    if (videoPreview.dataset.previewUrl) {
      URL.revokeObjectURL(videoPreview.dataset.previewUrl);
      delete videoPreview.dataset.previewUrl;
    }
    videoPreview.removeAttribute('src');
    videoPreview.load();
  }
}

function setActiveTab(targetKey) {
  tabs.forEach((tab) => {
    const isActive = tab.dataset.tab === targetKey;
    tab.classList.toggle('active', isActive);
  });
  sections.forEach((section) => {
    const match = section.dataset.section === targetKey;
    section.toggleAttribute('hidden', !match);
  });
}

async function uploadToCloudinary(file, folder, resourceType) {
  if (!cloudinaryConfig?.cloudName) {
    throw new Error('Cloudinary configuration is missing.');
  }
  const url = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/${resourceType}/upload`;
  const preset = resourceType === 'image' ? cloudinaryConfig.uploadPresetImages : cloudinaryConfig.uploadPresetVideos;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', preset);
  formData.append('folder', folder);
  formData.append('return_delete_token', '1');

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error?.message || 'Upload failed');
  }
  return payload;
}

async function deleteCloudinaryAsset(deleteToken, resourceType) {
  if (!deleteToken || !cloudinaryConfig?.cloudName) return;
  try {
    const url = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/${resourceType}/delete_by_token`;
    const formData = new FormData();
    formData.append('token', deleteToken);
    await fetch(url, {
      method: 'POST',
      body: formData,
    });
  } catch (error) {
    console.warn('Unable to delete Cloudinary asset', error);
  }
}

function renderMediaList(container, records, type) {
  if (!container) return;
  container.innerHTML = '';
  if (!records.length) {
    const empty = document.createElement('p');
    empty.className = 'media-empty';
    empty.textContent = `No ${type === 'image' ? 'images' : 'videos'} uploaded yet.`;
    container.appendChild(empty);
    return;
  }

  records.forEach((record) => {
    const item = document.createElement('article');
    item.className = 'media-item';
    item.dataset.id = record.id;

    const preview = document.createElement('div');
    preview.className = 'media-item__preview';
    if (type === 'image') {
      const img = document.createElement('img');
      img.src = record.imageUrl;
      img.alt = record.title;
      preview.appendChild(img);
    } else {
      const video = document.createElement('video');
      video.src = record.videoUrl;
      video.controls = true;
      video.preload = 'metadata';
      preview.appendChild(video);
    }

    const content = document.createElement('div');
    content.className = 'media-item__content';
    const heading = document.createElement('h3');
    heading.textContent = record.title;
    const description = document.createElement('p');
    description.textContent = record.description;
    const meta = document.createElement('span');
    meta.className = 'media-item__meta';
    const createdAt = record.createdAt?.toDate?.() || record.createdAt || new Date();
    meta.textContent = `Updated ${formatter.format(createdAt)}`;
    content.append(heading, description, meta);

    const actions = document.createElement('div');
    actions.className = 'media-item__actions';
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn--outline btn--small';
    editBtn.type = 'button';
    editBtn.innerHTML = '<i class="ri-edit-2-line"></i>Edit';
    editBtn.addEventListener('click', () => openEditModal(type, record));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn--danger btn--small';
    deleteBtn.type = 'button';
    deleteBtn.innerHTML = '<i class="ri-delete-bin-line"></i>Delete';
    deleteBtn.addEventListener('click', () => openDeleteModal(type, record));

    actions.append(editBtn, deleteBtn);
    item.append(preview, content, actions);
    container.appendChild(item);
  });
}

function subscribeToMedia() {
  if (!configReady) return;
  if (imageUnsubscribe) imageUnsubscribe();
  if (videoUnsubscribe) videoUnsubscribe();

  imageUnsubscribe = onSnapshot(
    query(collection(db, 'media_images'), orderBy('createdAt', 'desc')),
    (snapshot) => {
      const records = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      renderMediaList(imageList, records, 'image');
    },
  );

  videoUnsubscribe = onSnapshot(
    query(collection(db, 'media_videos'), orderBy('createdAt', 'desc')),
    (snapshot) => {
      const records = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      renderMediaList(videoList, records, 'video');
    },
  );
}

function detachMediaListeners() {
  if (imageUnsubscribe) {
    imageUnsubscribe();
    imageUnsubscribe = null;
  }
  if (videoUnsubscribe) {
    videoUnsubscribe();
    videoUnsubscribe = null;
  }
}

function handlePreview(event, type, elements = {}) {
  const file = event.target.files?.[0];
  if (!file) return;

  if (type === 'image') {
    const wrapper = elements.wrapper || imagePreviewWrapper;
    const previewEl = elements.preview || imagePreview;
    if (!wrapper || !previewEl) return;
    const reader = new FileReader();
    reader.onload = () => {
      previewEl.src = reader.result;
      wrapper.removeAttribute('hidden');
    };
    reader.readAsDataURL(file);
  } else if (type === 'video') {
    const wrapper = elements.wrapper || videoPreviewWrapper;
    const previewEl = elements.preview || videoPreview;
    if (!wrapper || !previewEl) return;
    if (previewEl.dataset.previewUrl) {
      URL.revokeObjectURL(previewEl.dataset.previewUrl);
    }
    const url = URL.createObjectURL(file);
    previewEl.src = url;
    previewEl.dataset.previewUrl = url;
    previewEl.load();
    wrapper.removeAttribute('hidden');
  }
}

function buildEditForm(type, record) {
  const form = document.createElement('form');
  form.className = 'edit-form';
  form.innerHTML = `
    <h2>Edit ${type === 'image' ? 'Image' : 'Video'}</h2>
    <div class="form-group">
      <label for="editTitle">Title</label>
      <input id="editTitle" name="title" type="text" value="${record.title ?? ''}" required />
    </div>
    <div class="form-group">
      <label for="editDescription">Description</label>
      <textarea id="editDescription" name="description" rows="3" required>${record.description ?? ''}</textarea>
    </div>
    <div class="form-group">
      <label for="editFile">Replace ${type === 'image' ? 'Image' : 'Video'} (optional)</label>
      <input id="editFile" name="file" type="file" accept="${type === 'image' ? 'image/*' : 'video/*'}" />
    </div>
    <div class="preview">
      ${type === 'image' ? `<img src="${record.imageUrl}" alt="${record.title}" />` : `<video controls src="${record.videoUrl}"></video>`}
    </div>
    <div class="modal-actions">
      <button type="button" class="btn btn--outline" data-edit-cancel>Cancel</button>
      <button type="submit" class="btn btn--primary">Save Changes</button>
    </div>
  `;
  return form;
}

function openEditModal(type, record) {
  if (!editModal || !editModalContent) return;
  editModalContent.innerHTML = '';
  const form = buildEditForm(type, record);
  editModalContent.appendChild(form);
  editModal.removeAttribute('hidden');

  const cancelBtn = form.querySelector('[data-edit-cancel]');
  const fileInput = form.querySelector('#editFile');
  const previewWrapper = form.querySelector('.preview');
  const previewEl = previewWrapper?.querySelector(type === 'image' ? 'img' : 'video');

  cancelBtn?.addEventListener('click', closeEditModal);
  fileInput?.addEventListener('change', (event) => handlePreview(event, type, { wrapper: previewWrapper, preview: previewEl }));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const updates = {
      title: data.get('title'),
      description: data.get('description'),
      updatedAt: serverTimestamp(),
    };
    const file = data.get('file');
    try {
      if (file && file.size) {
        const upload = await uploadToCloudinary(file, `mhhf/${type === 'image' ? 'images' : 'videos'}`, type === 'image' ? 'image' : 'video');
        if (type === 'image') {
          updates.imageUrl = upload.secure_url;
        } else {
          updates.videoUrl = upload.secure_url;
        }
        updates.publicId = upload.public_id;
        updates.deleteToken = upload.delete_token;
        await deleteCloudinaryAsset(record.deleteToken, type === 'image' ? 'image' : 'video');
      }
      await updateDoc(doc(db, type === 'image' ? 'media_images' : 'media_videos', record.id), updates);
      showToast(`${type === 'image' ? 'Image' : 'Video'} updated successfully.`);
      closeEditModal();
    } catch (error) {
      console.error('Unable to update media item', error);
      showToast('Failed to update item. Please try again.', 'error');
    }
  });
}

function closeEditModal() {
  if (!editModal || !editModalContent) return;
  const tempVideo = editModalContent.querySelector('video[data-preview-url]');
  if (tempVideo?.dataset.previewUrl) {
    URL.revokeObjectURL(tempVideo.dataset.previewUrl);
  }
  editModal.setAttribute('hidden', '');
  editModalContent.innerHTML = '';
  clearPreviews();
}

if (editModal) {
  editModal.addEventListener('click', (event) => {
    if (event.target === editModal || event.target.matches('[data-admin-modal-close]')) {
      closeEditModal();
    }
  });
}

function openDeleteModal(type, record) {
  if (!confirmModal) return;
  pendingDelete = { type, record };
  confirmModal.removeAttribute('hidden');
}

function closeDeleteModal() {
  if (!confirmModal) return;
  confirmModal.setAttribute('hidden', '');
  pendingDelete = null;
}

confirmCancelBtn?.addEventListener('click', closeDeleteModal);
confirmModal?.addEventListener('click', (event) => {
  if (event.target === confirmModal) {
    closeDeleteModal();
  }
});

confirmAcceptBtn?.addEventListener('click', async () => {
  if (!pendingDelete) return;
  const { type, record } = pendingDelete;
  try {
    await deleteDoc(doc(db, type === 'image' ? 'media_images' : 'media_videos', record.id));
    await deleteCloudinaryAsset(record.deleteToken, type === 'image' ? 'image' : 'video');
    showToast(`${type === 'image' ? 'Image' : 'Video'} deleted successfully.`);
  } catch (error) {
    console.error('Unable to delete media item', error);
    showToast('Failed to delete item. Please try again.', 'error');
  } finally {
    closeDeleteModal();
  }
});

imageForm?.querySelector('#imageFile')?.addEventListener('change', (event) => handlePreview(event, 'image'));
videoForm?.querySelector('#videoFile')?.addEventListener('change', (event) => handlePreview(event, 'video'));

imageForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!configReady) {
    showToast('Firebase configuration is missing. Update the settings to continue.', 'error');
    return;
  }
  if (!auth.currentUser) {
    showToast('You must be signed in to upload media.', 'error');
    return;
  }
  const data = new FormData(imageForm);
  const title = data.get('title');
  const description = data.get('description');
  const file = data.get('file');
  if (!file || !file.size) {
    showToast('Please choose an image file to upload.', 'error');
    return;
  }
  try {
    const upload = await uploadToCloudinary(file, 'mhhf/images', 'image');
    await addDoc(collection(db, 'media_images'), {
      title,
      description,
      imageUrl: upload.secure_url,
      publicId: upload.public_id,
      deleteToken: upload.delete_token,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    showToast('Image uploaded successfully.');
    imageForm.reset();
    clearPreviews();
  } catch (error) {
    console.error('Unable to upload image', error);
    showToast('Image upload failed. Please try again.', 'error');
  }
});

videoForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!configReady) {
    showToast('Firebase configuration is missing. Update the settings to continue.', 'error');
    return;
  }
  if (!auth.currentUser) {
    showToast('You must be signed in to upload media.', 'error');
    return;
  }
  const data = new FormData(videoForm);
  const title = data.get('title');
  const description = data.get('description');
  const file = data.get('file');
  if (!file || !file.size) {
    showToast('Please choose a video file to upload.', 'error');
    return;
  }
  const originalText = videoUploadBtn?.innerHTML;
  if (videoUploadBtn) {
    videoUploadBtn.disabled = true;
    videoUploadBtn.innerHTML = '<i class="ri-time-line"></i>Uploading… please wait.';
  }
  if (videoUploadHint) {
    videoUploadHint.textContent = 'Uploading… please wait.';
  }
  try {
    const upload = await uploadToCloudinary(file, 'mhhf/videos', 'video');
    await addDoc(collection(db, 'media_videos'), {
      title,
      description,
      videoUrl: upload.secure_url,
      publicId: upload.public_id,
      deleteToken: upload.delete_token,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    showToast('Video uploaded successfully.');
    videoForm.reset();
    clearPreviews();
  } catch (error) {
    console.error('Unable to upload video', error);
    showToast('Video upload failed. Please try again.', 'error');
  } finally {
    if (videoUploadBtn) {
      videoUploadBtn.disabled = false;
      videoUploadBtn.innerHTML = originalText || '<i class="ri-video-upload-line"></i>Upload Video';
    }
    if (videoUploadHint) {
      videoUploadHint.textContent = 'Choose an MP4, MOV, or WEBM file to upload.';
    }
  }
});

emailLoginForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!configReady) {
    showToast('Firebase configuration is missing. Update the settings to continue.', 'error');
    return;
  }
  const data = new FormData(emailLoginForm);
  try {
    await signInWithEmailAndPassword(auth, data.get('email'), data.get('password'));
    showToast('Signed in successfully.');
    emailLoginForm.reset();
  } catch (error) {
    console.error('Unable to sign in', error);
    showToast('Sign-in failed. Please check your details.', 'error');
  }
});

googleLoginBtn?.addEventListener('click', async () => {
  if (!configReady) {
    showToast('Firebase configuration is missing. Update the settings to continue.', 'error');
    return;
  }
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    showToast('Signed in with Google.');
  } catch (error) {
    console.error('Google sign-in failed', error);
    showToast('Google sign-in was cancelled or failed.', 'error');
  }
});

logoutBtn?.addEventListener('click', async () => {
  try {
    await signOut(auth);
    showToast('You have been logged out.');
  } catch (error) {
    console.error('Unable to log out', error);
    showToast('Log out failed. Please try again.', 'error');
  }
});

tabs.forEach((tab) => {
  tab.addEventListener('click', () => setActiveTab(tab.dataset.tab));
});

onAuthStateChanged(auth, (user) => {
  if (!configReady) {
    toggleView(false);
    return;
  }
  toggleView(!!user);
  if (user && adminName) {
    adminName.textContent = user.displayName || user.email || 'Administrator';
    subscribeToMedia();
  } else {
    adminName.textContent = 'Administrator';
    detachMediaListeners();
    clearPreviews();
  }
});

setActiveTab('images');
