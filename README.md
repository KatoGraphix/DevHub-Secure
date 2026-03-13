# Developer Dashboard

A high-performance, animated internal Developer Dashboard for **MyMint**. Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, and Supabase.

## ✨ Features

- **Supabase Auth**: Secure authentication with role-based access control (RBAC).
- **Animated Login**: Premium dark-theme login experience with glassmorphism and smooth transitions.
- **Dynamic Kanban Board**: Real-time task management with drag-and-drop aesthetics.
- **Admin Panel**: Role-gated dashboard for managing the team and overseeing all tasks.
- **Real-time Updates**: Instant data synchronization across the team using Supabase Realtime.
- **Premium UI**: Custom-built dashboard components with a sleek midnight aesthetic and emerald accents.

## 🌐 Production Deployment

The application is deployed and accessible at the following URL:

> **Production URL**: [https://devhub-secure.vercel.app](https://devhub-secure.vercel.app)

---

## 🚀 Getting Started

### 1. Project Creation
Ensure you have cloned the repository and installed dependencies:
```bash
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://wsieewynjldcxzlqhqna.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# The Service Role Key is used only for initial setup
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Database Migration
1. Go to the **Supabase Dashboard -> SQL Editor**.
2. Run the `supabase_schema.sql` script to create tables, RLS policies, and functions.

### 4. Team Login
The team has been pre-seeded. All accounts use the temporary password: `Password123!`

| Role | Email | Name |
|---|---|---|
| **CEO** | `lonwabo@mymint.co.za` | Lonwabo Damane |
| **CTO** | `mihle@mymint.co.za` | Mihle Matimba |
| **SSD** | `kurt.vonschaeffer@mymint.co.za` | Kurt Von Schaeffer |
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
