RecoverAI

An AI-powered Lost & Found platform that intelligently matches lost and found reports, verifies ownership securely, and coordinates exchanges via secure real-time messaging.

RecoverAI is a full-stack web application designed to modernize traditional lost-and-found workflows for college campuses, workplaces, and organizations. By leveraging AI-powered image analysis, context-aware opposite-type matching, dynamic physical-verification questions, and a strict two-party return confirmation protocol, the platform ensures secure and efficient item recovery.

Architecture

                +-----------------------------------+

                \|         React Frontend            |

                \|          (TypeScript)             |

                +-----------------+-----------------+

                                  |

                                  \| REST API &

                                  \| WebSockets (Socket.IO)

                                  v

                +-----------------+-----------------+

                \|          Express Backend          |

                \|             (Node.js)             |

                +----+------------+------------+----+

                     \|            |            |

     Mongoose/MongoDB |            |            |

                     v            v            v

         +-----------+---+  +-----+-----+  +---+--------+

         \| MongoDB Atlas |  | Gemini AI |  | Cloudinary |

         \|   Database    |  |  Service  |  |   Media    |

         +---------------+  +-----------+  +------------+

Core User Workflow

Report Lost / Found Item (Multi-step form with multiple image uploads)

      │

      ▼

AI Image Analysis (Gemini extracts category, color, brand, attributes)

      │

      ▼

Opposite-Type AI Matching (LOST matches only against FOUND, and vice versa)

      │

      ▼

Claim Submission (Claimant answers dynamic non-sensitive verification questions)

      │

      ▼

Owner Review (Item owner reviews responses and verification score)

      │

      ▼

Claim Approval/Rejection (Approving locks other claims, updates statuses)

      │

      ▼

Secure Real-Time Chat (Socket.IO room unlocks only for approved claimants)

      │

      ▼

Exchange Coordination (Coordinate proposing location and time)

      │

      ▼

Two-Party Return Confirmation (Both Owner and Claimant must confirm exchange)

      │

      ▼

Item Marked Returned & Conversation Archived

Key Features

Authentication & User Management

JWT-based authentication.

User registration and login.

Protected frontend routes.

Role-based authorization.

User profile management.

Password update functionality.

Backend authorization for protected resources.

Lost & Found Management

Report lost items.

Report found items.

Correct Lost/Found report selection through navigation.

Multiple image uploads per item.

Image previews and individual image removal.

Detailed item descriptions.

Category-based organization.

Item status tracking.

Owner-aware item management.

AI-Powered Assistance

Google Gemini-powered image analysis.

Automatic extraction of item attributes.

AI-assisted item description generation.

Context-aware verification question generation.

Verification questions based on physical, non-sensitive item characteristics.

Verification questions never request passwords, PINs, passcodes, OTPs, or other credentials.

Intelligent Matching

AI-powered matching between lost and found reports.

Context-aware opposite-type matching.

Lost reports show relevant Found matches.

Found reports show relevant Lost matches.

Match confidence information.

AI match recommendations on item details pages.

Duplicate and invalid match prevention.

Claim Management

Submit ownership claims directly from registry cards.

Backend validation prevents users from claiming their own items.

Prevent duplicate active claims.

Prevent claims on returned items.

Claim verification questions.

Owner-side claim review.

Claimant-side claim tracking.

Pending, Under Review, Approved, Rejected, and Completed states.

Role-aware claim access and authorization.

Smart Registry Actions

Registry cards dynamically display actions based on the user's relationship with the item:

Claim Item

Pending Review

Under Review

Open Chat

Claim Rejected

Returned

Manage Item

View Details

This allows users to understand the current recovery state without repeatedly opening item details.

Secure Real-Time Conversations

Chat becomes available only after a claim is approved.

Dedicated conversation rooms.

Real-time messaging using Socket.IO.

Instant message synchronization between participants.

Message persistence.

Unread message tracking.

Real-time notifications.

Typing and conversation events.

Conversation access restricted to authorized participants.

Active conversations dashboard.

Conversation history.

Exchange Coordination

After claim approval, users can coordinate the physical exchange through the secure conversation:

Share exchange location.

Propose exchange time.

Exchange-related updates.

Meeting status tracking.

Real-time meeting updates.

Two-Party Return Confirmation

RecoverAI prevents a single participant from declaring an item returned. The exchange follows a two-party confirmation workflow:

Owner confirms

Claimant confirms

Both confirmed -> Claim completed -> Item marked Returned

The item is marked as returned only after both the owner and claimant independently confirm the exchange.

Notifications

Claim notifications.

Claim status updates.

Approval/rejection notifications.

New message notifications.

Exchange and meeting updates.

Return confirmation notifications.

Real-time notification delivery.

Dashboard

User dashboards provide recovery-related statistics and shortcuts, including:

Lost Reports

Found Reports

Pending Claims

My Claims

Claims Under Review

Approved Claims

Rejected Claims

Returned Items

Active Conversations

Dashboard statistics and navigation are role-aware and reflect the appropriate owner-side or claimant-side workflow.

Administration

Role-based administrative access.

Claim moderation.

User management.

Administrative dashboard.

Access-controlled management operations.

Technology Stack

Frontend

React 19 & TypeScript

Vite (Build Tool)

Material UI (MUI) 5 & Emotion

React Router 7

Axios (API Client)

Socket.IO Client

Backend

Node.js & Express 5

Socket.IO (WebSockets)

JSON Web Tokens (JWT) & Bcrypt

Multer (File Handling)

Express Validator (Inputs Verification)

Database & Cloud

MongoDB Atlas (Mongoose ODM)

Google Gemini API (@google/genai)

Cloudinary (Media Hosting)

Project Structure

RecoverAI

├── backend

│   ├── src

│   │   ├── config          # Database, socket, and Gemini initializers

│   │   ├── controllers     # HTTP controllers (auth, items, claims, chat)

│   │   ├── middleware      # Auth guards and error handlers

│   │   ├── models          # Mongoose models (User, Item, Claim, Message, etc.)

│   │   ├── routes          # Express API route configurations

│   │   ├── services        # Business services (AI, claims, verification)

│   │   ├── utils           # API response helpers and error classes

│   │   └── server.js       # App entry point

│   ├── .env.example

│   └── package.json

├── frontend

│   ├── src

│   │   ├── components      # Reusable UI layouts and footers

│   │   ├── context         # Auth and WebSocket context wrappers

│   │   ├── features        # Feature-driven directories (auth, items, claims)

│   │   ├── pages           # Landing pages and user dashboards

│   │   ├── routes          # React routes config (AppRoutes)

│   │   ├── App.css

│   │   └── main.tsx

│   ├── index.html

│   ├── package.json

│   ├── tsconfig.json

│   └── vite.config.ts

└── README.md

Installation & Setup

1. Clone the Repository

git clone https://github.com/ss2607/RecoverAI.git

cd RecoverAI

2. Backend Setup

Navigate to the backend folder:

cd backend

npm install

Create a .env file inside the backend directory following this format:

PORT=5010

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret_key

JWT_EXPIRES_IN=7d

GEMINI_API_KEY=your_gemini_api_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name

CLOUDINARY_API_KEY=your_cloudinary_api_key

CLOUDINARY_API_SECRET=your_cloudinary_api_secret

Start the server:

npm run dev



3. Frontend Setup

Open a new terminal and navigate to the frontend folder:

cd frontend

npm install

Start the development server:

npm run dev

Open http://localhost:5173 in your browser.

Removed Features

QR Code Functionality: QR generation, tag scanning, and matching flows have been completely removed from both the client and backend as they are no longer part of the core RecoverAI workflow.

Development Status

Core MVP: Complete. All primary flows (reporting, Gemini image categorization, registry actions, claim verification, Socket.IO messaging, and two-party returns) are fully implemented, verified, and compiling cleanly.

Next Phase: Deployment preparation and staging validation.

Screenshots

Screenshots and walkthrough recordings demonstrating the visual dashboard, registry action states, and real-time chat can be added here.

Author

Shalu Singh

B.Tech Undergraduate

Indian Institute of Information Technology (IIIT) Kota

GitHub: ss2607

License

This project is intended for educational and portfolio purposes.