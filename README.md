# SettleUp — Expense Sharing System

A full-stack CRUD web application for tracking shared expenses within groups.  
Built with **Node.js + Express + MongoDB** (backend) and **React.js** (frontend).  


---

## Public URL

```

```

> EC2 public IP.

---

## Project Credentials (for demo access)

| Field    | Value              |
|----------|--------------------|
| Username | dushyant@mail.com  |
| Password | dushyant          |

---

## Features

- **User Authentication** — Register, Login, Logout with JWT
- **Group Management** — Create, Read, Update, Delete expense groups
- **Expense Management** — Create, Read, Update, Delete expenses linked to groups
- **Dashboard** — Overview of all groups and recent expenses
- **Protected Routes** — All pages require authentication

---

## Project Structure

```
ExpenseSharingSystem/
├── backend/
│   ├── controllers/
│   │   ├── expenseController.js   # CRUD for expenses
│   │   └── groupController.js     # CRUD for groups
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT verification middleware
│   ├── models/
│   │   ├── Expense.js             # Expense schema
│   │   ├── Group.js               # Group schema
│   │   └── User.js                # User schema 
│   ├── routes/
│   │   ├── authRoutes.js          # Login & register routes 
│   │   ├── expenses.js            # Expense routes
│   │   └── groups.js              # Group routes
│   ├── tests/
│   │   ├── expenseController.test.js   # 8 expense test cases
│   │   └── groupController.test.js     # 8 group test cases
│   ├── .env                       # Environment variables 
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── pages/
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
│   │   │   └── Dashboard.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
├── .github/
│   └── workflows/
│       └── backend-ci.yml         # CI/CD pipeline
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
https://github.com/Dushyant93/ExpenseSharingSystem.git
cd ExpenseSharingSystem
```

### Step 2 — Install all dependencies

```bash
npm run install-all
```

This installs both backend and frontend dependencies in one command.

### Step 3 — Set up environment variables

Create a file called `.env` inside the `backend/` folder:

```
MONGO_URI=ongodb+srv://username:pass@cluster0.ygzsphl.mongodb.net/settleup?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=please contact the author
PORT=5000
```
> please contact author for the user name and password

> Get your MongoDB connection string from [MongoDB Atlas](https://cloud.mongodb.com/v2/69cb10e12dc4a94bd791d4eb#/explorer/69cb11b74210f1537d22121f/settleup)

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

Expected output: **16 passing** tests (8 for expenses, 8 for groups)

---

## API Endpoints

### Authentication
| Method | Route                | Description        |
|--------|----------------------|--------------------|
| POST   | /api/auth/register   | Register new user  |
| POST   | /api/auth/login      | Login and get JWT  |

### Expenses (all require Authorization header)
| Method | Route                | Description              |
|--------|----------------------|--------------------------|
| GET    | /api/expenses        | Get all user expenses    |
| POST   | /api/expenses        | Create a new expense     |
| GET    | /api/expenses/:id    | Get a single expense     |
| PUT    | /api/expenses/:id    | Update an expense        |
| DELETE | /api/expenses/:id    | Delete an expense        |

### Groups (all require Authorization header)
| Method | Route                | Description              |
|--------|----------------------|--------------------------|
| GET    | /api/groups          | Get all user groups      |
| POST   | /api/groups          | Create a new group       |
| GET    | /api/groups/:id      | Get a single group       |
| PUT    | /api/groups/:id      | Update a group           |
| DELETE | /api/groups/:id      | Delete a group           |

---

## CI/CD Pipeline

Automated deployment is configured using **GitHub Actions** and a **self-hosted runner** on AWS EC2.

Every push to the `main` branch:
1. Checks out the code
2. Sets up Node.js v22
3. Installs dependencies
4. Runs all 16 test cases
5. Restarts the app on EC2 using PM2

See `.github/workflows/backend-ci.yml` for the full pipeline configuration.

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React.js, React Router, Axios     |
| Backend   | Node.js, Express.js               |
| Database  | MongoDB Atlas, Mongoose           |
| Auth      | JWT (JSON Web Tokens)             |
| Testing   | Mocha, Chai, Sinon                |
| CI/CD     | GitHub Actions, self-hosted runner|
| Hosting   | AWS EC2 (Ubuntu), PM2, Nginx      |

---


