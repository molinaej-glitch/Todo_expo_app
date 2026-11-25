# Todo Expo App (Expo + Supabase)

React Native todo app with email/password auth and per-user todos stored in Supabase (Row Level Security enabled).

## 1. Set up Supabase (2 min)
1. Create a project at https://supabase.com/dashboard.
2. Open **SQL Editor**, paste the contents of `supabase/schema.sql`, click **Run**.
3. (Optional, for faster testing) **Authentication → Providers → Email** → turn off "Confirm email".
4. Go to **Project Settings → API** and copy the **Project URL** and **anon public key**.

## 2. Configure the app
```bash
cp .env.example .env
# edit .env and paste your URL + anon key
```

## 3. Run it in VS Code
```bash
npm install
npx expo install --fix     # aligns package versions with your installed Expo SDK
npx expo start -c
```
- Phone: install **Expo Go**, scan the QR code in the terminal.
- Android emulator: press `a`. iOS simulator (Mac): press `i`. Browser: press `w`.
- Or in VS Code: `Ctrl/Cmd+Shift+B` runs the "Expo: start" task.
- If your phone can't connect, run `npx expo start --tunnel`.

Open the folder in VS Code and accept the recommended extensions (Expo Tools, Prettier, Supabase).

## Structure
```
App.js                     session handling (auth vs todos)
src/lib/supabase.js        Supabase client (AsyncStorage session persistence)
src/screens/AuthScreen.js  sign in / sign up
src/screens/TodosScreen.js add, toggle, delete, filter todos
supabase/schema.sql        table + RLS policies
```

## Notes
- Only the **anon** key goes in the app. Never put the service_role key here.
- After editing `.env`, restart with `npx expo start -c`.
