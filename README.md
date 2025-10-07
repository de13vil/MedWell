# 💊 MedWell - Alchemist's Grimoire 🧪  
**Wellness, brewed with precision.**

Welcome to **MedWell**, a smart medication management platform built for **Codesangam 2025** under the theme *"Alchemist's Grimoire."*  
It’s a modern full-stack application designed to help users effortlessly stay on top of their health and wellness schedules — combining intuitive scheduling, real-time reminders, and intelligent insights to ensure you never miss a vital dose.

---

## ✨ Features

### 🧱 Basic Features (Complete)
- 🔒 **Secure User Authentication:** Full registration & login system using **JWT** for secure, persistent sessions.  
- 📧 **Email OTP Verification:** OTP-based identity verification during registration to prevent fake accounts.  
- 🔑 **Forgot Password Flow:** Multi-step password reset process using email OTP for account recovery.  
- 💊 **Medicine Scheduling:** Create, view, update, or delete medication schedules with name, dosage, and frequency.  
- 🧾 **Simple Dose Logging:** Track doses as *“taken”* or *“missed”* to build a clear adherence history.  
- 📊 **High-Performance Dashboard:**
  - 🕒 **Upcoming Doses:** Displays doses for the rest of the day.  
  - 🔄 **Recent Activity:** Live feed of recent dose logs.  
  - 📈 **Data Visualization:** Backend-powered adherence graph for the last 7 days.

---

### 🧠 Advanced Features
- 🤖 **AI Chatbot Health Assistant (The Mystic):** Ask questions like *“What do I take today?”*  
- 📅 **Google Calendar Integration (The Great Sky Calendar):** Sync medication schedules directly with Google Calendar.

---

## 🛠️ Technology Stack

### 🖥️ Frontend
- ⚛️ **Framework:** React (with Vite)  
- 🎨 **Styling:** Tailwind CSS  
- 🧩 **UI Components:** shadcn/ui  
- 🎞️ **Animations:** Framer Motion  
- 🧭 **Routing:** React Router  
- 🌐 **API Communication:** Axios  

### ⚙️ Backend
- 🟩 **Runtime:** Node.js  
- 🚀 **Framework:** Express.js  
- 🗃️ **Database:** MongoDB (with Mongoose)  
- 🔐 **Authentication:** JSON Web Tokens (JWT) & bcrypt.js  
- 📬 **Email Service:** Nodemailer  
- 🌍 **Middleware:** CORS  

---

## 🚀 Setup Guide (Backend + Frontend)

Follow these steps to set up **MedWell** locally on your system.
# 🚀 Getting Started with MedWell

To get a local copy up and running, follow these simple steps.

---

## 🧩 Prerequisites

Before you start, make sure you have the following installed:

- **Node.js** (LTS version recommended)
- **npm** (Node Package Manager)
- **MongoDB Atlas** account (for cloud database)
- **Gmail Account** with an "App Password" for sending OTPs

---

## ⚙️ Backend Setup

### 1️⃣ Navigate to the Backend Folder:
```bash
cd Backend/server
```

### 2️⃣ Install Dependencies:
```bash
npm install
```

### 3️⃣ Create an Environment File:
Create a file named `.env` inside the `Backend/server` folder.

Add the following values inside:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_16_digit_gmail_app_password
```

### 4️⃣ Start the Backend Server:
```bash
node server.js
```
Your backend should now be running on:
```
http://localhost:3001
```

---

## 💻 Frontend Setup

### 1️⃣ Navigate to the Frontend Folder:
```bash
cd frontend
```

### 2️⃣ Install Dependencies:
```bash
npm install
```
### 3️⃣ Create an Environment File:
Create a file named `.env` inside the `Backend/server` folder.

Add the following values inside:
```env
VITE_GEMINI_API_KEY="your gemini api key"
```

### 3️⃣ Start the Frontend Development Server:
```bash
npm run dev
```

Your frontend will now be available at:
```
http://localhost:5173
```

---

✅ **Both frontend and backend should now be running successfully!**
