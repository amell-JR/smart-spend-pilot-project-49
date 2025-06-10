# SpendWise - Smart Expense Management

A modern expense tracking and budget management application built with React, TypeScript, and Supabase.

## Features

- 📊 **Dashboard Overview** - Visual insights into your spending patterns
- 💰 **Expense Tracking** - Easy expense entry with receipt scanning (OCR)
- 🎯 **Budget Management** - Set and track budgets by category
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 🔐 **Secure Authentication** - User accounts with Supabase Auth
- 💱 **Multi-Currency Support** - Track expenses in different currencies

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **Backend**: Supabase (Database, Auth, Edge Functions)
- **Charts**: Recharts
- **OCR**: Groq Vision API for receipt processing
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Groq API key (for OCR functionality)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd spendwise
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables (see Environment Variables section below)

5. Start the development server:
```bash
npm run dev
```

## Environment Variables

For local development, create a `.env.local` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

For Supabase Edge Functions, set in your Supabase dashboard:
```env
GROQ_API_KEY=your_groq_api_key
```

## Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Set the following environment variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Supabase Setup

1. Create a new Supabase project
2. Run the database migrations
3. Set up the Edge Functions
4. Configure environment variables in Supabase dashboard

## API Keys Setup

### For Vercel Deployment

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add the following variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### For Supabase Edge Functions

1. Go to your Supabase dashboard
2. Navigate to Edge Functions → Settings
3. Add environment variables:
   - `GROQ_API_KEY`: Your Groq API key for OCR functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.