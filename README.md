# HealthTick Calendar System

A modern, responsive calendar system for managing coaching calls with smart conflict detection and recurring appointment support.

## 🚀 Features

- **Smart Scheduling**: 20-minute time slots from 10:30 AM to 7:30 PM
- **Conflict Detection**: Prevents overlapping bookings automatically
- **Recurring Appointments**: Weekly follow-up calls with intelligent handling
- **Client Management**: Searchable client database with phone numbers
- **Real-time Updates**: Firebase integration for live data synchronization
- **Responsive Design**: Beautiful UI with Tailwind CSS and modern animations

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase Firestore
- **Icons**: Lucide React
- **Build Tool**: Vite

## 📋 Prerequisites

- npm or yarn
- Firebase account

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd healthtick-calendar
npm install
```

### 2. Firebase Setup

1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Update Firebase configuration in `src/firebase/config.ts`
4. Set Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /bookings/{document} {
      allow read, write: if true;
    }
    match /clients/{document} {
      allow read, write: if true;
    }
  }
}
```

### 3. Run the Application

```bash
npm run dev
```

Visit `http://localhost:5173/` to see the calendar in action.

## 📊 Firebase Schema

### Collections

#### `bookings`

```typescript
{
  id: string,
  clientId: string,
  clientName: string,
  callType: 'onboarding' | 'follow-up',
  date: string, // YYYY-MM-DD format
  time: string, // HH:MM format (24-hour)
  isRecurring: boolean,
  originalDate?: string, // For recurring calls
  createdAt: Timestamp
}
```

#### `clients`

```typescript
{
  id: string,
  name: string,
  phone: string,
  createdAt: Timestamp
}
```

### Common Issues

1. **Firebase connection errors**: Check your config and internet connection
2. **Build failures**: Ensure all dependencies are installed
3. **Time zone issues**: Dates are handled in local time zone

## 👥 Contributing

This is a project submission for HealthTick's Web Developer Intern position. The codebase demonstrates:

- Clean, modular React architecture
- TypeScript for type safety
