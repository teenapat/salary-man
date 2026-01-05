# 💰 Salary Man - Personal Finance Tracker

A mobile-first personal finance tracking application designed for **salaried employees** who want to take control of their spending, especially credit card expenses.

## 🎯 Goals

### Primary Objectives
1. **Track Monthly Cash Flow** - Monitor income vs expenses each month at a glance
2. **Credit Card Management** - Track multiple credit cards and their outstanding balances
3. **Installment Tracking** - Keep track of installment payments (ผ่อนชำระ) across months
4. **Deficit Carry-Over** - When expenses exceed income, carry the deficit to next month
5. **Partial Payment Handling** - Record partial credit card payments with interest tracking

### Target User
- Thai salaried employees
- People with multiple credit cards
- Those who want a simple, mobile-friendly expense tracker
- Users who prefer manual entry over bank sync (for privacy/control)

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | NestJS + Prisma ORM |
| **Frontend** | Next.js 14 (App Router) + Tailwind CSS |
| **Database** | SQL Server (Express) |
| **UI/UX** | Mobile-first, Dark theme, Framer Motion |

## 📁 Project Structure

```
salary-man/
├── apps/
│   ├── api/          # NestJS Backend
│   │   ├── prisma/   # Database schema
│   │   └── src/      # API source code
│   └── web/          # Next.js Frontend
│       └── src/      # React components & pages
├── docker-compose.yml
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- SQL Server Express (with Windows Authentication)
- npm or yarn

### 1. Clone & Install Dependencies

```bash
git clone <repo-url>
cd salary-man

# Install API dependencies
cd apps/api
npm install

# Install Web dependencies
cd ../web
npm install
```

### 2. Configure Database

Create `apps/api/.env` file:

```env
# SQL Server with Windows Authentication
DATABASE_URL="sqlserver://YOUR-PC-NAME%5CSQLEXPRESS;database=salary_man;integratedSecurity=true;trustServerCertificate=true"
```

> ⚠️ Replace `YOUR-PC-NAME` with your actual computer name. Use `%5C` instead of `\` for the SQL Server instance separator.

### 3. Setup Database

```bash
cd apps/api

# Push schema to database (creates tables)
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### 4. Seed Initial Data

Start the API first, then call the seed endpoint:

```bash
# In apps/api
npm run start:dev
```

Then in another terminal or browser:
```bash
# Seed accounts (Cash, Credit Cards, etc.)
curl -X POST http://localhost:3001/accounts/seed
```

### 5. Start Development Servers

**Terminal 1 - API (Port 3001):**
```bash
cd apps/api
npm run start:dev
```

**Terminal 2 - Web (Port 3000):**
```bash
cd apps/web
npm run dev
```

### 6. Open the App

Visit [http://localhost:3000](http://localhost:3000) on your browser or mobile device.

## 📱 Features

### Core Features
- ✅ **Dashboard** - Monthly summary with income/expense/net
- ✅ **Add Transaction** - Quick entry with account selection
- ✅ **Installment Support** - Create multi-month installment entries
- ✅ **Account Management** - View per-card/account summaries
- ✅ **Timeline View** - Recent transactions grouped by date
- ✅ **Swipe to Delete** - Mobile-friendly transaction deletion
- ✅ **Carry Over** - Move deficit to next month
- ✅ **Partial Payment** - Pay partial amount, carry balance + interest

### Account Types
| Type | Description |
|------|-------------|
| `CASH` | Cash/เงินสด |
| `CREDIT_CARD` | Credit cards |
| `BANK_ACCOUNT` | Bank accounts |
| `CARRY_OVER` | System account for carried balances |

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/summary/:year/:month` | Monthly summary |
| GET | `/summary/account/:id/:year/:month` | Account summary |
| POST | `/transactions` | Create transaction |
| POST | `/transactions/installment` | Create installment |
| POST | `/transactions/carry-over` | Carry deficit to next month |
| POST | `/transactions/partial-payment` | Record partial payment |
| DELETE | `/transactions/:id` | Delete transaction |
| POST | `/accounts/seed` | Seed initial accounts |

## 🎨 UI Theme

The app uses a custom dark theme optimized for mobile:

```css
--sm-bg: #0a0a0f
--sm-surface: #12121a
--sm-accent: #6366f1 (Indigo)
--sm-income: #22c55e (Green)
--sm-expense: #f87171 (Red)
```

## 📝 License

MIT

---

Built with ❤️ for Thai salaried workers who want financial freedom.

