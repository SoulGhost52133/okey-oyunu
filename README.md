# 🎴 Online Okey Oyunu

Modern, web tabanlı, Supabase entegrasyonlu ücretsiz Okey oyunu!

## ✨ Özellikler

- 🔐 **Kullanıcı Kimlik Doğrulama**: Supabase Auth ile güvenli giriş/kayıt
- 🎮 **Tam Okey Oyunu**: Gerçek Okey kuralları ile 4 kişilik oyun
- 🎨 **Modern Arayüz**: Tailwind CSS ile responsive ve güzel tasarım
- 🆓 **Tamamen Ücretsiz**: Supabase free tier ile hosting dahil her şey ücretsiz
- 📱 **Responsive**: Mobil ve masaüstü uyumlu

## 🚀 Hızlı Başlangıç

### 1. Supabase Projesi Oluştur

1. [supabase.com](https://supabase.com) adresine git
2. Ücretsiz hesap oluştur
3. "New Project" butonuna tıkla
4. Proje adı seç (örn: okey-oyunu)
5. Database şifresi belirle
6. Region seç (Europe için Frankfurt önerilir)
7. "Create new project" tıkla (2-3 dakika sürer)

### 2. Database Tablolarını Oluştur

Supabase Dashboard'da SQL Editor'e git ve aşağıdaki SQL'i çalıştır:

```sql
-- Profiles tablosu
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0
);

-- Game rooms tablosu
CREATE TABLE game_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  host_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  current_turn UUID REFERENCES profiles(id),
  okey_tile JSONB
);

-- Game players tablosu
CREATE TABLE game_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  tiles JSONB DEFAULT '[]',
  score INTEGER DEFAULT 0,
  is_ready BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Game rooms policies
CREATE POLICY "Anyone can view game rooms" ON game_rooms
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create game rooms" ON game_rooms
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Game players policies
CREATE POLICY "Anyone can view game players" ON game_players
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create game players" ON game_players
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### 3. API Anahtarlarını Al

1. Supabase Dashboard'da **Settings** → **API**'ye git
2. **Project URL**'yi kopyala
3. **anon public** key'i kopyala

### 4. Proje Dosyasını Güncelle

`src/lib/supabase.ts` dosyasını aç ve şu satırları güncelle:

```typescript
const supabaseUrl = 'https://YOUR-PROJECT-ID.supabase.co';
const supabaseAnonKey = 'YOUR-ANON-KEY';
```

Değerleri Supabase'den aldıklarınla değiştir.

### 5. Projeyi Çalıştır

```bash
npm install
npm run dev
```

Tarayıcıda `http://localhost:5173` adresini aç.

## 🌐 Ücretsiz Hosting (Vercel)

### 1. GitHub'a Push Et

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/okey-oyunu.git
git push -u origin main
```

### 2. Vercel'de Deploy Et

1. [vercel.com](https://vercel.com) adresine git
2. GitHub ile giriş yap
3. "New Project" tıkla
4. GitHub repository'ni seç
5. "Deploy" tıkla
6. 1-2 dakika içinde siten yayında!

### 3. Environment Variables Ekle

Vercel Dashboard'da:
1. Project Settings → Environment Variables
2. Şu değişkenleri ekle:
   - `VITE_SUPABASE_URL`: Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Supabase anon key

Not: Şu an kod hardcoded, istersen `.env` dosyası oluşturabilirsin:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Ve `src/lib/supabase.ts`'yi güncelle:

```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

## 🎮 Oyun Kuralları

### Temel Kurallar
- 4 oyuncu ile oynanır
- 106 taş vardır (104 normal + 2 sahte okey)
- Her oyuncuya 13 taş dağıtılır (dağıtıcıya 14)
- Amaç: 10 çift + 1 taş yaparak "OKEY!" demek

### Puanlama
- Okey diyen oyuncu kazanır
- Kaybedenler elindeki taşların toplam değerini öder
- Okey taşı 0 puan
- Sahte okeyler 0 puan
- Diğer taşlar üzerindeki sayı kadar puan

## 🛠️ Teknolojiler

- **React 18** - UI Framework
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Backend & Auth
- **Lucide React** - Icons

## 📝 Notlar

- Bu demo versiyonu tek oyunculu simülasyon içerir
- Gerçek çok oyunculu oyun için Supabase Realtime kullanılabilir
- Supabase free tier: 500MB database, 50,000 monthly active users
- Vercel free tier: Unlimited deployments, 100GB bandwidth/month

## 🎯 Gelecek Geliştirmeler

- [ ] Gerçek zamanlı çok oyunculu oyun (Supabase Realtime)
- [ ] Sohbet özelliği
- [ ] Oyuncu profilleri ve istatistikler
- [ ] Turnuva modu
- [ ] Ses efektleri
- [ ] Daha gelişmiş AI rakipler

## 📄 Lisans

MIT License - Ücretsiz kullanabilir, değiştirebilir, dağıtabilirsin!

## 🙏 Katkıda Bulun

Issues ve PR'lar açık! Birlikte daha iyi yapalım.

---

**Keyifli oyunlar! 🎴**
