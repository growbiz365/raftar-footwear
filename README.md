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
cp .env.example .env   # already has your Mongo + Cloudinary keys
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

## Environment (backend `.env`)

```
PORT=5000
MONGO_URI=mongodb+srv://mubashermodern118_db_user:admin123@cluster0.wwv4luv.mongodb.net/revone?retryWrites=true&w=majority
JWT_SECRET=revone-jwt-secret-2026-secure
CLOUDINARY_CLOUD_NAME=dwv4luv
CLOUDINARY_API_KEY=129643658816371
CLOUDINARY_API_SECRET=-ejHwdigTnw3ppnqnTSoaUv72kI
```

## Menu

- Shop (all + categories)
- Raftar Footwear
- Superstar Footwear
- Blog
- About / Manufacturing / Contact

Phone: **03338788861**
