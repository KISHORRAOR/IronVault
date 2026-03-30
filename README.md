🔐 IronVault

IronVault is a secure password manager built with a full-stack architecture. It allows users to store, manage, and analyze their credentials with encryption, authentication, and security insights.

---

🚀 Features

- 🔐 AES Encryption for all stored passwords
- 🔑 JWT-based Authentication & Session Management
- 📊 Security Score Dashboard (Weak, Expired, Breached)
- 📥 CSV Import with Duplicate Protection
- 🔍 Search, Filter, and Sort Credentials
- ⭐ Favourite Credentials
- 📜 Audit Logs for user activity
- ⚡ Token Refresh & Auto Logout
- 🛡️ Rate Limiting & Security Headers

---

🧠 How It Works

🔐 Authentication

- Users login/register securely
- JWT token is issued and stored in session

🔒 Encryption

- All passwords are encrypted using AES
- Encryption key is stored securely in ".env"
- Decryption happens only when needed

🗄️ Credential Storage

- Stored in MongoDB
- Duplicate prevention using:
  userId + siteName + username

📊 Security Analysis

- Weak password detection
- Expired password detection (>90 days)
- Breach detection using HaveIBeenPwned API

---

🛠️ Tech Stack

Frontend

- HTML, CSS, JavaScript
- CryptoJS (AES encryption)

Backend

- Node.js
- Express.js
- MongoDB + Mongoose

Security

- JWT Authentication
- Helmet
- Rate Limiting

---

📁 Project Structure

ironvault/
├── api/            # Backend (routes, models, middleware)
├── public/         # Frontend (HTML, CSS, JS)
├── package.json
├── .gitignore
├── .env.example

---

⚙️ Setup Instructions

1️⃣ Clone the repository

git clone https://github.com/your-username/ironvault.git
cd ironvault

---

2️⃣ Install dependencies

npm install

---

3️⃣ Create ".env" file

MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
AES_SECRET=your_encryption_key

---

4️⃣ Run the server

node index.js

---

📥 Import Credentials (Optional)

node import.js
node refreshData.js

---

🔐 Security Notes

- ".env" file is not pushed to GitHub
- All passwords are encrypted before storage
- Tokens are validated on every request

---

🎯 Future Improvements

- Move encryption fully to backend
- Add password reuse detection
- Add graphical analytics dashboard
- Enable multi-device sync

---

👨‍💻 Author

Kishor

---

⭐ If you like this project

Give it a ⭐ on GitHub!
