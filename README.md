# DEVHUB SECURE - Complete Web Application Documentation

## 📋 Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Authentication System](#authentication-system)
- [API Endpoints](#api-endpoints)
- [User Interface Components](#user-interface-components)
- [Deployment & Production](#deployment--production)
- [Development Workflow](#development-workflow)

---

## 🎯 Overview

**DEVHUB SECURE** is a comprehensive internal developer dashboard and task management system built for **MyMint**. It provides a secure, real-time collaborative environment for development teams to manage tasks, track progress, and maintain project documentation.

### Key Features
- 🔐 **Secure Authentication** - Supabase-based auth with role-based access control
- 📊 **Real-time Task Management** - Kanban board with drag-and-drop functionality
- 👥 **Team Collaboration** - Multi-user environment with live updates
- 📚 **API Documentation** - Interactive API explorer and script runner
- 🎨 **Premium UI/UX** - Dark theme with glassmorphism and smooth animations
- 📱 **Responsive Design** - Works seamlessly across all devices

---

## 🏗️ Architecture

### Application Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── dashboard/         # Main dashboard pages
│   │   ├── admin/         # Admin-only pages
│   │   ├── api-docs/      # API documentation
│   │   └── tasks/         # Task management
│   ├── api/               # API routes
│   │   ├── mint/          # Database CRUD operations
│   │   └── scripts/       # Script execution API
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page (login)
├── components/            # Reusable UI components
│   ├── dashboard/         # Dashboard-specific components
│   └── ui/                # shadcn/ui components
├── lib/                   # Utility libraries
└── utils/                 # Helper functions
```

### Data Flow
1. **Client Request** → Next.js App Router
2. **Authentication Check** → Supabase Auth Middleware
3. **API Call** → Server-side Supabase Client
4. **Database Query** → Supabase PostgreSQL
5. **Real-time Updates** → Supabase Realtime
6. **Response** → Client-side State Update

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | Next.js 14 (App Router) | React framework with SSR/SSG |
| **Authentication** | Supabase Auth | Secure user authentication & authorization |
| **Database** | Supabase PostgreSQL | Primary data storage with RLS |
| **Real-time** | Supabase Realtime | Live data synchronization |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **Components** | shadcn/ui | Pre-built accessible UI components |
| **Animations** | Framer Motion | Smooth animations and transitions |
| **Icons** | Lucide React | Consistent icon library |
| **Notifications** | Sonner | Toast notifications |
| **TypeScript** | TypeScript | Type-safe JavaScript |
| **Deployment** | Vercel/Render | Cloud hosting platforms |

---

## 🗄️ Database Schema

### Core Tables

#### `profiles` Table
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT CHECK (role IN ('admin_assigner', 'senior', 'junior')),
  role_id TEXT UNIQUE,
  position TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `tasks` Table
```sql
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('todo', 'in_progress', 'review', 'completed')) DEFAULT 'todo',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  assigned_to UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS) Policies

#### Profiles Policies
```sql
-- Users can read all profiles
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Admin users can manage all profiles
CREATE POLICY "Admins can manage profiles" ON profiles FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin_assigner'));
```

#### Tasks Policies
```sql
-- All authenticated users can read tasks
CREATE POLICY "Users can view tasks" ON tasks FOR SELECT USING (auth.role() = 'authenticated');

-- Users can create tasks
CREATE POLICY "Users can create tasks" ON tasks FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Users can update tasks they created or are assigned to
CREATE POLICY "Users can update their tasks" ON tasks FOR UPDATE
USING (auth.uid() = created_by OR auth.uid() = assigned_to);

-- Admin users can manage all tasks
CREATE POLICY "Admins can manage all tasks" ON tasks FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin_assigner'));
```

---

## 🔐 Authentication System

### Authentication Flow
1. **User Login** → Email/Password → Supabase Auth
2. **JWT Token** → Stored in HTTP-only cookies
3. **Middleware Check** → Validates token on protected routes
4. **Role Verification** → Checks user permissions
5. **Session Management** → Automatic token refresh

### User Roles & Permissions

| Role | Permissions | Access Level |
|------|-------------|--------------|
| `admin_assigner` | Full CRUD on all data, user management | CEO, CTO |
| `senior` | Create/update tasks, view all data | Senior Developers |
| `junior` | Create tasks, update assigned tasks | Junior Developers |

### Middleware Protection
```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  // Check authentication
  // Redirect to login if not authenticated
  // Validate user permissions
}
```

---

## 🔌 API Endpoints

### MINT Database API (`/api/mint`)

**Purpose**: Direct CRUD operations on profiles and tasks tables.

#### POST `/api/mint` - Create Record
```typescript
// Request
{
  "table": "profiles" | "tasks",
  "data": {
    // Record data
  }
}

// Response
{
  "success": true,
  "data": [/* created records */]
}
```

#### PATCH `/api/mint` - Update Record
```typescript
// Request
{
  "table": "profiles" | "tasks",
  "id": "record-uuid",
  "data": {
    // Updated fields
  }
}
```

#### DELETE `/api/mint` - Delete Record
```typescript
// Request
{
  "table": "profiles" | "tasks",
  "id": "record-uuid"
}
```

### Script Runner API (`/api/scripts`)

**Purpose**: Execute predefined database scripts for complex operations.

#### Available Scripts

**Profile Scripts:**
- `create_profile` - Insert new profile
- `update_profile` - Update existing profile
- `delete_profile` - Remove profile
- `get_profiles` - Fetch all profiles
- `get_profile_by_id` - Fetch specific profile

**Task Scripts:**
- `create_task` - Insert new task
- `update_task` - Update existing task
- `delete_task` - Remove task
- `get_tasks` - Fetch all tasks
- `get_task_by_id` - Fetch specific task

#### POST `/api/scripts` - Execute Script
```typescript
// Request
{
  "script": "create_profile",
  "data": {
    "email": "user@mint.co.za",
    "first_name": "John",
    "last_name": "Doe",
    "role": "junior",
    "role_id": "MINT-JSD-001",
    "position": "Junior Developer"
  }
}

// Response
{
  "success": true,
  "data": [/* result data */],
  "message": "Profile created successfully"
}
```

### Debug API (`/api/debug`)

**Purpose**: Environment variable verification and system diagnostics.

#### GET `/api/debug`
```typescript
// Response
{
  "NEXT_PUBLIC_SUPABASE_URL": "https://...",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY": "***present***",
  "node_env": "production|development",
  "has_env_local": true
}
```

---

## 🎨 User Interface Components

### Core Components

#### Authentication Components
- **Login Page** (`/app/page.tsx`) - Matrix-themed login with Supabase auth
- **Middleware** (`/middleware.ts`) - Route protection and auth validation

#### Dashboard Components
- **Navbar** (`/components/dashboard/Navbar.tsx`) - Top navigation with user menu
- **Sidebar** (`/components/dashboard/Sidebar.tsx`) - Main navigation menu
- **Kanban Board** - Task management with drag-and-drop
- **Admin Panel** - User and system management

#### UI Components (shadcn/ui)
- **Button** - Consistent button styles
- **Input** - Form input fields
- **Label** - Form labels
- **Card** - Content containers

### Key Features

#### Matrix Login Animation
```typescript
// Deterministic matrix generation (no hydration issues)
const MATRIX_LINES = Array.from({ length: 100 }).map((_, i) => {
  const seed = (i * 7) % 36
  return seed.toString(36).repeat(10).substring(0, 100)
})
```

#### Real-time Updates
```typescript
// Supabase real-time subscriptions
useEffect(() => {
  const channel = supabase
    .channel('tasks')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, callback)
    .subscribe()
}, [])
```

#### Role-based Rendering
```typescript
const userRole = // Get from Supabase auth
const canEdit = userRole === 'admin_assigner' || userRole === 'senior'
```

---

## 🚀 Deployment & Production

### Environment Variables Required

#### Production Environment Variables
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://wsieewynjldcxzlqhqna.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key

# Vercel/Render specific (if needed)
VERCEL_URL=your_deployment_url
```

### Deployment Platforms

#### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel --prod
```

#### Render Deployment
```bash
# Connect GitHub repo to Render
# Set environment variables in Render dashboard
# Deploy automatically on git push
```

### Production URLs
- **Vercel**: `https://devhub-secure.vercel.app`
- **Render**: `https://devhub-secure.onrender.com`

---

## 🔄 Development Workflow

### Local Development Setup
```bash
# Clone repository
git clone <repository-url>
cd DevHub-Secure

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run database migrations
# Go to Supabase Dashboard → SQL Editor → Run supabase_schema.sql

# Start development server
npm run dev
```

### Code Quality
```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests (if implemented)
npm run test
```

### Git Workflow
```bash
# Feature development
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# Create pull request
# Code review and merge
```

---

## 📊 Application Flow

### User Journey

1. **Access Application**
   - User visits production URL
   - Redirected to login page if not authenticated

2. **Authentication**
   - User enters email/password
   - Supabase validates credentials
   - JWT token stored in cookies
   - User redirected to dashboard

3. **Dashboard Access**
   - Middleware validates authentication
   - User role determined from database
   - Appropriate dashboard loaded

4. **Task Management**
   - Users can view/create/update tasks
   - Real-time updates via Supabase
   - Role-based permissions enforced

5. **Admin Functions** (Admin users only)
   - User management
   - System monitoring
   - Advanced task operations

### Error Handling

- **Authentication Errors**: Redirect to login with error message
- **Permission Errors**: Show "Access Denied" UI
- **Network Errors**: Retry logic with user feedback
- **Database Errors**: Graceful error messages with logging

### Performance Optimizations

- **Server-Side Rendering**: Fast initial page loads
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Next.js automatic optimization
- **Caching**: Appropriate cache headers for static assets
- **Database Indexing**: Optimized queries with proper indexing

---

## 🔧 Troubleshooting

### Common Issues

#### Login Not Working
- Check Supabase credentials in `.env.local`
- Verify user exists in database
- Check browser console for errors
- Ensure cookies are enabled

#### API Errors
- Check environment variables on deployment platform
- Verify database connection
- Check Supabase RLS policies
- Review server logs

#### Build Failures
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run type-check`

#### Real-time Not Working
- Verify Supabase Realtime is enabled
- Check network connectivity
- Review browser console for WebSocket errors

---

## 📞 Support & Maintenance

### Team Contacts
- **CEO**: Lonwabo Damane (`lonwabo@mymint.co.za`)
- **CTO**: Mihle Matimba (`mihle@mymint.co.za`)
- **Lead Developer**: Kurt Von Schaeffer (`kurt.vonschaeffer@mymint.co.za`)

### System Monitoring
- **Error Logging**: Check Vercel/Render logs
- **Performance**: Monitor via deployment platform dashboards
- **Database**: Monitor via Supabase dashboard

### Future Enhancements
- [ ] Mobile app development
- [ ] Advanced reporting and analytics
- [ ] Integration with external APIs
- [ ] Automated testing suite
- [ ] Multi-language support

---

*This documentation is maintained by the DEVHUB SECURE development team. Last updated: March 14, 2026*
| **JSD** | `mufaro.ncube@mymint.co.za` | Mufaro Ncube |
| **JFD** | `tsie.masilo@mymint.co.za` | Tsie Masilo |
| **ISD** | `mpumelelo@mymint.co.za` | Mpumelelo Maswanganye |

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/)
- **Auth & Database**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [Sonner](https://sonner.stevenly.me/)

## 🏗️ Building and Running

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the result.
