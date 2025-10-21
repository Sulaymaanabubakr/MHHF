# Muslims Helping Humanity Foundation (MHHF)

**Website Project Repository**

---

## 🌍 About Muslims Helping Humanity Foundation

Muslims Helping Humanity Foundation (MHHF) is a non-profit organisation based in Ibadan, Nigeria, dedicated to supporting widows, orphans, and the less privileged — irrespective of religion, tribe, or background.  
The foundation embodies the true spirit of *compassion, kindness, and service to humanity*, inspired by Islamic values.

Our mission is to **empower the vulnerable**, **support education**, **promote healthy living**, and **relieve poverty** through sustainable initiatives and community projects.

---

## 🕊️ Mission

- To establish and empower widows, orphans, and the less privileged.  
- To relieve needy families, the sick, and widows.  
- To embark on selfless humanitarian service.  
- To help communities gain access to clean and safe water.  

---

## 🌟 Vision

To create a world where every widow is empowered, every orphan is supported, and every less privileged person has access to education, dignity, and opportunities for self-reliance — regardless of background.

---

## 💡 Core Focus Areas

1. **Education** — Paying school fees, providing learning materials, and helping children access education.  
2. **Empowerment** — Supporting widows and less privileged individuals with capital, training, and resources to start businesses.  
3. **Healthcare** — Promoting wellness and assisting families in need of medical care.  
4. **Poverty Relief** — Providing food, clothing, and essential supplies to ease hardship.  
5. **Water Projects** — Ensuring access to clean, safe water for daily use.  
6. **Orphan Support** — Providing care, education, and sanctuary for orphans and vulnerable children.  

---

## 🎨 Branding

- **Logo Colours:** Derived directly from the official MHHF logo (Blue, Green, Orange, and Yellow tones).  
- **Typography:**  
  - *Headings:* Playfair Display / Merriweather  
  - *Body Text:* Poppins / Open Sans  
- **Design Style:**  
  Clean, compassionate, and minimalist with warm tones and rounded edges to represent care and community.

---

## 🖥️ Website Structure

### Pages
- **Home:** Welcome message, mission highlights, and quick navigation.  
- **About:** History, mission, vision, and values.  
- **Our Focus:** Overview of education, empowerment, healthcare, poverty relief, and orphan support.  
- **Gallery:** Images and stories from community projects.  
- **Get Involved:** Information on how to donate, volunteer, or partner.  
- **Contact:** Contact form and foundation details.

### Key Features
- Responsive design (mobile-first)
- Smooth scrolling and animation effects
- Floating WhatsApp chat button for quick communication
- Integrated contact form (Formspree or backend email service)
- Optional donation integration via Paystack or Flutterwave
- Easy to deploy on **Netlify**, **Vercel**, or **GitHub Pages**

---

## 📞 Contact Information

**Muslims Helping Humanity Foundation (MHHF)**  
📍 Ibadan, Nigeria  

- **WhatsApp:** 08039168308  
- **Phone:** 08108997871, 08148833043  
- **Email:** mhminitiative20@gmail.com  
- **Facebook:** [Muslims Helping Humanity Foundation](https://facebook.com)  
- **Instagram:** [@mhhf003](https://instagram.com/mhhf003)  
- **TikTok:** [@muslimshelpinghumanity](https://tiktok.com/@muslimshelpinghumanity)  

---

## 🚀 Version 2.1 Update – Admin Dashboard & Media Management System

This update introduces a complete **Admin Dashboard** and dynamic **media-management system** for the Muslims Helping Humanity Foundation (MHHF) website — built with **Firebase** and **Cloudinary** while preserving the existing design, responsiveness, and structure.

### 🔐 Admin Dashboard (`admin-mhhf.html`)
- Secure **Firebase Authentication** with **Email/Password + Google Login**.  
- Supports **multiple admins** (organisation-wide access).  
- Full **header & footer** consistent with main site.  
- **Logout button** in header works correctly on all screens.  
- **Mobile-first** responsive layout.

### 🖼️ Image Management
Admins can:
- Upload **images** with *title + description*.  
- View **preview** before upload.  
- Uploads stored in **Cloudinary → mhhf/images/** and referenced in Firestore.  
- **Edit:** opens popup pre-filled with existing data; saves updates automatically.  
- **Delete:** asks confirmation (“Are you sure you want to delete this item?”) before removal from Firestore + Cloudinary.

### 🎥 Video Management
Admins can:
- Upload **videos** with *title + description*.  
- Upload process shows *“Uploading… please wait”* and disables the button until done, then re-enables.  
- Stored in **Cloudinary → mhhf/videos/** and Firestore.  
- **Edit:** popup with all fields auto-populated.  
- **Delete:** confirmation prompt before removal.

### 🏠 Homepage Enhancement
Adds two new dynamic sections populated from Firestore:

**Our Gallery**  
- Displays 10 latest images (2 per row mobile, 4 desktop).  
- Each card shows image + title + short description.  
- “View All Images” button → `/gallery.html`.

**Our Videos**  
- Displays 4 latest videos (1 per row mobile, 2 desktop).  
- Embedded `<video>` players with controls.  
- “View All Videos” button → `/videos.html`.

### 📄 Dedicated Pages
**Gallery Page (`gallery.html`)**  
- Loads all images dynamically, modal/lightbox for full view.

**Videos Page (`videos.html`)**  
- Lists all uploaded videos with embedded players, titles, and descriptions.

### 🧠 Database & Storage Structure
**Firestore**
media_images/
id, title, description, imageUrl, createdAt
media_videos/
id, title, description, videoUrl, createdAt

markdown
Copy code

**Cloudinary Folders**
mhhf/images/
mhhf/videos/

yaml
Copy code

### 🎨 Design & Icons
- Uses **Remix Icons** for all icons (replaces Font Awesome).  
- Retains brand colours (Blue, Green, Orange, Yellow) and rounded, soft UI.

### 🌐 Social & SEO Integration
- Auto-displays official contact info and social links in footer.  
- Complete SEO meta tags + Open Graph data on every page.

### ⚙️ Tech Stack
HTML · CSS · JavaScript (ES6) · Firebase Auth/Firestore · Cloudinary · Netlify / Vercel Hosting.

### ✅ Functionality Checklist
- [x] Multi-admin login (Google + Email)  
- [x] Upload / Edit / Delete images and videos  
- [x] Upload preview + progress state  
- [x] Responsive admin dashboard with logout  
- [x] Homepage shows latest media  
- [x] SEO and social links verified  
- [x] All Remix Icons render correctly  

---

📦 **Release Date:** October 2025  
🧑‍💻 **Developed by:** Project Team – Muslims Helping Humanity Foundation  
❤️ *Built with love to serve humanity.*

---

## 🌐 Domain

[https://muslimshelpinghumanity.org.ng](https://muslimshelpinghumanity.org.ng)

---

## ⚙️ Project Setup (For Developers)

1. **Clone the Repository**
   ```bash
   git clone https://github.com/<your-username>/muslims-helping-humanity-foundation.git
