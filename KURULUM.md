# 🎴 Okey Oyunu - Kurulum Rehberi

Merhaba! Bu rehber ile Okey oyununu tamamen ücretsiz olarak kurup yayınlayabilirsin.

## 📋 Gereksinimler

- Node.js (v18 veya üzeri)
- GitHub hesabı
- Supabase hesabı (ücretsiz)
- Vercel hesabı (ücretsiz)

## 🚀 Adım Adım Kurulum

### 1️⃣ Supabase Projesi Oluştur (5 dakika)

1. **supabase.com** adresine git
2. "Start your project" butonuna tıkla
3. GitHub veya email ile kayıt ol
4. "New Project" tıkla
5. Bilgileri doldur:
   - **Name**: `okey-oyunu` (veya istediğin isim)
   - **Database Password**: Güçlü bir şifre belirle (kaydet!)
   - **Region**: `Europe (Frankfurt)` (Türkiye'ye yakın)
6. "Create new project" tıkla
7. 2-3 dakika bekle, proje hazır!

### 2️⃣ Database Tablolarını Kur (2 dakika)

1. Supabase Dashboard'da sol menüden **SQL Editor** tıkla
2. "New query" tıkla
3. Aşağıdaki SQL kodunu kopyala-yapıştır:

```sql
-- Profil tablosu
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0
);

-- Oyun odaları
CREATE TABLE IF NOT EXISTS game_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  host_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  current_turn UUID REFERENCES profiles(id),
  okey_tile JSONB
);

-- Oyuncular
CREATE TABLE IF NOT EXISTS game_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  tiles JSONB DEFAULT '[]',
  score INTEGER DEFAULT 0,
  is_ready BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Güvenlik politikaları
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;

-- Profil izinleri
CREATE POLICY "Kullanıcılar kendi profillerini görebilir" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Kullanıcılar kendi profillerini oluşturabilir" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Kullanıcılar kendi profillerini güncelleyebilir" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Oyun odası izinleri
CREATE POLICY "Herkes oyun odalarını görebilir" ON game_rooms
  FOR SELECT USING (true);

CREATE POLICY "Giriş yapmış kullanıcılar oyun odası oluşturabilir" ON game_rooms
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Oyuncu izinleri
CREATE POLICY "Herkes oyuncuları görebilir" ON game_players
  FOR SELECT USING (true);

CREATE POLICY "Giriş yapmış kullanıcılar oyuncu oluşturabilir" ON game_players
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

4. "Run" tıkla
5. Tüm tablolar başarıyla oluşturuldu! ✅

### 3️⃣ API Anahtarlarını Al (1 dakika)

1. Sol menüden **Settings** (dişli çark) tıkla
2. **API** sekmesine git
3. İki değeri kopyala:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGc...` (uzun bir string)

### 4️⃣ Projeyi Bilgisayarına İndir (2 dakika)

```bash
# Projeyi klonla veya dosyaları oluştur
cd okey-oyunu

# Bağımlılıkları yükle
npm install

# .env dosyası oluştur
cp .env.example .env
```

### 5️⃣ .env Dosyasını Düzenle (1 dakika)

`.env` dosyasını aç ve Supabase'den aldığın değerleri yapıştır:

```env
VITE_SUPABASE_URL=https://senin-proje-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...senin-anon-key...
```

### 6️⃣ Test Et (1 dakika)

```bash
# Geliştirme modunda çalıştır
npm run dev
```

Tarayıcıda `http://localhost:5173` aç ve test et!

### 7️⃣ GitHub'a Yükle (2 dakika)

```bash
# Git başlat
git init
git add .
git commit -m "Okey oyunu ilk versiyon"

# GitHub'da yeni repo oluştur (github.com/new)
# Sonra remote'u ekle ve push et
git branch -M main
git remote add origin https://github.com/KULLANICI-ADIN/okey-oyunu.git
git push -u origin main
```

### 8️⃣ Vercel'de Yayınla (3 dakika)

1. **vercel.com** adresine git
2. GitHub ile giriş yap
3. "Add New..." → "Project" tıkla
4. `okey-oyunu` repository'ni seç
5. "Import" tıkla
6. **Environment Variables** bölümünde:
   - `VITE_SUPABASE_URL` ekle
   - `VITE_SUPABASE_ANON_KEY` ekle
7. "Deploy" tıkla
8. 1-2 dakika bekle...
9. 🎉 **Tebrikler! Siten yayında!**

## 🎮 Test Kullanıcıları

Giriş yapmak için:
- Email: `test@example.com`
- Şifre: `test123`

Veya yeni hesap oluşturabilirsin!

## 💰 Maliyet

| Hizmet | Plan | Maliyet |
|--------|------|---------|
| Supabase | Free | ₺0/ay |
| Vercel | Hobby | ₺0/ay |
| GitHub | Free | ₺0/ay |
| **TOPLAM** | | **₺0/ay** 🎉 |

### Free Tier Limitleri

**Supabase:**
- 500 MB Database
- 50,000 aylık aktif kullanıcı
- 2 GB bandwidth
- 500 MB dosya depolama

**Vercel:**
- Unlimited deploy
- 100 GB bandwidth/ay
- 100 GB build minutes/ay

Bu limitler başlangıç için fazlasıyla yeterli!

## 🔧 Sorun Giderme

### "Build failed" hatası
```bash
# Node.js versiyonunu kontrol et
node --version  # v18+ olmalı

# Bağımlılıkları temizle ve yeniden yükle
rm -rf node_modules package-lock.json
npm install
npm run build
```

### "Supabase connection error"
- `.env` dosyasının doğru olduğundan emin ol
- Supabase proje URL'sini kontrol et
- Anon key'in doğru kopyalandığından emin ol

### "Database error"
- SQL Editor'de tabloların oluşturulduğunu kontrol et
- RLS politikalarının aktif olduğundan emin ol

## 📱 Mobil Uygulama Olarak Kullan

Vercel'de yayınlandıktan sonra:
1. Telefonda tarayıcıyı aç
2. Sitenin URL'sine git
3. Tarayıcı menüsünden "Ana ekrana ekle"
4. Artık bir app gibi kullanabilirsin! 📱

## 🎯 Sonraki Adımlar

- [ ] Gerçek zamanlı çok oyunculu oyun ekle
- [ ] Sohbet özelliği ekle
- [ ] Özel oyun odaları oluştur
- [ ] Turnuvalar düzenle
- [ ] Ses efektleri ekle

## 📞 Yardım

Sorun yaşarsan:
1. README.md dosyasını kontrol et
2. Supabase docs: https://supabase.com/docs
3. Vercel docs: https://vercel.com/docs

---

**Keyifli oyunlar! 🎴**

*Bu rehber 2026 yılında günceldir.*
