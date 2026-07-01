# RecoverAI

> An AI-powered Lost & Found platform that streamlines item recovery through intelligent image analysis, secure ownership verification, and QR-based tracking.

RecoverAI is a full-stack web application designed to modernize traditional lost-and-found systems for colleges, universities, workplaces, and organizations. The platform enables users to report lost or found items, intelligently match similar reports, and securely verify ownership before returning items.

---

## Overview

Traditional lost-and-found systems are often manual, fragmented, and inefficient. RecoverAI addresses these challenges by providing a centralized platform that combines artificial intelligence with modern web technologies to improve recovery rates while maintaining user privacy and security.

---

## Key Features

### Authentication & User Management
- Secure JWT-based authentication
- User registration and login
- Protected routes
- User profile management
- Password update functionality

### Lost & Found Management
- Report lost items
- Report found items
- Upload multiple item images
- Detailed item descriptions
- Category-based organization
- Status tracking

### AI-Powered Assistance
- Image analysis using Google Gemini
- AI-generated item descriptions
- Intelligent verification support
- Automated metadata extraction

### Smart Matching
- Match lost and found reports
- View potential matches
- Claim submission workflow
- Verification process before item release

### QR Code Recovery
- Generate QR codes for registered items
- Scan QR codes
- Retrieve associated item information

### Notifications
- User notifications
- Claim status updates
- Match notifications

### Administration
- User management
- Claim review
- Dashboard analytics
- Administrative controls

---

# Technology Stack

## Frontend

- React
- TypeScript
- Vite
- Material UI (MUI)
- React Router
- Axios

## Backend

- Node.js
- Express.js
- JWT Authentication
- REST API

## Database

- MongoDB Atlas

## Cloud Services

- Cloudinary
- Google Gemini API

---

# Project Structure

```
RecoverAI
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── services
│   └── server.js
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── features
│   │   ├── pages
│   │   ├── routes
│   │   ├── services
│   │   └── theme
│   └── public
│
└── README.md
```

---

# Architecture

```
                React + TypeScript
                        │
                        ▼
                 Express REST API
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
   MongoDB Atlas    Cloudinary     Gemini API
```

---

# Installation

## Clone the repository

```bash
git clone https://github.com/ss2607/RecoverAI.git
cd RecoverAI
```

---

## Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory.

Example:

```env
PORT=5010

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

GEMINI_API_KEY=your_gemini_api_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend:

```bash
npm run dev
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The application will run on:

```
Frontend:
http://localhost:5173

Backend:
http://localhost:5010
```

---

# Current Modules

- Authentication
- Item Reporting
- Lost Item Listing
- Found Item Listing
- Item Details
- Smart Matching
- Claim Management
- QR Code Management
- Notifications
- User Profile
- Admin Dashboard

---

# Security

RecoverAI incorporates several security measures including:

- JWT authentication
- Protected API routes
- Secure password handling
- Role-based authorization
- Ownership verification before claim approval

---

# Future Enhancements

- Advanced AI similarity matching
- Real-time notifications
- Email verification
- OCR for item identification
- Mobile application
- Organization-based multi-tenancy
- Analytics dashboard
- PWA support

---

# Screenshots

Screenshots will be added after the UI redesign is completed.

---

# Development Status

Current Phase:

- Backend Development: Complete
- Authentication: Complete
- Database Integration: Complete
- API Development: Complete
- Frontend Redesign: In Progress
- AI Integration: In Progress
- Final Deployment: Pending

---

# Author

**Shalu Singh**

B.Tech Undergraduate  
Indian Institute of Information Technology (IIIT) Kota

GitHub: https://github.com/ss2607

---

# License

This project is intended for educational and portfolio purposes.