# Deployment Guide

## Prerequisites

1. A Firebase project with:
   - Authentication enabled (Email/Password)
   - Firestore database created
   - Firebase config values

2. A GitHub account
3. A Vercel account (free tier works)

## Step-by-Step Deployment

### 1. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable **Authentication**:
   - Go to Authentication → Sign-in method
   - Enable "Email/Password"
4. Create **Firestore Database**:
   - Go to Firestore Database
   - Create database in production mode
   - Choose a location (preferably close to your users)
5. Get your Firebase config:
   - Go to Project Settings → General
   - Scroll down to "Your apps"
   - Click the web icon (`</>`) to add a web app
   - Copy the config values

### 2. Set Up Firestore Indexes

When you use both status and priority filters together, Firestore requires a composite index. You can:

**Option A: Let Firestore guide you**
- When you first use both filters, Firestore will show an error with a link to create the index
- Click the link and create the index

**Option B: Create manually**
- Go to Firestore → Indexes
- Click "Create Index"
- Collection: `issues`
- Fields:
  - `status` (Ascending)
  - `priority` (Ascending)
  - `createdTime` (Descending)
- Create the index

### 3. Push to GitHub

1. Initialize git (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a new repository on GitHub

3. Push your code:
   ```bash
   git remote add origin <your-github-repo-url>
   git branch -M main
   git push -u origin main
   ```

### 4. Deploy to Vercel

1. Go to [Vercel](https://vercel.com/)
2. Sign in with GitHub
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure the project:
   - Framework Preset: Vite
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (should be auto-detected)
   - Output Directory: `dist` (should be auto-detected)
6. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add each Firebase config variable:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`
   - Make sure to add them for **Production**, **Preview**, and **Development** environments
7. Click "Deploy"

### 5. Configure Firebase for Production Domain

1. Go to Firebase Console → Authentication → Settings
2. Add your Vercel domain to "Authorized domains"
3. The domain format is: `your-app-name.vercel.app`

### 6. Test Your Deployment

1. Visit your Vercel URL
2. Test sign up and login
3. Create an issue
4. Test filtering and status updates
5. Verify similar issue detection works

## Troubleshooting

### Common Issues

1. **"Firebase: Error (auth/unauthorized-domain)"**
   - Solution: Add your Vercel domain to Firebase Authorized domains

2. **"Missing or insufficient permissions"**
   - Solution: Check Firestore security rules. For development, you can use:
     ```
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /{document=**} {
           allow read, write: if request.auth != null;
         }
       }
     }
     ```

3. **"Index not found" error**
   - Solution: Create the composite index as described in step 2

4. **Environment variables not working**
   - Solution: Make sure all variables have the `VITE_` prefix
   - Redeploy after adding environment variables

## Security Notes

- Never commit `.env` files to GitHub
- Use Vercel's environment variables for production secrets
- Consider implementing proper Firestore security rules for production
- Review Firebase security rules before going live

