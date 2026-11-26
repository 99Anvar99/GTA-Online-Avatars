# GTA Online Avatars Lookup

<img width="2559" height="1244" alt="Project" src="https://github.com/user-attachments/assets/61d79cc8-deec-4766-a869-add7d8351b9c" />

- A simple **Next.js 15** web app to fetch and display GTA 5 Online player avatars (Legacy & Enhanced editions) along with player information like **RID** and **Username**.  

- This app uses **Rockstar's SC Cache API** to fetch avatars and player details.

---

## 🚀 Features

- Fetch **Legacy & Enhanced avatars** for any player.
- Search by **Username** or **RID**.
- Auto-detect input type (RID or Username) and display the corresponding info.
- Display RID or Username depending on the input.
- Responsive and clean UI built with **TailwindCSS**.
- Client-side interactivity handled with React hooks.
- Server-side logic for fetching data separated in API routes.
- Clean footer with GitHub link.

---

## 🛠️ Tech Stack

- **Next.js 15** (App Router, Turbopack)
- **TypeScript** for type safety
- **React** for UI interactivity
- **TailwindCSS** for styling
- **Native browser images** for CDN avatars and lazy-loaded recent-search thumbnails
- **Rockstar SC Cache API** for player data

---

## 📁 Project Structure

```bash
/app
├─ page.tsx # Homepage layout
└─ api
   ├─ lib/rockstar.ts # Rockstar profile and avatar lookups
   └─ rockstar/route.ts # Avatar API route
/components
├─ avatar-search.tsx # Search form, avatar results, and recent searches
└─ ui # Reusable UI components (Button, Input)
```

---

## ⚡ Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/99Anvar99/GTA-Online-Avatars.git
cd GTA-Online-Avatars
```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. Run locally

   ```bash
   npm run dev
   ```

Open **http://localhost:3000** to view the app.

---

## 🔍 Usage

- Enter a Username or RID in the search box.
- Press Enter or click Search.
- View Legacy and Enhanced avatars.
- Toggle between characters when both slots are available.
- RID/Username will be displayed below the avatars.
- Status messages indicate success or failure.

---

## 🖼️ Avatar URLs/API

Legacy Avatar:
https://prod.cloud.rockstargames.com/members/sc/6266/{RID}/publish/gta5/mpchars/0.png

Enhanced Avatar:
https://prod.cloud.rockstargames.com/members/sc/0807/{RID}/publish/gta5/mpchars/0_pcrosalt.png

---

## 💡 Notes

- If a player does not have avatars, a placeholder box with "No Avatar" is shown.
- Server-side logic ensures that searching by Username automatically resolves the RID, and vice versa.
- Your browser keeps up to ten recent searches and can reuse lookup responses for up to 60 seconds.

---

## 🔗 Links

[![GitHub](https://img.shields.io/badge/GitHub-99Anvar99-blue?logo=github&logoColor=white)](https://github.com/99Anvar99/GTA-Online-Avatars)

## ❤️ Credits

- Made with React, Next.js, and TailwindCSS by **[Mister9982](https://github.com/99Anvar99)**
