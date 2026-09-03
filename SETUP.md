# LUXE Atelier — Local Setup Guide (VS Code)

Yeh MERN-style fullstack luxury fashion e-commerce app hai:
**Vite + React + TypeScript + Tailwind CSS + Framer Motion**, backend ke liye
**Supabase (Postgres) + serverless API routes**.

---

## Step 1 — Project ko download karein

Design Arena / preview panel se project ka **"Download" / "Export code"** button dabaayein.
Ek ZIP file download hogi. Usko extract (unzip) kar lein kisi folder me,
jaise `Documents/luxe-fashion`.

---

## Step 2 — VS Code me kholein

1. VS Code kholein
2. `File > Open Folder` par jaayein
3. Extract kiya hua `luxe-fashion` folder select karein

---

## Step 3 — Node.js install karein (agar nahi hai)

[https://nodejs.org](https://nodejs.org) se **LTS version** download karke install karein.
Check karne ke liye VS Code ka terminal (`Ctrl + ~`) kholein aur type karein:

```bash
node -v
npm -v
```

Dono version numbers dikhne chahiye.

---

## Step 4 — Dependencies install karein

VS Code terminal me yeh command chalayein (project folder ke andar):

```bash
npm install
```

Yeh saari zaroori libraries download kar lega (react, tailwind, supabase, etc.).
Thoda time lagega — wait karein.

---

## Step 5 — Environment variables set karein

1. Project me `.env.example` file hai — usko copy karke naya file banayein
   jiska naam **`.env`** ho.
2. Uske andar apni Supabase project ki values daalein.

**Values kahan se milengi?**
- [https://supabase.com](https://supabase.com) par login karein
- Apna project kholein (ya naya banayein)
- `Settings > API` me jaayein
  - **Project URL** -> `VITE_SUPABASE_URL` aur `NEXT_PUBLIC_SUPABASE_URL`
  - **anon public key** -> `VITE_SUPABASE_ANON_KEY` aur `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - **service_role key** -> `SUPABASE_SERVICE_ROLE_KEY`

> Agar aap purani wali (already deployed) Supabase project hi use karna chahte hain,
> to wahi values daal dein jo pehle se set thi.

---

## Step 6 — Database tables banayein (agar nayi Supabase project hai)

Agar aap nayi Supabase project use kar rahe hain, to tables banane padenge.
Supabase dashboard ke **SQL Editor** me jaakar tables create karein:
`products, categories, brands, reviews, orders, coupons, newsletter, contact_messages`.

(Agar purani wali project use kar rahe hain jisme data already hai, to yeh step skip karein.)

---

## Step 7 — App chalayein

```bash
npm run dev
```

Terminal me ek local URL aayega jaise `http://localhost:5173`.
Use browser me kholein — website chal jaayegi! 🎉

> Note: `npm run dev` sirf frontend chalata hai. `api/` folder ke serverless
> functions Vercel par chalti hain. Local par backend test karne ke liye
> `npm i -g vercel` karke `vercel dev` command use kar sakte hain.

---

## Project Structure (kaunsi file kya karti hai)

```
luxe-fashion/
├── api/                  <- Backend serverless API routes
│   ├── products.js         (products list/filter/search)
│   ├── orders.js           (orders create/track)
│   ├── reviews.js, coupons.js, categories.js, brands.js ...
│   └── db-client.js        (Supabase connection)
│
├── src/
│   ├── App.tsx           <- Saare routes yahan define hain
│   ├── main.tsx          <- App ka entry point
│   ├── index.css         <- Design system, colors, fonts
│   │
│   ├── pages/            <- Har page ki file
│   │   ├── Home.tsx        (homepage)
│   │   ├── Shop.tsx        (shop + filters)
│   │   ├── ProductDetail.tsx
│   │   ├── Cart.tsx, Checkout.tsx, Wishlist.tsx
│   │   ├── Login.tsx, Dashboard.tsx, Admin.tsx
│   │   └── About.tsx, Contact.tsx, FAQ.tsx, Blog.tsx, TrackOrder.tsx
│   │
│   ├── components/       <- Reusable pieces (Navbar, Footer, ProductCard...)
│   ├── contexts/         <- Global state (Auth, Cart, Wishlist, Prefs)
│   └── lib/              <- Helper functions (supabase, api, format)
│
├── .env                  <- Aapki secret keys (khud banani hai)
├── package.json          <- Dependencies list
└── index.html            <- Base HTML
```

---

## Common Commands

| Command            | Kaam                                |
|--------------------|-------------------------------------|
| `npm install`      | Dependencies install karein         |
| `npm run dev`      | Development server chalayein         |
| `npm run build`    | Production build banayein            |
| `npm run preview`  | Build ko locally preview karein      |

Koi bhi dikkat aaye to bataayein!
