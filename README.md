# Smart Issue Board

A modern issue tracking application built with React, TypeScript, and Firebase. This application allows users to create, manage, and track issues with intelligent duplicate detection and status management.

## 🚀 Live Demo

[Deployed on Vercel](https://your-app-name.vercel.app) *(Update with your actual Vercel URL)*

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing (for future expansion)

### Backend & Services
- **Firebase Authentication** - Email/Password authentication
- **Firebase Firestore** - NoSQL database for issues
- **Vercel** - Hosting and deployment

## 📋 Features

1. **Authentication**
   - User sign up and login with email/password
   - Display logged-in user's email
   - Secure session management

2. **Create Issue**
   - Title and Description
   - Priority selection (Low/Medium/High)
   - Status selection (Open/In Progress/Done)
   - Assign to user (email or name)
   - Automatic timestamp and creator tracking

3. **Similar Issue Detection**
   - Real-time detection of similar issues while typing
   - Keyword-based matching algorithm
   - Warning display with list of similar issues
   - Helps prevent duplicate issue creation

4. **Issue List**
   - Display all issues sorted by newest first
   - Filter by Status (Open/In Progress/Done)
   - Filter by Priority (Low/Medium/High)
   - Color-coded badges for quick visual identification

5. **Status Transition Rules**
   - Prevents direct transition from "Open" to "Done"
   - Friendly error message when invalid transition attempted
   - Must go through "In Progress" state first

## 🏗️ Why This Frontend Stack?

I chose **React + TypeScript + Vite + Tailwind CSS** for the following reasons:

1. **React**: Industry-standard library with excellent ecosystem, component reusability, and strong community support. Perfect for building interactive UIs.

2. **TypeScript**: Provides type safety, better IDE support, catches errors at compile-time, and makes the codebase more maintainable. Essential for production applications.

3. **Vite**: Lightning-fast development experience with HMR (Hot Module Replacement), optimized builds, and excellent developer experience. Much faster than Create React App.

4. **Tailwind CSS**: Utility-first CSS framework that allows rapid UI development without writing custom CSS. Perfect for building modern, responsive designs quickly while maintaining consistency.

5. **Firebase**: Serverless backend solution that eliminates the need for a separate backend server. Firestore provides real-time database capabilities, and Firebase Auth handles authentication securely.

This stack provides a perfect balance of developer experience, performance, and maintainability for a project of this scope.

## 🗄️ Firestore Data Structure

### Collection: `issues`

Each document in the `issues` collection has the following structure:

```typescript
{
  title: string              // Issue title
  description: string        // Detailed description
  priority: "Low" | "Medium" | "High"
  status: "Open" | "In Progress" | "Done"
  assignedTo: string         // Email or name of assignee
  createdBy: string          // Email of the user who created the issue
  createdTime: Timestamp    // Firebase Timestamp for creation time
}
```

### Design Decisions:

1. **Flat Structure**: All issue data is stored in a single collection. This simplifies queries and reduces complexity for this use case.

2. **Timestamp Field**: Using Firestore's native `Timestamp` type ensures accurate time tracking and easy sorting.

3. **String-based Enums**: Priority and Status are stored as strings rather than numbers for better readability and easier querying.

4. **No Nested Collections**: For this scope, a flat structure is sufficient. If the app needed comments, attachments, or history, those could be added as subcollections later.

5. **Indexing**: Firestore automatically indexes fields used in queries (status, priority, createdTime), ensuring fast filtering and sorting.

### Query Strategy:

- Default query: Orders by `createdTime` descending (newest first)
- Filtering: Uses Firestore's `where()` clause for status and priority filters
- Similar issue detection: Fetches all issues and performs client-side keyword matching (could be optimized with Algolia or similar for larger datasets)

## 🔍 Similar Issue Handling

The similar issue detection system works as follows:

### Algorithm:

1. **Keyword Extraction**: When a user types in the title or description, the system extracts meaningful keywords (words longer than 3 characters) from both fields.

2. **Matching Logic**: 
   - Converts both the new issue text and existing issues to lowercase
   - Checks if at least 2 keywords from the new issue appear in existing issues' titles or descriptions
   - This prevents false positives from common words while catching genuinely similar issues

3. **Real-time Detection**: 
   - Uses a debounced effect (500ms delay) to avoid excessive API calls
   - Only triggers when title has more than 5 characters or description has more than 10 characters

4. **User Experience**:
   - Displays a warning box with up to 5 most similar issues
   - Shows issue title, status, and priority for quick comparison
   - User can still proceed with creation (warning, not blocking)
   - Helps users make informed decisions about creating duplicates

### Why This Approach?

- **Non-blocking**: Users can still create issues even if similar ones exist (sometimes duplicates are valid)
- **Simple but Effective**: Keyword matching is lightweight and works well for this use case
- **User-friendly**: Provides context without being intrusive
- **Scalable**: Could be enhanced with fuzzy matching libraries (e.g., Fuse.js) or ML-based similarity for larger datasets

### Future Improvements:

- Use Firebase Functions to perform server-side similarity detection
- Implement fuzzy string matching for better accuracy
- Add semantic similarity using embeddings
- Track which similar issues were reviewed before creation

## 🤔 What Was Confusing or Challenging?

1. **Firestore Query Limitations**: 
   - Initially tried to filter by multiple fields simultaneously, but Firestore requires composite indexes for complex queries. Had to simplify to single-field filters or fetch all and filter client-side for similar issue detection.

2. **Status Transition Validation**:
   - Deciding where to enforce the "Open → Done" rule was tricky. Implemented it in the service layer to ensure consistency, but had to handle error messaging in the UI appropriately.

3. **Similar Issue Detection Timing**:
   - Balancing real-time detection with performance was challenging. Too frequent checks would slow down typing, too infrequent would feel unresponsive. Settled on a 500ms debounce.

4. **TypeScript with Firebase**:
   - Firestore's Timestamp type conversion required careful handling when converting to JavaScript Date objects for display.

5. **Environment Variables in Vite**:
   - Had to remember that Vite requires `VITE_` prefix for environment variables to be exposed to the client-side code.

## 🚀 What Would I Improve Next?

1. **Enhanced Similar Issue Detection**:
   - Implement fuzzy string matching (using libraries like Fuse.js)
   - Add semantic similarity using text embeddings
   - Server-side detection via Firebase Functions for better performance

2. **Issue History & Activity Log**:
   - Track all status changes with timestamps
   - Show who made each change
   - Display full issue history timeline

3. **Advanced Filtering & Search**:
   - Full-text search across titles and descriptions
   - Filter by creator, assignee, date range
   - Save filter presets

4. **User Management**:
   - User profiles with names
   - Avatar support
   - User roles and permissions

5. **Issue Details Page**:
   - Dedicated page for each issue
   - Comments/notes functionality
   - File attachments
   - Related issues linking

6. **Performance Optimizations**:
   - Implement pagination for large issue lists
   - Add virtual scrolling for better performance
   - Cache frequently accessed data

7. **Real-time Updates**:
   - Use Firestore real-time listeners to update UI when issues change
   - Show notifications for status changes on assigned issues

8. **Better Error Handling**:
   - More specific error messages
   - Retry mechanisms for failed operations
   - Offline support with service workers

9. **Testing**:
   - Unit tests for services and utilities
   - Integration tests for critical flows
   - E2E tests for user journeys

10. **Accessibility**:
    - ARIA labels and roles
    - Keyboard navigation improvements
    - Screen reader optimization

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd smart-issue-board
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Firebase**:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Copy your Firebase config

4. **Configure environment variables**:
   - Copy `.env.example` to `.env`
   - Fill in your Firebase configuration values:
     ```
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     ```

5. **Run development server**:
   ```bash
   npm run dev
   ```

6. **Build for production**:
   ```bash
   npm run build
   ```

## 🚢 Deployment

### Vercel Deployment:

1. Push your code to a public GitHub repository
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard (Settings → Environment Variables)
4. Deploy!

The `vercel.json` file is already configured for optimal deployment.

## 📝 License

This project is created as part of an internship assignment.

## 👤 Author

Created as part of an internship assignment demonstrating real-world problem-solving skills and practical decision-making.

