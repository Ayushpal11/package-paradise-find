# Package Paradise - Travel Package Comparison Engine

A meta-comparison platform for travel packages (Flights + Hotels + Transfers + Sightseeing), similar to Skyscanner but focused on holiday packages from multiple OTAs and local vendors.

![Package Paradise](https://img.shields.io/badge/Status-MVP%20Ready-success?style=flat-square)
![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=flat-square)

## 🌟 Features

- 🔍 **Smart Search**: Search packages by origin, destination, dates, and travellers
- 📊 **Compare**: Side-by-side comparison of packages from OTAs (MakeMyTrip, Yatra, etc.) and local vendors
- 🎯 **Advanced Filters**: Price range, hotel stars, meals, transfers, refundability
- 💼 **Vendor Management**: Separate tabs for OTA vs Local vendor packages
- 📝 **Enquiry System**: Submit enquiries for local packages directly through the platform
- 📱 **Responsive**: Beautiful, modern UI that works on all devices

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (React + TypeScript + Vite)                   │
│  - Hosted on Vercel (Free Tier)                         │
│  - TailwindCSS + shadcn/ui components                   │
│  - React Query for data fetching                        │
└───────────────────┬─────────────────────────────────────┘
                    │ API Calls (REST)
┌───────────────────▼─────────────────────────────────────┐
│  Backend (Node.js + Express)                            │
│  - Hosted on Render (Free Tier)                         │
│  - PostgreSQL database                                  │
│  - RESTful API endpoints                                │
└───────────────────┬─────────────────────────────────────┘
                    │ SQL Queries
┌───────────────────▼─────────────────────────────────────┐
│  Database (PostgreSQL)                                  │
│  - Neon / Supabase (Free Tier)                          │
│  - Vendors, Packages, Enquiries tables                  │
└─────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
package-paradise-find/
├── frontend/                     # Frontend React app
│   ├── src/
│   │   ├── assets/               # Images and static files
│   │   ├── components/           # React components
│   │   │   ├── ui/               # shadcn/ui components
│   │   │   ├── EnquiryForm.tsx   # Enquiry submission form
│   │   │   ├── FilterSidebar.tsx # Package filters
│   │   │   ├── PackageCard.tsx   # Package display card
│   │   │   └── SearchBar.tsx     # Main search component
│   │   ├── hooks/                # Custom React hooks
│   │   ├── lib/                  # Utilities
│   │   │   ├── api.ts            # API client configuration
│   │   │   └── utils.ts          # Common utilities
│   │   ├── pages/                # Page components
│   │   │   ├── Index.tsx         # Landing page
│   │   │   ├── Results.tsx       # Search results
│   │   │   ├── PackageDetail.tsx # Package details
│   │   │   └── NotFound.tsx      # 404 page
│   │   ├── App.tsx               # Main app component
│   │   ├── main.tsx              # Entry point
│   │   └── index.css             # Global styles
│   ├── public/                   # Public assets
│   ├── package.json              # Frontend dependencies
│   ├── vite.config.ts            # Vite configuration
│   └── tsconfig.json             # TypeScript config
├── backend/                      # Backend Node.js server
│   ├── src/
│   │   ├── app.js                # Express server setup
│   │   ├── db.js                 # Database connection & schema
│   │   ├── routes/               # API routes
│   │   │   ├── packages.js       # Package endpoints
│   │   │   └── enquiries.js      # Enquiry endpoints
│   │   ├── controllers/          # Business logic
│   │   │   ├── packageController.js
│   │   │   └── enquiryController.js
│   │   └── utils/                # Utilities
│   │       └── seedData.js       # Sample data seeder
│   ├── package.json              # Backend dependencies
│   └── README.md                 # Backend documentation
├── .gitignore                    # Git ignore rules
├── README.md                     # This file
└── DEPLOYMENT.md                 # Deployment guide
```

## 🚀 Quick Start

> **👋 New here?** Start with **[START_HERE.md](START_HERE.md)** for navigation and quick paths!

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or cloud)
- Git

> **📚 Database Setup**: Need help setting up PostgreSQL? See **[DATABASE_SETUP.md](DATABASE_SETUP.md)** for complete guide with step-by-step instructions! Or try the **[QUICK_DB_SETUP.md](QUICK_DB_SETUP.md)** 2-minute setup.

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd package-paradise-find/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set:
   ```env
   VITE_API_URL=http://localhost:3001
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:8080`

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set:
   ```env
   DATABASE_URL=postgresql://username:password@host:5432/travel_packages
   PORT=3001
   NODE_ENV=development
   CORS_ORIGINS=http://localhost:8080,http://localhost:5173
   ```

4. **Start backend server**
   ```bash
   npm start
   ```

5. **Seed sample data** (optional)
   ```bash
   npm run seed
   ```

Backend will run on `http://localhost:3001`

## 🌐 Deployment

### Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and sign in
3. Click "New Project" and import your repository
4. Set environment variable:
   - `VITE_API_URL` = Your backend URL
5. Deploy!

### Backend Deployment (Render)

1. Push your code to GitHub
2. Go to [Render](https://render.com) and sign in
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Set:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment variables:
     - `DATABASE_URL` = Your PostgreSQL connection string
     - `NODE_ENV` = `production`
     - `CORS_ORIGINS` = Your frontend URL
6. Deploy!

### Database Setup (Neon)

1. Go to [Neon](https://neon.tech) and create account
2. Create a new project
3. Copy the connection string
4. Use it in your backend `DATABASE_URL`

## 📊 Database Schema

### Vendors Table
- `id` - Primary key
- `name` - Vendor name (unique)
- `type` - 'OTA' or 'Local'
- Contact information and ratings

### Packages Table
- `id` - Primary key
- Details: title, destination, duration, price
- `vendor_id` - Foreign key to vendors
- Inclusions: flights, hotels, transfers, meals, sightseeing
- Additional: images, highlights, itinerary, hotel_info, flight_info

### Enquiries Table
- `id` - Primary key
- `package_id` - Foreign key to packages
- User information: name, email, phone, travellers
- `status` - enquiry status tracking

## 🛠️ API Endpoints

### Packages
- `GET /api/packages` - Search with filters
- `GET /api/packages/:id` - Get package details
- `GET /api/packages/vendor/:vendorId` - Get by vendor

### Enquiries
- `POST /api/enquiries` - Submit enquiry
- `GET /api/enquiries` - Get all (admin)
- `GET /api/enquiries/:id` - Get single (admin)

### Health
- `GET /health` - Health check

## 🧪 Testing

Test the API locally:

```bash
# Health check
curl http://localhost:3001/health

# Search packages
curl "http://localhost:3001/api/packages?destination=Bali"

# Get package details
curl http://localhost:3001/api/packages/1
```

## 📝 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
```

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@host:5432/database
PORT=3001
NODE_ENV=development
CORS_ORIGINS=http://localhost:8080
```

## 🤝 Contributing

This is a personal project, but suggestions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🙏 Acknowledgments

- Built with React, Express, and PostgreSQL
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
- Database hosted on [Neon](https://neon.tech)
- Frontend deployed on [Vercel](https://vercel.com)
- Backend deployed on [Render](https://render.com)

## 🐛 Troubleshooting

Having database connection issues? Check out:
- **[DATABASE_SETUP.md](DATABASE_SETUP.md)** - Complete setup guide
- **[QUICK_DB_SETUP.md](QUICK_DB_SETUP.md)** - Fast 2-minute Neon setup
- Troubleshooting section in each guide

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

**Happy Travel Planning! ✈️🏖️**
