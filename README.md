# E Nena Piyasa Computer Technology Center

Responsive blue/white technology-center website with a PIN-protected admin panel, realtime chat, feedback, teacher management, and blog management.

## Firebase Realtime Database

1. Create a Firebase project at `https://console.firebase.google.com`.
2. Create a Web App and enable Realtime Database.
3. Copy the Web App configuration into `assets/js/config/firebase-config.js`.
4. Install Firebase CLI and deploy the included database rules:

```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only database
```

When Firebase is configured, teachers, blogs, chats, and feedback synchronize live across browsers. Without Firebase configuration, the site automatically uses local browser storage.

The included database rules permit public writes so the current PIN-only admin experience works. Before using the site for sensitive or high-traffic production data, connect Firebase Authentication and restrict admin writes to authenticated administrators.

## Google Sign-In

Create a Google OAuth 2.0 **Web application** Client ID, then paste it into `assets/js/config/google-auth-config.js`:

```js
window.ENP_GOOGLE_CLIENT_ID = "YOUR_CLIENT_ID.apps.googleusercontent.com";
```

Add these authorized JavaScript origins in Google Cloud Console:

- `http://localhost:4173`
- `https://e-nena-piyasa.vercel.app`

## GitHub and Facebook Sign-In

In Firebase Console, open **Authentication > Sign-in method** and enable GitHub and Facebook.

- GitHub: create a GitHub OAuth App, then paste its Client ID and Client Secret into the Firebase GitHub provider.
- Facebook: create a Meta App, then paste its App ID and App Secret into the Firebase Facebook provider.
- Copy the callback URL shown by Firebase into each provider's authorized callback/redirect URL setting.

Never put GitHub or Facebook client secrets into browser JavaScript files.

## Vercel Deployment

```bash
npm install -g vercel
vercel
vercel --prod
```

Alternatively, import this folder into Vercel. The included `vercel.json` configures clean URLs and security headers.

## Admin Access

- URL: `/panel`
- Default PIN: `2026`

Change `ADMIN_PIN` at the top of `panel/js/admin.js` before deployment.
