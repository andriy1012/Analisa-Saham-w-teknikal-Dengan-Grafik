# 💹 Stock Analyzer dengan Diagram Visual

Analisis saham Indonesia dengan **diagram dan chart visual** di terminal!
Awas **Suhu CPU bisa naik Soalnya makek JS** kalau bisa konvert ke GO/Rust
kalau sudah exit tetep panas di Linux ```bash ps aux | grep node```

## 🚀 Quick Start

```bash
cd "Prediksi Saham Real Time 5 menit"
npm install
npm start
```

## ✨ Fitur Baru (Update Terbaru!)

### 🕐 Data 5 Menit + Harian
- **7 hari terakhir**: Data interval **5 menit** (super detail & akurat)
- **23 hari sebelumnya**: Data **harian** (konteks jangka panjang)
- Total: **~500 data points** untuk analisis mendalam
- Chart menampilkan **tanggal & waktu per 5 menit**

### 📊 MACD + Prediksi Potensi Pergerakan
MACD sekarang menampilkan **prediksi persentase** potensi naik/turun:
```
📊 BEARISH - Potensi turun ~0.04% (momentum negatif)
📊 BULLISH - Potensi naik ~1.5% (momentum positif)
```

### 📐 Fibonacci + Keterangan Lengkap
Setiap level Fibonacci sekarang punya **penjelasan arti**:
- 🔴 **ATAS (Overbought)** - Harga di pucuk, potensi turun
- ⚪ **NEUTRAL (50%)** - Market ragu-ragu
- 🟢 **BAWAH (Oversold)** - Harga di dasar, potensi rebound
- Dan lainnya dengan rekomendasi jelas!

### 🎯 Trading Recommendation Lengkap
- **💲 Harga Sekarang** - Ditampilkan jelas di bagian kesimpulan
- **📍 Zona Beli** - Range support untuk entry ideal
- **💰 Take Profit 3 Level** - Konservatif, Moderat, Agresif
- **🛡️ Stop Loss** - Batas cut loss (3% di bawah support)
- **⚖️ Risk/Reward Ratio** - Perbandingan risiko vs potensi profit
- **📊 Strategi Trading** - Saran entry/hold/wait berdasarkan posisi harga

## 📊 Fitur Diagram Visual

### 1. **Price Chart** 📈
Line chart interaktif dengan **timestamp 5 menit**, menampilkan pergerakan harga real-time.

```
       520 │●                                                            
           │─                                                            
       515 │─                                                           ─ 
           │─                                                          ─  
       510 │─                                                         ─   
           └─────────────────────────────────────────────────────────────
            07/04/2026, 09.00 → 08/04/2026, 16.10

📈 Current: 515 | Change: +2.5%
```

### 2. **RSI Gauge** 📊
Visual gauge meter untuk melihat apakah saham overbought/oversold.

```
  ┌────────────────────────────────────────────┐
  │🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟡🟡🟡◀🟡🟡🟡🟡🟡🟡🟡🔴🔴🔴🔴🔴🔴│
  │ 0         30        50        70       100  │
  │  OVER    NORMAL              OVER           │
  │  SOLD                     BOUGHT           │
  └────────────────────────────────────────────┘
  🟡 RSI: 58.45 - Normal
```

### 3. **MACD Chart + Prediksi** 📉
Visualisasi momentum dengan **prediksi persentase** potensi pergerakan harga.

```
  ┌────────────────────────────────────────────┐
  │ MACD Line:    10.9819                        │
  │ Signal Line:  13.4421                        │
  │ Histogram:    -2.4602                        │
  └────────────────────────────────────────────┘
  Histogram: ░░░░░░░░░░░░░░░░░░░░██████████ ▼ BEARISH
  
  📊 BEARISH - Potensi turun ~0.48% (momentum negatif)
```

### 4. **Fibonacci Levels + Keterangan** 📐
Level-level penting Fibonacci dengan **penjelasan arti** dan rekomendasi.

```
  ┌──────────────────────────────────────────────┐
  0% (High)            300 │●─────────────────────────────────────│
  23.6%                277 │────────●─────────────────────────────│
  38.2%                263 │──────────────●───────────────────────│
  50%                  252 │───────────────────●──────────────────│ ◀══ HARGA DI SINI
  61.8%                241 │───────────────────────●──────────────│
  100% (Low)           204 │─────────────────────────────────────●│
  └──────────────────────────────────────────────┘
  ⭐ Harga terdekat ke level 50% (252)

  📖 KETERANGAN:
  Kondisi: ⚪ NEUTRAL (50% Level)
  Harga di tengah - market ragu-ragu antara bullish dan bearish
  ⏸️ Tunggu breakout/breakdown dari level 50%
```

### 5. **Volume Chart** 📊
Visualisasi volume trading dengan **timestamp** dan warna.

```
    │                                                                 
    │ ░                                                               
    │░░                                                               
    │░░░░▓▓▓░▓▓░░▓░░▓▓░▓▓░▓▓▓▓▓▓▓▓ ▓▓▓▓▓░▓▓▓▓░▓░▓▓▓▓░▓▓ ░▓▓▓▓▓▓▓░     
    └─────────────────────────────────────────────────────────────────
    Max: 254.95M shares | 07/04/2026, 09.00 → 08/04/2026, 16.10
    (▓ = Volume naik, ░ = Volume turun)
```

### 6. **Moving Averages** 📈
Visual comparison harga vs MA lines.

```
  ┌─────────────────────────────────────────────────────┐
  │ MA5         514 ───────────────────●───────────────────────── 🟢
  │ MA10        515 ────────────────────────────────●──────────── 🟢
  │ MA20        513 ●──────────────────────────────────────────── 🟢
  │ MA50        515 ────────────────────────────────────────────● 🔴
  │ HARGA       515 ────────────────────────────────────────────★ ⭐
  └─────────────────────────────────────────────────────┘

  ✅ Harga di atas 3/4 MA (BULLISH)
```

### 7. **Trading Recommendation** 🎯
**Fitur BARU!** Rekomendasi trading lengkap dengan zona beli, take profit, dan stop loss.

```
💲 HARGA SEKARANG: 515.00
📊 Posisi: ✅ Harga di ZONA BELI - Bagus untuk entry
────────────────────────────────────────────────────────

📍 ZONA BELI (Buy Zone):
   Support          : 505.00
   Batas Atas       : 515.10
   ✅ Harga di zona BELI - Bagus untuk entry

💰 TARGET TAKE PROFIT (jika beli di zona support):
   TP1 (Konservatif): 520.00 → Potensi: 2.97%
                       Kalau beli di support (505)
   TP2 (Moderat)    : 535.60 → Potensi: 6.06%
                       Kalau beli di support (505)
   TP3 (Agresif)    : 545.35 → Potensi: 8.00%
                       Kalau beli di support (505)

🛡️  STOP LOSS:
   Harga Stop Loss  : 489.85
   Risiko           : -3.00% (dari zona beli)
   JUAL jika harga turun di bawah level ini

⚖️  RISK/REWARD RATIO:
   Ratio            : 1:5.34
   ✅ Risiko/Reward BAGUS

📊 STRATEGI TRADING:
────────────────────────────────────────────────────────
  ✅ Harga saat ini di ZONA BELI - Bagus untuk entry
  🎯 Entry sekarang di: 515.00
  🎯 Target TP1: 520.00 (2.97%)
  🛡️  Stop Loss di: 489.85 (-3.00%)
```

## 🎮 Cara Pakai

```
🔍 > BBRI
```
atau
```
🔍 > ADRO 30
```

Akan menampilkan:
- 📈 **Price Chart** - Pergerakan harga dengan timestamp 5 menit
- 📊 **Moving Averages** - MA5, MA10, MA20, MA50
- 📊 **RSI Gauge** - Overbought/Oversold meter
- 📈 **MACD + Prediksi** - Momentum + potensi pergerakan (%)
- 📐 **Fibonacci + Keterangan** - Level lengkap dengan arti
- 📊 **Volume** - Trading volume bars dengan waktu
- 🎯 **Signal** - BULLISH/BEARISH/NETRAL + Confidence
- 💡 **Trading Recommendation** - Zona Beli, Take Profit, Stop Loss, Risk/Reward

## 💡 Contoh Saham

- **Blue Chip**: BBRI, BBCA, BMRI, TLKM
- **Energy**: ADRO, PTBA, UNTR
- **Property**: BSDE, SMRA, CTRA
- **Tech**: GOTO, BUKA, EMTK

## ⚡ Cara Kerja Data

Aplikasi menggabungkan **2 sumber data**:
1. **5-menit interval** (7 hari terakhir) - Super detail untuk analisis jangka pendek
2. **Daily interval** (hingga 30 hari) - Konteks trend jangka panjang

Hasilnya: **~500 data points** untuk analisis teknikal yang akurat!

## 📦 Tech Stack

- Node.js (ES Modules)
- Puppeteer (Browser automation)
- Yahoo Finance API (Gratis, tanpa API key)
- Custom ASCII/Unicode chart renderer

## 🎯 Fitur Utama

- ✅ **Data 5 Menit** - Detail & akurat untuk trading jangka pendek
- ✅ **Visual Charts** - Price chart, RSI gauge, MACD, Fibonacci dengan timestamp
- ✅ **MACD Prediction** - Prediksi persentase potensi naik/turun
- ✅ **Fibonacci Explanation** - Penjelasan arti setiap level
- ✅ **Trading Recommendation** - Buy Zone, TP, SL, Risk/Reward lengkap
- ✅ **Interactive** - CLI dengan prompt interaktif
- ✅ **Bahasa Indonesia** - Semua output dalam Bahasa Indonesia
- ✅ **Real-time Data** - Data langsung dari Yahoo Finance
- ✅ **Technical Analysis** - MA, RSI, MACD, Fibonacci, Volume
- ✅ **Auto Signal** - BULLISH/BEARISH/NETRAL + Confidence
- ✅ **Harga Sekarang** - Ditampilkan jelas di kesimpulan

## ⚠️ Catatan

- Web scraping & API tergantung pada struktur website Yahoo Finance
- Pastikan koneksi internet stabil
- Untuk production, pertimbangkan API resmi berbayar
- **Bukan saran investasi**, hanya untuk edukasi dan analisis
- Data 5 menit tersedia untuk 7 hari terakhir (limitasi Yahoo Finance)

## 📝 License

MIT
