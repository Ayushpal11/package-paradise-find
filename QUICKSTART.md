# Quick Start Guide

Get Package Paradise running locally in 15 minutes!

## Prerequisites Check ✅

Before starting, make sure you have:
- ✅ Node.js 18+ installed ([Download](https://nodejs.org))
- ✅ npm or yarn installed
- ✅ A PostgreSQL database (we'll help you set one up)

## Step 1: Clone & Install (2 min)

```bash
# Clone the repository
git clone <your-repo-url>
cd package-paradise-find

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
cd ..
```

## Step 2: Database Setup

**📚 Full instructions**: See [DATABASE_SETUP.md](DATABASE_SETUP.md) for complete guide.

### Quick Options:

**Option A: Neon (Cloud - Recommended) ⭐**
- Go to https://neon.tech
- Create account → Create project
- Copy connection string
- 5 minutes setup

**Option B: Local PostgreSQL**
- Install PostgreSQL
- Create database `travel_packages`
- Set up connection
- 15-20 minutes setup

👉 **For detailed steps, troubleshooting, and tips, check [DATABASE_SETUP.md](DATABASE_SETUP.md)**

## Step 3: Configure Environment (2 min)

### Frontend

Create `.env` in the frontend directory:
```bash
cd frontend
cp .env.example .env
# Edit .env if needed
cd ..
```

### Backend

Create `backend/.env`:
```bash
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL
cd ..
```

**Replace** database credentials in `backend/.env` with your actual values.

## Step 4: Start the Backend (2 min)

```bash
cd backend

# Start the server
npm start
```

You should see:
```
✅ Connected to PostgreSQL database
📦 Initializing database tables...
✅ Database tables initialized successfully
🚀 Server running on port 3001
```

Keep this terminal open!

## Step 5: Seed Sample Data (1 min)

In a new terminal:
```bash
cd backend
npm run seed
```

You should see:
```
✅ Database seeded successfully!
📊 Summary:
   Vendors: 5
   Packages: 7
```

## Step 6: Start the Frontend (2 min)

In a new terminal (in the frontend directory):
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: use --host to expose
```

## Step 7: Open in Browser (1 min)

Open http://localhost:8080 in your browser

You should see the **Package Paradise** homepage!

## 🎉 Test It Out!

1. **Search for packages**: Enter "Bali" as destination
2. **View results**: See packages from OTAs and local vendors
3. **Apply filters**: Try price range, hotel stars, etc.
4. **View details**: Click on any package
5. **Submit enquiry**: Try the enquiry form on local vendor packages

## 🐛 Troubleshooting

### Backend won't start
- **Check database**: Make sure PostgreSQL is running
- **Verify DATABASE_URL**: Connection string must be correct
- **Check port**: Make sure nothing else is using port 3001

### Database connection error
- **Neon**: Make sure database isn't paused
- **Local**: Ensure PostgreSQL service is running
- **Connection string**: Double-check your credentials

### Frontend can't connect
- **Check backend**: Is it running on port 3001?
- **Check VITE_API_URL**: Should be http://localhost:3001
- **Look at console**: Open browser DevTools to see errors

### No packages showing
- **Did you seed?**: Run `npm run seed` in backend directory
- **Check backend logs**: Look for SQL errors
- **Try health check**: Visit http://localhost:3001/health

## 🎓 What's Next?

- ✅ Frontend and backend running locally
- ✅ Sample data loaded
- ✅ Full CRUD operations working

Now you can:
1. **Customize**: Add your own packages
2. **Deploy**: Follow the [DEPLOYMENT.md](DEPLOYMENT.md) guide
3. **Extend**: Add new features

## 📚 Next Steps

- Read the [README.md](README.md) for project overview
- Check [DEPLOYMENT.md](DEPLOYMENT.md) to deploy to production
- Explore the code in `src/` and `backend/src/`

## 🆘 Still Stuck?

1. Check backend terminal for errors
2. Check frontend console (F12 → Console)
3. Verify all environment variables
4. Try restarting both servers
5. Check the [DEPLOYMENT.md](DEPLOYMENT.md) troubleshooting section

## 🎉 Success Checklist

- [ ] Backend running on :3001
- [ ] Frontend running on :8080
- [ ] Database seeded with data
- [ ] Homepage loads
- [ ] Search returns results
- [ ] Filters work
- [ ] Enquiry form submits

If all checked, you're ready to go! 🚀

---

**Happy coding!** 💻✨

