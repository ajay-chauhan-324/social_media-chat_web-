# 🚀 Social Media Chat Web

A modern **Full Stack MERN Social Media & Real-Time Chat Application** where users can connect, chat, follow each other, and share posts in a clean and responsive interface.

🌐 **Live Demo:** https://social-media-chat-web.vercel.app/  
💻 **GitHub Repository:** https://github.com/ajay-chauhan-324/social_media-chat_web-

---

## ✨ Features

### 🔐 Authentication
- User Registration & Login
- JWT Authentication
- Secure Password Hashing
- Protected Routes

### 👤 User Profile
- Edit Profile
- Upload Profile Picture
- Bio & Personal Information
- View Other Users' Profiles

### 🤝 Social Features
- Follow / Unfollow Users
- User Suggestions
- Explore Users
- Search Users
- Notifications

### 💬 Real-Time Chat
- One-to-One Messaging
- Instant Message Delivery using Socket.IO
- Online / Offline Status
- Chat History
- Delete Chat Messages
- Responsive Chat UI

### 📷 Posts
- Create Posts
- Upload Images
- Like & Unlike Posts
- Comment on Posts
- Delete Own Posts
- View Feed

### 🎨 UI/UX
- Fully Responsive Design
- Modern Dark Theme
- Mobile Friendly
- Smooth Navigation
- Beautiful Animations

---

# 🛠️ Tech Stack

## Frontend
- React.js
- Vite
- Tailwind CSS
- Redux Toolkit
- React Router DOM
- Axios
- Socket.IO Client

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Bcrypt.js
- Socket.IO
- Cloudinary
- Multer

## Deployment
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

---

# 📁 Folder Structure

```
social_media-chat_web/
│
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── socket/
│   ├── config/
│   └── package.json
│
└── README.md
```

---

# ⚙️ Installation

## 1. Clone Repository

```bash
git clone https://github.com/ajay-chauhan-324/social_media-chat_web-.git
```

```bash
cd social_media-chat_web-
```

---

## 2. Install Dependencies

### Frontend

```bash
cd client
npm install
```

### Backend

```bash
cd ../server
npm install
```

---

## 3. Environment Variables

Create a `.env` file inside the **server** folder.

```env
PORT=5000

MONGO_URI=Your_MongoDB_URI

JWT_SECRET=Your_JWT_Secret

CLOUDINARY_CLOUD_NAME=Your_Cloud_Name
CLOUDINARY_API_KEY=Your_Api_Key
CLOUDINARY_API_SECRET=Your_Api_Secret

CLIENT_URL=http://localhost:5173
```

Create a `.env` file inside the **client** folder.

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

# ▶️ Run Locally

### Start Backend

```bash
cd server
npm run dev
```

### Start Frontend

```bash
cd client
npm run dev
```

Open:

```
http://localhost:5173
```

---


# 📌 Future Improvements

- ✅ Group Chats
- ✅ Voice Messages
- ✅ Video Calling
- ✅ Read Receipts
- ✅ Typing Indicator
- ✅ Story Feature
- ✅ Push Notifications
- ✅ AI Chat Assistant
- ✅ Message Reactions
- ✅ End-to-End Encryption

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/NewFeature
```

3. Commit your changes

```bash
git commit -m "Add New Feature"
```

4. Push your branch

```bash
git push origin feature/NewFeature
```

5. Open a Pull Request

---

# 👨‍💻 Author

**Ajay Chauhan**

📧 Email: imchauhanajay.com  
💻 GitHub: https://github.com/ajay-chauhan-324

Portfolio: https://portfolio-swart-gamma-40.vercel.app/



---

# ⭐ Support

If you found this project useful, please consider giving it a **⭐ Star** on GitHub. It helps support the project and motivates future development.

---

## 📄 License

This project is licensed under the **MIT License**.

---

### Built with ❤️ using the MERN Stack
