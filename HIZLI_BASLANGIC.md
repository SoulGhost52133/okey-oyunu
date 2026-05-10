# ⚡ 5 Dakikada Hızlı Başlangıç

**En kısa yoldan yayına al!**

---

## ✅ Checklist

### 1️⃣ Supabase (3 dk)

- [ ] [supabase.com](https://supabase.com) → Sign Up
- [ ] New Project → Name: `okey` → Create
- [ ] SQL Editor → New Query → SQL yapıştır → Run
- [ ] Settings → API → URL ve anon key kopyala

### 2️⃣ Proje (1 dk)

- [ ] `.env` dosyası oluştur
- [ ] İçine Supabase bilgilerini yapıştır
- [ ] `npm run dev` → Test et

### 3️⃣ GitHub (1 dk)

- [ ] [github.com/new](https://github.com/new) → Repo oluştur
- [ ] Terminal:
```bash
git init && git add . && git commit -m "init"
git branch -M main
git remote add origin https://github.com/ADIN/repo.git
git push -u origin main
```

### 4️⃣ Vercel (2 dk)

- [ ] [vercel.com](https://vercel.com) → GitHub ile giriş
- [ ] Add New → Project → Repo seç → Import
- [ ] Environment Variables ekle (Supabase URL + Key)
- [ ] Deploy → Visit

---

## 🎉 BİTTİ!

Siten yayında: `https://okey.vercel.app`

---

## 📋 SQL Kodu (Kopyala-Yapıştır)

Supabase SQL Editor'a yapıştır:

```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.game_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  host_id UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'waiting',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.game_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  tiles JSONB DEFAULT '[]',
  is_ready BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Anyone can view game rooms" ON public.game_rooms FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create game rooms" ON public.game_rooms FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Anyone can view game players" ON public.game_players FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create game players" ON public.game_players FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

---

## 📋 .env Dosyası

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## 🔗 Linkler

- Supabase: https://app.supabase.com
- Vercel: https://vercel.com
- GitHub: https://github.com

---

**Sorun yaşarsan → DEPLOY_REHBERI.md'ye bak!**
