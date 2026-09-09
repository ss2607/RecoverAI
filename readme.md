 🔎 RecoverAI

RecoverAI is a full-stack AI-powered Lost & Found platform designed to make item recovery faster, more reliable, and easier to manage. Users can report lost or found items, upload images, receive AI-assisted item analysis and matching recommendations, submit claims, complete dynamic verification, communicate privately, coordinate exchanges, and confirm the final return of an item.

Built using React, Node.js, Express.js, MongoDB, Gemini AI, Cloudinary, and Socket.IO.

🌐 Live Demo

Frontend: https://recoverai-frontend-4tqo.onrender.com

Backend API: https://recoverai-ygw7.onrender.com

GitHub Repository: https://github.com/ss2607/RecoverAI

✨ Features

🔎 Lost & Found Item Reporting

Report lost or found items

Add category, color, brand, condition, description, and tags

Upload multiple images

Cloudinary image storage

Edit active item details

View detailed item information

🤖 AI-Powered Item Analysis

RecoverAI uses Google Gemini to assist with:

Category

Color

Brand

Condition

Description

Tags

Fallback verification questions are available if Gemini is temporarily unavailable.

🧠 AI-Assisted Matching

The current deterministic matching score uses:

Category → 40 points

Color → 20 points

Brand → 15 points

Each matching AI tag → 5 points

Only opposite item types are matched:

LOST ↔ FOUND

The system prevents self-matches and duplicate match pairs.

Gemini assists by extracting item attributes; the final compatibility score uses application-defined heuristic weights.

📋 Claims & Verification

Claim workflow:

Claim
 ↓
Verification Questions
 ↓
Answer Questions
 ↓
Submit Claim
 ↓
Under Review
 ↓
Owner Review
 ↓
Approve / Reject

Includes dynamic verification questions, claimant tracking, owner review, duplicate-claim prevention, self-claim prevention, and returned-item protection.

💬 Private Real-Time Chat

After an approved claim, relevant users can communicate through private Socket.IO messaging.

🤝 Exchange Coordination

Approved claims can move into exchange coordination before final return confirmation.

✅ Two-Party Return Confirmation

Owner confirms return
        +
Claimant confirms receipt
        ↓
Recovery completed
        ↓
Item marked returned

Returned items are restricted from normal active recovery actions.

🔔 Dashboard & Notifications

Users can track reported items, matches, claims, recovery progress, and relevant notifications.

🛠️ Tech Stack

Frontend

React 19 — UI development

TypeScript — Type safety

Vite — Build tool

Material UI — UI components

Emotion — Styling

React Router — Client-side routing

Axios — API communication

Socket.IO Client — Real-time communication

Backend

Node.js — Runtime

Express.js — Backend framework

MongoDB — Database

Mongoose — MongoDB ODM

JWT — Authentication

bcrypt — Password hashing

Google Gemini — AI-assisted analysis

Cloudinary — Image storage

Socket.IO — Real-time chat

Middleware & Security

Multer — File uploads

express-validator — Request validation

Helmet — Security headers

express-rate-limit — Rate limiting

CORS — Cross-origin configuration

dotenv — Environment variables

🏗️ Architecture

                         ┌──────────────────────┐
                         │   React + TypeScript  │
                         │       Frontend       │
                         └──────────┬───────────┘
                                    │
                              REST API / Axios
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Node.js + Express   │
                         │       Backend         │
                         └──────────┬───────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                │                   │                   │
                ▼                   ▼                   ▼
        ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
        │   MongoDB    │    │    Gemini    │    │  Cloudinary  │
        │   Database   │    │      AI      │    │    Images    │
        └──────────────┘    └──────────────┘    └──────────────┘

                         ┌──────────────────────┐
                         │      Socket.IO       │
                         │    Private Chat      │
                         └──────────────────────┘

Recovery Workflow

Report Lost / Found Item
          ↓
AI-Assisted Attribute Extraction
          ↓
LOST ↔ FOUND Matching
          ↓
Potential Match
          ↓
Claim Submitted
          ↓
Verification Questions
          ↓
Owner Review
       ↙     ↘
   Reject    Approve
                ↓
           Private Chat
                ↓
       Exchange Coordination
                ↓
      Two-Party Confirmation
                ↓
        Item Marked Returned

📁 Project Structure

RecoverAI/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── socket/
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── utils/
│   │   └── App.tsx
│   ├── public/
│   └── package.json
│
└── README.md

🔐 Authentication & Authorization

RecoverAI uses JWT-based authentication with bcrypt password hashing.

Register / Login
       ↓
Credential validation
       ↓
bcrypt password verification
       ↓
JWT generated
       ↓
Protected request
       ↓
Authorization: Bearer <token>
       ↓
Backend verifies token

Backend authorization also checks resource relationships, such as item ownership and claim access, and restricts administrative functionality.

Lost and Found are item types, not user roles. The main authorization model is authentication, resource ownership, and required administrative roles rather than a complex standalone RBAC permission system.

🧠 Gemini AI Integration

RecoverAI uses Google's Gemini API through the @google/genai SDK.

Gemini assists with:

Item attribute extraction

Image/item understanding

Description generation

Tag generation

Verification question generation

Example structured output:

{
  "category": "",
  "color": "",
  "brand": "",
  "condition": "",
  "description": "",
  "tags": []
}

AI does not independently guarantee ownership. The claim is still reviewed by the relevant item owner.

🧮 Matching Algorithm

Category match       → 40 points
Color match          → 20 points
Brand match          → 15 points
Each matching tag    →  5 points

Only:

LOST ↔ FOUND

are considered.

The system also prevents:

Self-matching

Duplicate match pairs

Matching an item with itself

The weights are heuristic application-defined values and can be refined later using confirmed recovery outcomes.

📋 Claim & Recovery States

Claim States

pending
   ↓
under_review
   ↓
approved / rejected
   ↓
completed

Item Recovery

Once recovery is completed:

item → returned

Returned items are treated as completed recovery cases and normal active recovery actions are restricted.

🔌 API Structure

/api/auth/*          → Authentication
/api/items/*         → Lost/found item management
/api/matches/*       → Match recommendations
/api/claims/*        → Claims and verification
/api/admin/*         → Administrative functionality

Socket.IO handles real-time private chat separately from the REST API.

🔑 Key Implementation Details

Frontend

React 19 + TypeScript

Vite

Material UI

React Router

Axios service layer

Protected routes

JWT authentication

Socket.IO real-time chat

Responsive dashboards

Loading skeletons and progress indicators

Backend

Express.js REST API

Controller/service separation

MongoDB with Mongoose

JWT authentication

bcrypt password hashing

Backend authorization

Gemini integration

Cloudinary storage

Socket.IO

Request validation

Centralized API error/response handling

Helmet

Rate limiting

CORS

🛡️ Security & Data Integrity

JWT authentication

bcrypt password hashing

Backend-side authorization

Resource ownership checks

Input validation

Helmet security headers

API rate limiting

Controlled CORS

Environment variables for sensitive credentials

Self-claim prevention

Duplicate claim prevention

Self-match prevention

Duplicate match prevention

Returned-item restrictions

📦 Prerequisites

Node.js

npm

Git

MongoDB Atlas or MongoDB

Google Gemini API key

Cloudinary account

🚀 Installation

1. Clone Repository

git clone https://github.com/ss2607/RecoverAI.git
cd RecoverAI

2. Setup Backend

cd backend
npm install

Create backend/.env:

MONGODB_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_jwt_secret

GEMINI_API_KEY=your_gemini_api_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

PORT=5000
NODE_ENV=development

Start the backend:

npm start

3. Setup Frontend

cd frontend
npm install

Create frontend/.env:

VITE_API_URL=http://localhost:5000/api

Start the frontend:

npm run dev

🏗️ Production Build

Frontend

cd frontend
npm run build

The production build is generated in:

frontend/dist/

Backend

cd backend
npm start

🔒 Environment Variables

Sensitive credentials should never be committed to GitHub.

Store values such as MongoDB credentials, JWT secrets, Gemini API keys, and Cloudinary credentials in .env files.

Recommended .gitignore entries:

.env
.env.local
.env.production

🧪 Testing & Development

Important flows to test include:

Registration and login

JWT-protected requests

Lost/found reporting

Image uploads

Gemini analysis

Matching

Claims

Verification questions

Owner review

Approval/rejection

Private chat

Exchange coordination

Two-party return confirmation

Returned-item restrictions

Duplicate claim prevention

Self-claim prevention

Authorization checks

API validation

Frontend/backend communication

🚀 Deployment

RecoverAI is deployed using Render.

React/Vite frontend → Render

Node.js/Express backend → Render

MongoDB → MongoDB Atlas

AI analysis → Gemini

Image storage → Cloudinary

Real-time communication → Socket.IO

🐞 Troubleshooting

Backend not starting

Check MongoDB connection

Verify environment variables

Run npm install

Check Render/backend logs

Frontend not loading data

Verify VITE_API_URL

Check backend status

Inspect browser Network/Console

Verify CORS configuration

CORS errors

Make sure the backend allows the exact deployed frontend origin and that credentialed requests return the correct origin.

Gemini errors

Verify GEMINI_API_KEY

Check backend logs

Verify model/API configuration

Use fallback verification behavior when available

Image upload problems

Verify Cloudinary credentials

Check Multer configuration

Check multipart form-data requests

📊 Current Status

Version: 1.0

Status: Deployed and functional

Current MVP includes:

Lost/found reporting

AI-assisted item analysis

Matching recommendations

Claims and verification

Owner review

Private real-time chat

Exchange coordination

Two-party return confirmation

Authentication and authorization

Cloudinary image storage

MongoDB persistence

Production deployment

🔮 Future Improvements

Learn matching weights from confirmed recovery outcomes

Improve semantic similarity between item descriptions

Add advanced image similarity models

Location-aware matching

Improved notification delivery

More granular administrative permissions

Recovery analytics

More automated testing and monitoring

Stronger production observability

👩‍💻 Author

Shalu Singh

GitHub: https://github.com/ss2607

📄 License

This project is released under the MIT License.