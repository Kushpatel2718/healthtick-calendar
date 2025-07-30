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

## 🔧 Key Features Explained

### Conflict Detection

The system prevents double bookings by checking:

- **Time Overlap**: New bookings can't overlap with existing ones
- **Duration Awareness**: Considers full appointment duration (40min onboarding, 20min follow-up)
- **Recurring Logic**: Accounts for weekly recurring follow-ups

### Recurring Appointments

- Follow-up calls automatically repeat weekly
- Efficient storage: Only original appointment stored, occurrences generated dynamically
- Smart deletion: Removing one occurrence removes the entire recurring series

### Client Search

- Real-time search by name or phone number
- Fuzzy matching for better user experience
- Visual feedback for selected clients

## 🔍 Business Logic

### Call Types

- **Onboarding**: 40-minute one-time calls for new clients
- **Follow-up**: 20-minute weekly recurring calls for ongoing support

### Time Slots

- **Duration**: 20-minute intervals
- **Hours**: 10:30 AM to 7:30 PM (covering 27 slots)
- **Conflict Prevention**: Smart overlap detection

### Data Flow

1. User selects time slot and client
2. System checks for conflicts
3. Booking saved to Firestore
4. UI updates in real-time
5. Recurring appointments auto-generate for future dates

## 🎨 Design Decisions

- **Gradient Backgrounds**: Modern, professional appearance
- **Color Coding**: Blue for onboarding, green for follow-ups
- **Hover Effects**: Smooth interactions for better UX
- **Loading States**: Clear feedback during Firebase operations
- **Error Handling**: Graceful error messages with recovery options

## 🧪 Testing the System

1. **Book an onboarding call** - should appear immediately
2. **Book a follow-up call** - should show "Recurring" badge
3. **Navigate to next week** - follow-up should appear again
4. **Try overlapping times** - should prevent booking
5. **Delete appointments** - should remove from database

## 📱 Mobile Responsiveness

The calendar is fully responsive and works well on:

- Desktop computers
- Tablets
- Mobile phones

## 🔮 Future Enhancements

- [ ] Email notifications for bookings
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Client profiles with history
- [ ] Bulk operations for appointments
- [ ] Advanced recurring patterns
- [ ] Analytics dashboard

## 🐛 Troubleshooting

### Common Issues

1. **Firebase connection errors**: Check your config and internet connection
2. **Build failures**: Ensure all dependencies are installed
3. **Time zone issues**: Dates are handled in local time zone

## 👥 Contributing

This is a project submission for HealthTick's Web Developer Intern position. The codebase demonstrates:

- Clean, modular React architecture
- TypeScript for type safety
