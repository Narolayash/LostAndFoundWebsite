# Campus Find - College Lost & Found System

🌐 **Live Website:** [https://lost-and-found-website-iota.vercel.app/](https://lost-and-found-website-iota.vercel.app/)

A modern, full-stack College Campus Lost & Found web application designed to help students, faculty, and campus staff report lost items, post found belongings, and coordinate returns easily.

---

## ✨ Features

- **Interactive Dashboard:** Real-time metrics showing total items reported, active lost/found counters, and return success rate.
- **Detailed Reports:**
  - Report **Lost Items** with description, date, location, category, and image upload.
  - Report **Found Items** with finder details to coordinate returns.
- **Advanced Search & Filtering:** Filter items by category, keyword search, or sort by oldest/newest entries.
- **Modern UI/UX:** Responsive design built with dark mode support, glassmorphism navbar, custom cards, and smooth micro-animations.
- **Image Integration:** Seamless server-side image upload and hosting using Cloudinary.
- **Robust Error Handling:** Smart database connection status pages that assist in troubleshooting database setups (credentials, whitelist issues).

---

## 🛠️ Tech Stack

- **Framework:** Next.js (React 19 & App Router)
- **Database:** MongoDB & Mongoose (Object Data Modeling)
- **Styling:** Tailwind CSS & Lucide Icons
- **Image Hosting:** Cloudinary
- **Forms & Validation:** React Hook Form & Zod
- **Animations:** Framer Motion

---

## 💻 Local Setup Instructions

Follow these steps to run the application on your local machine:

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd lost-and-found-website
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory and define the following variables:

```env
# MongoDB Connection URI
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<db-name>?retryWrites=true&w=majority

# Cloudinary Configuration (Server-side upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> [!IMPORTANT]
> **MongoDB Password Encoding:** If your MongoDB database user password contains special characters (especially `@`), you **MUST** URL-encode them. For example, replace `@` with `%40`.
>
> *Example:* If your password is `Pass@word`, write it as `Pass%40word` in the connection string.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 5. Build for Production
To build and test the production bundle locally:
```bash
npm run build
npm start
```

---

## 🌐 Deployment Guide (Vercel)

To deploy this application to Vercel, follow these steps:

### 1. Configure Vercel Project
- Connect your GitHub repository to Vercel.
- Select the project and configure the **Environment Variables** in Vercel's settings:
  - Add `MONGODB_URI`
  - Add `CLOUDINARY_CLOUD_NAME`
  - Add `CLOUDINARY_API_KEY`
  - Add `CLOUDINARY_API_SECRET`

### 2. Configure MongoDB Atlas Network Access
Since hosting platforms like Vercel use dynamic IP addresses, you must configure your MongoDB Atlas cluster to allow access:
1. Log in to **MongoDB Atlas**.
2. Go to **Security -> Network Access**.
3. Click **Add IP Address** and choose **Allow Access from Anywhere** (`0.0.0.0/0`).
4. Click **Confirm** to activate.

---

## 📝 License
This project is open-source and available under the MIT License.
