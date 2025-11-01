# KiddoEvents - Kids Event Booking Platform

## Getting Started

### Prerequisites
- Node.js & npm
- MySQL server

### 1. Backend Setup

#### a. Configure `.env`
Create a `.env` file in the `backend/` directory with the following (use actual values):
```
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-app-password
MYSQL_HOST=localhost
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=kiddoevents
MOMO_API_KEY=YOUR_MOMO_KEY
MOMO_API_SECRET=YOUR_MOMO_SECRET
```

#### b. Install Dependencies
```
cd backend
npm install express mysql2 nodemailer cors dotenv
```

#### c. Initialize Database
Run the provided SQL script to create the tables:
```
mysql -u your_mysql_user -p kiddoevents < database.sql
```

#### d. Start Backend
```
node server.js
```

### 2. Frontend Setup

```
cd frontend
npm install
npm start
```

- React app will run on [http://localhost:3000]
- Backend runs on [http://localhost:5000]

### 3. MoMo API

- Add your MoMo Mobile Money API credentials to your `.env` in backend.
- Integrate payment logic in backend where marked (currently a stub).

---

### Need Help?
- To test booking flow, add sample events to the events table or expand backend with admin endpoints for adding them.
- Email will be sent via Gmail - ensure you create an app password for Nodemailer if using 2FA.
