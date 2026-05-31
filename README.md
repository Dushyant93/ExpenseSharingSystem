# SettleUp — Expense Sharing System

A full-stack CRUD web application for tracking shared expenses within groups.  
Built with **Node.js + Express + MongoDB** (backend) and **React.js** (frontend).

---

## Public URL

```
<EC2 public IP>
```

---

## Project Credentials (for demo access)

| Field    | Value             |
|----------|-------------------|
| Username | dushyant@mail.com |
| Password | dushyant          |

---

## Features

- **User Authentication** — Register, Login, Logout with JWT; password change via profile settings
- **Group Management** — Create, Read, Update, Delete expense groups; add members by email
- **Expense Management** — Create, Read, Update, Delete expenses with flexible split options (equal, percentage, exact)
- **Settlement Tracking** — Record payments between group members; view full settlement history per group
- **Balance Dashboard** — Real-time net balance calculations per group using the Facade service
- **Notification System** — In-app notifications auto-generated via the Observer pattern when expenses are added, updated, or deleted; unread count badge, mark-as-read
- **User Profile** — View and edit profile details, change password, see expense and group stats
- **Protected Routes** — All pages require JWT authentication
- **Health Check Endpoint** — `GET /api/health` confirms the API is live
- **Request Validation Middleware** — Validates required fields before they reach controllers
- **Request Logger Middleware** — Logs all incoming HTTP requests

---

## Design Patterns Implemented

| Pattern   | Location                                      | Description                                                                 |
|-----------|-----------------------------------------------|-----------------------------------------------------------------------------|
| **Strategy**  | `backend/utils/splitStrategies.js`        | Three interchangeable split algorithms (equal, percentage, exact) behind a common `calculate()` interface |
| **Factory**   | `backend/utils/splitStrategies.js`, `backend/utils/responseFactory.js` | `getSplitStrategy()` returns the correct strategy class; `ResponseFactory` produces consistent API response objects |
| **Observer**  | `backend/utils/notificationObserver.js`   | `ExpenseEventEmitter` (Subject) notifies registered `NotificationObserver` instances whenever an expense event fires |
| **Facade**    | `backend/services/settleUpService.js`     | Single `SettleUpService` class wraps complex multi-model balance calculations behind a clean interface |

---

## Project Structure

```
ExpenseSharingSystem/
├── backend/
│   ├── config/
│   │   └── db.js                          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js              # Register, login, profile
│   │   ├── expenseController.js           # CRUD for expenses
│   │   ├── groupController.js             # CRUD for groups + addMember
│   │   ├── notificationController.js      # Get, mark read
│   │   ├── profileController.js           # View/edit profile, change password
│   │   └── settlementController.js        # CRUD for settlements + balances
│   ├── middleware/
│   │   ├── authMiddleware.js              # JWT verification
│   │   ├── requestLogger.js               # HTTP request logging
│   │   └── validate.js                    # Required-field validation
│   ├── models/
│   │   ├── Expense.js                     # Expense schema
│   │   ├── Group.js                       # Group schema
│   │   ├── Notification.js                # Notification schema
│   │   ├── Settlement.js                  # Settlement schema
│   │   └── User.js                        # User schema
│   ├── routes/
│   │   ├── authRoutes.js                  # Login, register, user search
│   │   ├── expenses.js                    # Expense routes
│   │   ├── groups.js                      # Group routes + member management
│   │   ├── notifications.js               # Notification routes
│   │   ├── profile.js                     # Profile routes
│   │   └── settlements.js                 # Settlement routes
│   ├── services/
│   │   └── settleUpService.js             # Facade: balance calc + group summary
│   ├── test/
│   │   ├── expenseControllerTest.js       # 10 expense unit tests
│   │   ├── groupControllerTest.js         # 14 group unit tests
│   │   ├── notificationControllerTest.js  # 8 notification unit tests
│   │   ├── observerAndFactoryTest.js      # 8 Observer + Factory pattern tests
│   │   ├── profileControllerTest.js       # 8 profile unit tests
│   │   ├── settlementControllerTest.js    # 8 settlement unit tests
│   │   ├── settleupServiceTest.js         # 6 Facade service tests
│   │   └── splitStrategyTest.js           # 8 Strategy pattern tests
│   ├── utils/
│   │   ├── notificationObserver.js        # Observer pattern implementation
│   │   ├── responseFactory.js             # Factory pattern implementation
│   │   └── splitStrategies.js             # Strategy pattern implementation
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── TaskForm.jsx
│   │   │   └── TaskList.jsx
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── expenses/
│   │   │   │   ├── ExpenseList.jsx
│   │   │   │   ├── AddExpense.jsx
│   │   │   │   └── EditExpense.jsx
│   │   │   ├── groups/
│   │   │   │   ├── GroupList.jsx
│   │   │   │   ├── AddGroup.jsx
│   │   │   │   └── EditGroup.jsx
│   │   │   ├── notifications/
│   │   │   │   └── Notifications.jsx
│   │   │   ├── profile/
│   │   │   │   ├── Profile.jsx
│   │   │   │   ├── EditProfile.jsx
│   │   │   │   └── ChangePassword.jsx
│   │   │   └── settlements/
│   │   │       ├── AddSettlement.jsx
│   │   │       ├── BalanceDashboard.jsx
│   │   │       └── SettlementList.jsx
│   │   ├── axiosConfig.jsx
│   │   ├── App.js
│   │   └── index.css
│   ├── tailwind.config.js
│   └── package.json
├── .github/
│   └── workflows/
│       └── ci.yml                         # GitHub Actions CI/CD pipeline
└── README.md
```

---

## Local Setup Instructions

### Prerequisites
- Node.js v22 or higher
- A MongoDB Atlas account
- Git

### Step 1 — Clone the repository

```bash
git clone https://github.com/Dushyant93/ExpenseSharingSystem.git
cd ExpenseSharingSystem
```

### Step 2 — Install all dependencies

```bash
npm run install-all
```

This installs both backend and frontend dependencies in one command.

### Step 3 — Set up environment variables

Create a file called `.env` inside the `backend/` folder (use `.env.example` as a template):

```
MONGO_URI=mongodb+srv://username:password@cluster0.ygzsphl.mongodb.net/settleup?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

> Contact the author for MongoDB credentials, or create your own cluster at [MongoDB Atlas](https://cloud.mongodb.com).

### Step 4 — Run the project locally

```bash
npm run dev
```

- Frontend runs on: `http://localhost:3000`
- Backend runs on:  `http://localhost:5000`

---

## Running Tests

```bash
cd backend
npm test
```

Expected output: **70 passing** tests across 8 test files.

| Test File                        | Tests | Coverage                                        |
|----------------------------------|-------|-------------------------------------------------|
| `expenseControllerTest.js`       | 10    | Create, Read All, Read One, Update, Delete      |
| `groupControllerTest.js`         | 14    | CRUD + getGroupById + addMember (4 cases)       |
| `notificationControllerTest.js`  | 8     | Get all, unread count, mark all read, mark one  |
| `observerAndFactoryTest.js`      | 8     | Observer pattern + ResponseFactory shape        |
| `profileControllerTest.js`       | 8     | getProfile, updateProfile, changePassword       |
| `settlementControllerTest.js`    | 8     | Create, Get by group, Delete, Get balances      |
| `settleupServiceTest.js`         | 6     | Balance calc (equal/percent/settlement), summary|
| `splitStrategyTest.js`           | 8     | Equal, Percentage, Exact strategies + factory   |

### Unit Testing Approach

Tests use **Mocha** (test runner), **Chai** (assertions), and **Sinon** (stubs/spies/sandboxes).

All tests run without a live database connection — every MongoDB model method (`find`, `create`, `findById`, etc.) is stubbed using `sinon.createSandbox()`. Sandboxes are created in `beforeEach` and restored in `afterEach` to prevent stub leakage between tests.

Key patterns used:
- **Sandbox pattern** — `sinon.createSandbox()` auto-restores all stubs, preventing "already wrapped" errors across tests
- **Chained stub mocking** — Methods like `.populate().sort()` are stubbed as a fluent chain to match controller internals
- **Observer isolation** — `expenseEmitter.notify` is stubbed in expense tests so the Observer never reaches the real database
- **Facade stubbing** — Settlement balance tests stub `settleUpService.calculateGroupBalances` directly rather than individual models

### Test Case Summary

**Expense Controller (10 tests)**
1. Create expense → 201 on success
2. Create expense → 500 on DB error
3. Get all expenses → 200 with populated list
4. Get all expenses → 500 on DB error
5. Update expense → 200 on success
6. Update expense → 404 if not found
7. Delete expense → 200 on success
8. Delete expense → 404 if not found
9. Get expense by ID → 200 with single record
10. Get expense by ID → 404 if not found

**Group Controller (14 tests)**
1. Get all groups → 200 with list
2. Get all groups → 500 on DB error
3. Create group → 201 on success
4. Create group → 500 on DB error
5. Update group → 200 on success
6. Update group → 404 if not found
7. Delete group → 200 on success
8. Delete group → 404 if not found
9. Get group by ID → 200 on success
10. Get group by ID → 404 if not found
11. Add member → 200 on success
12. Add member → 404 if user email not found
13. Add member → 404 if group not found
14. Add member → 400 if user already in group

**Notification Controller (8 tests)**
1. Get notifications → 200 on success
2. Get notifications → 500 on DB error
3. Get unread count → returns count
4. Get unread count → returns 0 when all read
5. Mark all as read → 200 on success
6. Mark all as read → 500 on DB error
7. Mark single as read → 200 on success
8. Mark single as read → 404 if not found

**Observer & Factory (8 tests)**
1. Observer: no crash when group has no members (null group)
2. Factory: createSuccess returns correct shape and statusCode 200
3. Factory: createSuccess with custom message returns 201
4. Factory: createError returns 500 by default
5. Factory: createNotFound returns 404 with resource name in message
6. Factory: send() calls res.status and res.json correctly
7. Factory: send() passes correct status for error responses
8. Factory: send() passes 404 for not-found responses

**Profile Controller (8 tests)**
1. Get profile → 200 with user data
2. Get profile → 404 if user not found
3. Get profile → 500 on DB error
4. Update profile → 200 on success
5. Update profile → 404 if user not found
6. Change password → 200 when current password is correct
7. Change password → 400 if current password is wrong
8. Change password → 404 if user not found

**Settlement Controller (8 tests)**
1. Create settlement → 201 on success
2. Create settlement → 500 on DB error
3. Get settlements by group → 200 with list
4. Get settlements by group → 500 on DB error
5. Delete settlement → 200 on success
6. Delete settlement → 404 if not found
7. Get group balances → 200 using Facade service
8. Get group balances → 500 on service error

**SettleUp Service / Facade (6 tests)**
1. Calculate balances → correct net for equal split
2. Calculate balances → uses splitResult for percentage split
3. Calculate balances → reduces balance when settlement is recorded
4. Calculate balances → empty balances with zero total for no expenses
5. Get group summary → returns correct counts and totals
6. Get group summary → returns null if group not found

**Split Strategy (8 tests)**
1. EqualSplitStrategy → splits equally between members
2. EqualSplitStrategy → returns empty array for no members
3. PercentageSplitStrategy → splits by percentage
4. ExactSplitStrategy → uses exact amounts provided
5. Factory: getSplitStrategy('equal') → EqualSplitStrategy
6. Factory: getSplitStrategy('percentage') → PercentageSplitStrategy
7. Factory: getSplitStrategy('exact') → ExactSplitStrategy
8. Factory: getSplitStrategy('unknown') → defaults to EqualSplitStrategy

---

## API Endpoints

### Health Check
| Method | Route        | Description                  |
|--------|--------------|------------------------------|
| GET    | /api/health  | Check if API is running      |

### Authentication
| Method | Route                  | Description                         |
|--------|------------------------|-------------------------------------|
| POST   | /api/auth/register     | Register new user                   |
| POST   | /api/auth/login        | Login and get JWT                   |
| GET    | /api/auth/profile      | Get current user profile (protected)|
| PUT    | /api/auth/profile      | Update profile (protected)          |
| GET    | /api/auth/search?email | Find user by email (protected)      |

### Expenses (all require Authorization header)
| Method | Route               | Description               |
|--------|---------------------|---------------------------|
| GET    | /api/expenses       | Get all user expenses     |
| POST   | /api/expenses       | Create a new expense      |
| GET    | /api/expenses/:id   | Get a single expense      |
| PUT    | /api/expenses/:id   | Update an expense         |
| DELETE | /api/expenses/:id   | Delete an expense         |

### Groups (all require Authorization header)
| Method | Route                      | Description                    |
|--------|----------------------------|--------------------------------|
| GET    | /api/groups                | Get all user groups            |
| POST   | /api/groups                | Create a new group             |
| GET    | /api/groups/:id            | Get a single group             |
| PUT    | /api/groups/:id            | Update a group                 |
| DELETE | /api/groups/:id            | Delete a group                 |
| POST   | /api/groups/:id/members    | Add a member to group by email |

### Settlements (all require Authorization header)
| Method | Route                           | Description                          |
|--------|---------------------------------|--------------------------------------|
| POST   | /api/settlements                | Create a settlement                  |
| GET    | /api/settlements/group/:groupId | Get settlements by group             |
| GET    | /api/settlements/balances/:groupId | Get net balances for a group      |
| DELETE | /api/settlements/:id            | Delete a settlement                  |

### Notifications (all require Authorization header)
| Method | Route                            | Description                   |
|--------|----------------------------------|-------------------------------|
| GET    | /api/notifications               | Get notifications for user    |
| GET    | /api/notifications/unread-count  | Get count of unread           |
| PUT    | /api/notifications/mark-all-read | Mark all notifications read   |
| PUT    | /api/notifications/:id/read      | Mark one notification as read |

### Profile (all require Authorization header)
| Method | Route                        | Description                  |
|--------|------------------------------|------------------------------|
| GET    | /api/profile                 | Get profile with stats       |
| PUT    | /api/profile                 | Update name/email            |
| PUT    | /api/profile/change-password | Change password              |

---

## CI/CD Pipeline

Automated deployment is configured using **GitHub Actions** and a **self-hosted runner** on AWS EC2.

Pipeline file: `.github/workflows/ci.yml`

Every push to `main` (and every pull request targeting `main`):

1. **Checkout** — checks out the latest code
2. **Setup Node.js** — installs Node.js v22 (matrix strategy)
3. **Install Dependencies** — runs `npm install` in `./backend`
4. **Verify Secrets** — confirms `MONGO_URI` is set in the environment
5. **Run Tests** — executes the full test suite via `npm test` using `MONGO_URI` and `JWT_SECRET` from GitHub Secrets
6. **Restart PM2** — restarts the backend and frontend processes via PM2 on the EC2 runner if all tests pass

Sensitive environment variables (`MONGO_URI`, `JWT_SECRET`) are stored as **GitHub repository secrets** and injected at runtime — they are never committed to the repository.

---

## Tech Stack

| Layer     | Technology                                         |
|-----------|----------------------------------------------------|
| Frontend  | React.js, React Router, Axios, Tailwind CSS        |
| Backend   | Node.js, Express.js                                |
| Database  | MongoDB Atlas, Mongoose                            |
| Auth      | JWT (JSON Web Tokens), bcrypt                      |
| Testing   | Mocha, Chai, Sinon                                 |
| Patterns  | Strategy, Factory, Observer, Facade                |
| CI/CD     | GitHub Actions, self-hosted EC2 runner             |
| Hosting   | AWS EC2 (Ubuntu), PM2, Nginx                       |
