﻿# 🍱 Food Management Backend (WIP)

> 🚧 This project is currently under active development — key backend modules are complete, with enhancements and frontend integration in progress.

## 🌟 Overview

This is the backend service for a **real-time food donation and waste management system** that connects restaurants, NGOs, recyclers, and regular users.

The backend provides REST APIs to:
- Post and claim leftover food
- Handle waste recycling logistics
- Manage user roles and permissions
- Offer analytics and reports for admins

---

## 🛠 Tech Stack

- **Node.js** + **Express.js**
- **Prisma ORM** with **PostgreSQL**
- **Redis** for caching (ioredis)
- **JWT** for authentication
- **AWS S3 / multer** for image upload
- **Swagger** for API docs
- **Cron** jobs for food expiry
- **Role-based Access Control**

---

## 🔐 User Roles

- 🧍 `USER`: Can claim food
- 🏥 `NGO`: Can claim and donate
- 🍽 `RESTAURANT`: Can post food and report waste
- 🔁 `RECYCLER`: Can claim food waste
- 🛠 `ADMIN`: Full access, analytics, control

---

## 📂 Project Structure (Backend Only)

```
src/
├── controllers/       // All route logic
├── routes/            // Route groupings
├── middlewares/       // Auth, audit, file upload
├── utils/             // Caching, ML, S3
├── config/            // Redis, Prisma config
├── cron/              // Expiry scheduler
├── swagger.js         // API documentation
└── server.js          // App entry point
```

---

## 🚀 Getting Started

### 🔧 Prerequisites
- Node.js, PostgreSQL
- Redis (local or cloud)

### 🔑 Setup Environment

Create a `.env` file:
```
PORT=5000
DATABASE_URL=postgresql://<user>:<pass>@localhost:5432/fooddb
JWT_SECRET=your_secret_key
REDIS_URL=redis://localhost:6379
```

### ▶ Run Locally

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Access Swagger docs at:  
👉 [`http://localhost:5000/api-docs`](http://localhost:5000/api-docs)

---

## 📊 Key Features

- ✅ Authentication & role-based protection
- ✅ Food post/claim workflow
- ✅ Waste management by restaurants
- ✅ Recycler request lifecycle
- ✅ Admin dashboard & analytics
- ✅ Redis-powered API caching
- ✅ File upload & image hosting
- ✅ DB export/import endpoints
- ✅ CSV upload & user export
- ✅ Cron job to auto-expire food

---

## 🧩 Coming Soon (Planned Enhancements)

- [ ] Pagination & input validation (Zod)
- [ ] Notification system (email / push)
- [ ] Location auto-detection via frontend
- [ ] Live map + analytics visualization
- [ ] Docker + CI/CD pipeline
- [ ] Advanced ML suggestions (via `utils/ml.js`)

---

## 👨‍💻 Project Status

✅ **Backend Core Functionalities:** Completed  
🛠️ **Enhancements & Optimizations:** In Progress  
🌐 **Frontend (React/React Native):** Under development

---

## 📬 Contact / Showcase Access

This is a **private repo** under active development.  
📩 Contact [sunnyjaya2203@gamil.com] for access or a demo link.

---

## 📃 License

MIT

## 🙋 Recruiter Note

Hello! 👋

Thank you for taking the time to review this project. This repository contains the backend code for a **real-world food donation and waste management platform** — designed to help restaurants, NGOs, recyclers, and individuals connect efficiently and reduce food waste.

> 🧠 **Note:** This project is under active development. While the backend is already functional and optimized with Redis caching, JWT-based auth, and Prisma-powered DB structure, enhancements and frontend integration are still ongoing.

### 🔍 Why this project matters

- It solves a **real social problem**: connecting surplus food to those in need.
- It's built with **scalability and performance** in mind using modern tools like Prisma, Redis, and Express.
- It includes **production-grade features**: role-based access, cron jobs, Swagger docs, CSV exports, and S3-ready upload support.
- It reflects my ability to design, build, and scale full-stack systems.

### 👨‍💻 Technologies Demonstrated

- Node.js, Express, Prisma (ORM), PostgreSQL
- Redis caching (ioredis), JWT authentication
- Swagger documentation, file upload handling
- Modular architecture, cron jobs, and data exports

### 📬 Want to see more?

- I’d be happy to give you **temporary access** to this private repo.
- I can also provide a **recorded walkthrough** or **host a live demo** on request.

Thanks again for reviewing this project!

Best regards,  
**Mohan**  
Emai: sunnyjaya2203@gmail.com · [LinkedIn](https://www.linkedin.com/in/mvkrish/)
