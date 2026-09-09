# Raftar Footwear – Wholesale E-commerce (MERN)

Full-stack wholesale footwear store based on [raftarfootwear.com](https://raftarfootwear.com/).

## Features

- **Storefront**: Shop, Raftar Footwear, Superstar Footwear, product detail with color variants
- **Wholesale packs**: quantity 1 / 6 / 12 pairs with pack pricing
- **WhatsApp checkout**: order via WhatsApp (`03338788861`)
- **Admin** (`/admin/v1/admin`): products, categories, orders, **blog**, site settings, popups
- **Dynamic content**: hero, promo bar, banners editable from admin
- **Static catalog fallback**: site works even if MongoDB is unavailable (localStorage overlay for admin-added products/blogs)
- **Real images** from raftarfootwear.com
- Attractive fonts: Cormorant Garamond + Outfit

## Stack

- **Frontend**: React 18, Vite, Redux Toolkit, Tailwind, React Router
- **Backend**: Node, Express, MongoDB, Cloudinary, Sharp (image compression), JWT

## Quick Start

### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run seed           # creates admin + products
npm run dev            # http://localhost:5000
```

Admin login: `admin@revone.com` / `admin123`

### Frontend
```bash
cd frontend
npm install
npm run dev            # http://localhost:3000 (or Vite default 5173)
```

Proxy `/api` to backend is configured in `vite.config.js`.

## Admin URL

`http://localhost:5173/admin/v1/admin`

## Environment

Backend config lives in `backend/.env` (copy `backend/.env.example` and fill in your own values). It is **not** committed — never commit real secrets.

## Menu

- Shop (all + categories)
- Raftar Footwear
- Superstar Footwear
- Blog
- About / Manufacturing / Contact

Phone: **03338788861**
