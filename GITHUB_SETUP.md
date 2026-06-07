# 🚀 GitHub Setup Guide

Dự án của bạn đã sẵn sàng để push lên GitHub! 

## 📋 Những gì đã được chuẩn bị:

✅ **Code cleaned & organized**
- `.gitignore` configured (hides node_modules, .next, .env, build files)
- `.gitattributes` set for proper line endings
- Source code committed: 42 files

✅ **Executable built**
- Windows EXE: `release/QuanLyCuaHangSach-1.0.0.exe`
- Standalone executable, no installation needed

✅ **Documentation created**
- `CONTRIBUTING.md` - Contributor guidelines
- `AGENTS.md` - AI agent setup guide  
- `.github/` templates - Issue & PR templates
- Updated `README.md` with GitHub-friendly setup

✅ **Git ready**
- Initialized local repository
- Initial commit created: `Initial commit: Bookstore Management System`

---

## 📤 Cách Push Lên GitHub

### 1️⃣ Tạo GitHub Repository

1. Đăng nhập [github.com](https://github.com)
2. Click **"+" → "New repository"**
3. Đặt tên (vd: `bookstore-manager`)
4. **DON'T** initialize with README/gitignore (đã có)
5. Click **"Create repository"**

### 2️⃣ Kết Nối Remote Repository

```bash
cd e:\ap
git remote add origin https://github.com/YOUR_USERNAME/bookstore-manager.git
git branch -M main
git push -u origin main
```

### 3️⃣ Push EXE as Release

Sau khi push code:

1. Vào GitHub repo → **"Releases"**
2. Click **"Create a new release"**
3. Tag: `v1.0.0`
4. Title: `Quản lý Cửa Hàng Bán Sách v1.0.0`
5. Upload `release/QuanLyCuaHangSach-1.0.0.exe`
6. Publish release

---

## 🔗 Remote URLs

Chọn một trong hai:

### HTTPS (Dễ, nhưng cần password mỗi lần)
```bash
git remote add origin https://github.com/YOUR_USERNAME/bookstore-manager.git
```

### SSH (An toàn, một lần setup)
```bash
git remote add origin git@github.com:YOUR_USERNAME/bookstore-manager.git
```

---

## ✨ Những gì trên GitHub

| Item | Vị trí | Mục đích |
|------|--------|---------|
| Source Code | `main` branch | Quản lý code, contribute |
| EXE | Releases | Người dùng tải xuống & chạy |
| Issues | GitHub Issues | Bug reports & feature requests |
| PRs | Pull Requests | Code review & collaboration |
| Docs | README, CONTRIBUTING, AGENTS | Hướng dẫn |

---

## 📚 Quick Commands

```bash
# Check status
git status

# See commits
git log --oneline

# Add & commit
git add .
git commit -m "description"

# Push to GitHub
git push origin main

# Pull latest
git pull origin main
```

---

## 🎯 Next Steps

1. ✅ Push code to GitHub
2. ✅ Create releases with EXE
3. ⏳ Share repo link
4. ⏳ Invite collaborators (Settings → Collaborators)
5. ⏳ Enable issues/discussions for community

---

## ❓ Cần Giúp?

- **Git Help**: `git --help`
- **GitHub Docs**: https://docs.github.com
- **Git Tutorial**: https://git-scm.com/book/en/v2

---

**Ready to share! 🚀**
