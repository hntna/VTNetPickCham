# 🏓 VTNet Pickleball Championship 2026

Trang web hiển thị kết quả Giải Pickleball Đôi Nam VTNet 2026.

## 🚀 Tính năng / Features

- **Vòng Bảng**: 6 bảng round-robin, bảng xếp hạng real-time
- **Vòng Knock-out**: 1/16 → Tứ kết → Bán kết → Chung kết
- **Admin Panel**: Đăng nhập → Nhập tỷ số → Auto-sync
- **Real-time**: Firebase Realtime Database, không cần refresh
- **Responsive**: Tối ưu cho điện thoại

## 📋 Hướng dẫn Setup Firebase

### Bước 1: Tạo Firebase Project
1. Truy cập [console.firebase.google.com](https://console.firebase.google.com)
2. Bấm **"Create a project"** (hoặc "Tạo dự án")
3. Đặt tên: `vtnet-pickleball` → Bấm Continue
4. Tắt Google Analytics (không cần) → Bấm Create Project

### Bước 2: Bật Authentication
1. Trong Firebase Console, chọn **Authentication** → **Get Started**
2. Tab **Sign-in method** → Bật **Email/Password**
3. Tab **Users** → Bấm **Add user**
4. Nhập email admin (vd: `admin@vtnet.vn`) và password → Bấm Add

### Bước 3: Tạo Realtime Database
1. Chọn **Realtime Database** → **Create Database**
2. Chọn region: **Singapore** (gần VN nhất)
3. Chọn **Start in test mode** → Bấm Enable
4. Vào tab **Rules**, thay bằng:
```json
{
  "rules": {
    "scores": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```
5. Bấm **Publish**

### Bước 4: Lấy Firebase Config
1. Vào **Project Settings** (biểu tượng ⚙️)
2. Kéo xuống **Your apps** → Bấm biểu tượng `</>` (Web)
3. Đặt tên app: `pickleball-web` → Bấm Register app
4. Copy đoạn `firebaseConfig` → Dán vào file `js/firebase-config.js`

### Bước 5: Cập nhật Config
Mở file `js/firebase-config.js`, thay `FIREBASE_CONFIG`:
```javascript
const FIREBASE_CONFIG = {
  apiKey: "AIzaSy...",
  authDomain: "vtnet-pickleball.firebaseapp.com",
  databaseURL: "https://vtnet-pickleball-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "vtnet-pickleball",
  storageBucket: "vtnet-pickleball.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## 🌐 Deploy lên GitHub Pages

1. Tạo repository trên GitHub
2. Push code:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/VTNetPickCham.git
git push -u origin main
```
3. Vào GitHub repo → **Settings** → **Pages**
4. Source: **Deploy from a branch** → Branch: `main`, folder: `/ (root)`
5. Bấm Save → Trang web live tại: `https://USERNAME.github.io/VTNetPickCham/`

## 📱 Sử dụng

- **Xem kết quả**: Mở `index.html` hoặc URL GitHub Pages
- **Nhập tỷ số**: Mở `admin.html` → Đăng nhập → Chọn trận → Nhập score → Lưu
