# 🚀 Vercel & Supabase Kurulum Rehberi - Adım Adım

Bu rehber ile Okey oyununu **15 dakikada** yayınlayabilirsin!

---

## 📋 Bölüm 1: Supabase Kurulumu (10 dakika)

### Adım 1: Supabase Hesabı Oluştur

1. **Tarayıcıyı aç** → [supabase.com](https://supabase.com) git
2. Sağ üstte **"Start your project"** tıkla
3. **Sign Up** sayfasında:
   - GitHub ile giriş yap (önerilir) VEYA
   - Email ve şifre ile kayıt ol
4. Email doğrulama yap (gerekirse)

### Adım 2: Yeni Proje Oluştur

1. Dashboard'da **"New Project"** butonuna tıkla
2. Proje bilgilerini doldur:

```
Organization: [Mevcut organizasyonun veya "Create new"]
Name: okey-oyunu
Database Password: GucluSifre123! (BUNU KAYDET!)
Region: Europe (Frankfurt) ← Türkiye'ye en yakın
```

3. **"Create new project"** tıkla
4. ⏳ 2-3 dakika bekle (proje oluşturuluyor)
5. ✅ **"Continue to dashboard"** tıkla

### Adım 3: Database Tablolarını Oluştur

1. Sol menüden **SQL Editor** tıkla (📝 ikonu)
2. **"New query"** butonuna tıkla
3. Aşağıdaki SQL kodunu **kopyala ve yapıştır**:

```sql
-- ============================================
-- OKEY OYUNU DATABASE KURULUMU
-- ============================================

-- 1. KULLANICI PROFİLLERİ TABLOSU
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 2. OYUN ODALARI TABLOSU
CREATE TABLE IF NOT EXISTS public.game_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Okey Odası',
  host_id UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  current_turn UUID REFERENCES public.profiles(id),
  okey_tile JSONB,
  deck JSONB DEFAULT '[]',
  discard_pile JSONB DEFAULT '[]'
);

-- 3. OYUNCULAR TABLOSU
CREATE TABLE IF NOT EXISTS public.game_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  username TEXT,
  tiles JSONB DEFAULT '[]',
  score INTEGER DEFAULT 0,
  is_ready BOOLEAN DEFAULT FALSE,
  seat_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 4. OYUN GEÇMİŞİ TABLOSU
CREATE TABLE IF NOT EXISTS public.game_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.game_rooms(id),
  winner_id UUID REFERENCES public.profiles(id),
  scores JSONB DEFAULT '{}',
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- ============================================

-- Tabloları RLS için aktif et
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFİLLER İÇİN POLİTİKALAR
-- ============================================

-- Kullanıcılar kendi profillerini görebilir
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Kullanıcılar kendi profillerini oluşturabilir
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Kullanıcılar kendi profillerini güncelleyebilir
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Herkes profil bilgilerini görebilir (oyuncu listesi için)
CREATE POLICY "Anyone can view profiles" ON public.profiles
  FOR SELECT
  USING (true);

-- ============================================
-- OYUN ODALARI İÇİN POLİTİKALAR
-- ============================================

-- Herkes oyun odalarını görebilir
CREATE POLICY "Anyone can view game rooms" ON public.game_rooms
  FOR SELECT
  USING (true);

-- Giriş yapmış kullanıcılar oyun odası oluşturabilir
CREATE POLICY "Authenticated users can create game rooms" ON public.game_rooms
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Oda sahibi odayı güncelleyebilir
CREATE POLICY "Host can update own room" ON public.game_rooms
  FOR UPDATE
  USING (auth.uid() = host_id);

-- ============================================
-- OYUNCULAR İÇİN POLİTİKALAR
-- ============================================

-- Herkes oyuncuları görebilir
CREATE POLICY "Anyone can view game players" ON public.game_players
  FOR SELECT
  USING (true);

-- Giriş yapmış kullanıcılar oyuncu oluşturabilir
CREATE POLICY "Authenticated users can create game players" ON public.game_players
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Oyuncu kendi kaydını güncelleyebilir
CREATE POLICY "Players can update own record" ON public.game_players
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- OYUN GEÇMİŞİ İÇİN POLİTİKALAR
-- ============================================

-- Herkes oyun geçmişini görebilir
CREATE POLICY "Anyone can view game history" ON public.game_history
  FOR SELECT
  USING (true);

-- ============================================
-- OTOMATİK PROFİL OLUŞTURMA TRIGGER'I
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auth kullanıcıları için trigger oluştur
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- İNDEKSLER (Performans için)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_game_rooms_status ON public.game_rooms(status);
CREATE INDEX IF NOT EXISTS idx_game_players_room_id ON public.game_players(room_id);
CREATE INDEX IF NOT EXISTS idx_game_players_user_id ON public.game_players(user_id);
CREATE INDEX IF NOT EXISTS idx_game_history_room_id ON public.game_history(room_id);

-- ============================================
-- KURULUM TAMAMLANDI! ✅
-- ============================================
```

4. **"Run"** butonuna tıkla (sağ alt)
5. ✅ **"Success"** mesajını gör
6. Sol menüden **Table Editor** tıkla
7. 4 tablo görmelisin: `profiles`, `game_rooms`, `game_players`, `game_history`

### Adım 4: API Anahtarlarını Al

1. Sol menüden **Settings** tıkla (⚙️ dişli çark)
2. **API** sekmesine git
3. İki değeri **kopyala**:

```
Project URL:
https://xxxxxxxxxxxxx.supabase.co

anon public:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (uzun bir string)
```

4. ⚠️ **BU DEĞERLERİ BİR YERE KAYDET!** (Not defteri vs.)

---

## 📋 Bölüm 2: Proje Hazırlığı (3 dakika)

### Adım 5: .env Dosyası Oluştur

1. Proje klasöründe `.env` dosyası oluştur
2. İçine şunları yaz:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Kaydet

### Adım 6: Test Et

```bash
# Terminalde
npm run dev
```

Tarayıcıda `http://localhost:5173` aç ve test et!

---

## 📋 Bölüm 3: GitHub'a Yükleme (3 dakika)

### Adım 7: GitHub Repository Oluştur

1. [github.com](https://github.com) git
2. Sağ üstte **+** → **"New repository"**
3. Bilgileri doldur:

```
Repository name: okey-oyunu
Description: Online Okey Oyunu - Supabase + Vercel
Visibility: Public (veya Private)
```

4. **"Create repository"** tıkla

### Adım 8: Projeyi Push Et

Terminalde (proje klasöründe):

```bash
# Git başlat
git init

# Tüm dosyaları ekle
git add .

# İlk commit
git commit -m "🎴 Okey oyunu ilk versiyon"

# Branch'i main olarak ayarla
git branch -M main

# Remote'u ekle (KENDI KULLANICI ADINI YAZ)
git remote add origin https://github.com/KULLANICI-ADIN/okey-oyunu.git

# GitHub'a yükle
git push -u origin main
```

⚠️ `KULLANICI-ADIN` yerine kendi GitHub kullanıcı adını yaz!

---

## 📋 Bölüm 4: Vercel'de Yayınla (5 dakika)

### Adım 9: Vercel Hesabı Oluştur

1. [vercel.com](https://vercel.com) git
2. **"Sign Up"** tıkla
3. **GitHub ile giriş yap** (önerilir)
4. İlk kullanım için birkaç soru soracak, geçebilirsin

### Adım 10: Projeyi Import Et

1. Vercel Dashboard'da **"Add New..."** → **"Project"** tıkla
2. **"Import Git Repository"** altında GitHub reposunu gör
3. **okey-oyunu** reposunun yanındaki **"Import"** tıkla

### Adım 11: Environment Variables Ekle

1. **"Configure Project"** sayfasında **"Environment Variables"** aç
2. **"Add New"** tıkla ve ekle:

```
Name: VITE_SUPABASE_URL
Value: https://xxxxxxxxxxxxx.supabase.co
```

3. Tekrar **"Add New"** tıkla:

```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. **"Save"** tıkla

### Adım 12: Deploy Et!

1. **"Deploy"** butonuna tıkla
2. ⏳ 1-2 dakika bekle (build süreci)
3. ✅ **"Congratulations!"** ekranını gör
4. **"Continue to Dashboard"** tıkla

### Adım 13: Siteni Aç

1. Vercel Dashboard'da projen görünür
2. **"Visit"** butonuna tıkla
3. 🎉 **Siten yayında!**

URL şöyle olacak: `https://okey-oyunu.vercel.app`

---

## 📋 Bölüm 5: Test ve Paylaşım (2 dakika)

### Adım 14: Siteyi Test Et

1. Siteyi aç: `https://okey-oyunu.vercel.app`
2. **Kayıt Ol** tıkla
3. Email ve şifre gir
4. Kayıt ol
5. Oyuna gir ve test et!

### Adım 15: Paylaş!

- URL'yi arkadaşlarınla paylaş
- Sosyal medyada paylaş
- QR kod oluştur (vercel dashboard'da var)

---

## 🔧 Sorun Giderme

### ❌ "Build failed" hatası

**Çözüm:**
```bash
# Localde test et
npm run build

# Hata varsa düzelt
# Sonra tekrar push et
git add .
git commit -m "Build hatası düzeltildi"
git push
```

### ❌ "Supabase connection error"

**Kontrol listesi:**
- [ ] `.env` dosyası doğru mu?
- [ ] Vercel'de Environment Variables eklendi mi?
- [ ] Supabase URL doğru mu?
- [ ] Anon key kopyalandı mı?

**Çözüm:**
1. Vercel Dashboard → Project Settings → Environment Variables
2. Değerleri kontrol et
3. Gerekirse yeniden ekle
4. **"Redeploy"** tıkla (Deployments → ... → Redeploy)

### ❌ "Database error" veya "Table doesn't exist"

**Çözüm:**
1. Supabase Dashboard → SQL Editor
2. SQL kodunu tekrar çalıştır
3. Table Editor'de tabloları kontrol et

### ❌ "Authentication failed"

**Çözüm:**
1. Supabase Dashboard → Authentication → Providers
2. Email provider'ın aktif olduğundan emin ol
3. Settings → Auth → Site URL'yi kontrol et:
   - Site URL: `https://okey-oyunu.vercel.app`
   - Redirect URLs: `https://okey-oyunu.vercel.app/*`

---

## 🎯 Custom Domain (Opsiyonel)

Kendi domain'in varsa:

1. Vercel Dashboard → Project Settings → Domains
2. Domain ekle: `okey.oyun.com`
3. DNS ayarlarını yap:
   ```
   Type: CNAME
   Name: @ veya okey
   Value: cname.vercel-dns.com
   ```
4. SSL otomatik aktif olur!

---

## 📊 Vercel Dashboard Kullanımı

### Deployments
- Her git push otomatik deploy
- Geçmiş deploy'ları görebilirsin
- Rollback yapabilirsin

### Analytics
- Ziyaretçi sayıları
- Sayfa görüntülemeleri
- Performans metrikleri

### Settings
- Environment Variables
- Build Settings
- Git Integration

---

## 💡 İpuçları

### 1. Otomatik Deploy
- Her `git push` otomatik deploy eder
- Branch'ler için preview URL'ler oluşur

### 2. Environment Variables
- Production ve Preview için ayrı ayarlayabilirsin
- Vercel CLI ile localde test edebilirsin:
  ```bash
  npm i -g vercel
  vercel link
  vercel env pull
  ```

### 3. Build Logs
- Deployments → [Deploy] → View Build Logs
- Hataları buradan görebilirsin

### 4. Rollback
- Deployments → [Önceki Deploy] → Promote to Production

---

## 🎉 Tebrikler!

✅ Supabase database kurulu  
✅ GitHub repository oluşturuldu  
✅ Vercel'de yayınlandı  
✅ Site erişilebilir  

**Toplam Süre: ~15 dakika** ⏱️

---

## 📞 Yardım

### Supabase
- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com

### Vercel
- Docs: https://vercel.com/docs
- Support: https://vercel.com/support

### Proje
- Issues aç: GitHub repository
- Sorular: README.md'ye bak

---

## 🔗 Önemli Linkler

| Servis | URL |
|--------|-----|
| Supabase Dashboard | https://app.supabase.com |
| Vercel Dashboard | https://vercel.com/dashboard |
| GitHub | https://github.com |
| Proje Repo | https://github.com/SENIN-ADIN/okey-oyunu |
| Canlı Site | https://okey-oyunu.vercel.app |

---

**Keyifli oyunlar! 🎴**

*Son güncelleme: 2026*
