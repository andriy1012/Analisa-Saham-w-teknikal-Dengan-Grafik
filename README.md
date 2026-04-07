# 💹 Stock Analyzer dengan Diagram Visual

Analisis saham Indonesia dengan **diagram dan chart visual** di terminal!
Awas **Suhu CPU bisa naik Soalnya makek JS** kalau bisa konvert ke GO/Rust 

## 🚀 Quick Start

```bash
cd stock-analyzer
npm install
npm start
```

## 📊 Fitur Diagram Visual

### 1. **Price Chart** 📈
Line chart interaktif yang menampilkan pergerakan harga saham.

```
   2900 │                    ●──●
        │               ●───│
   2850 │          ●───│    │
        │     ●────│    │   │
   2800 │●────│    │   │    │
        └───────────────────────
   📈 Current: 2850 | Change: +2.5%
```

### 2. **RSI Gauge** 📊
Visual gauge meter untuk melihat apakah saham overbought/oversold.

```
  ┌────────────────────────────────────────────┐
  │░░░░░░░░░░████████████░░░░░░░░░░░░░░░░░░░░│
  │ 0      30        50        70       100   │
  │  OVER   NORMAL              OVER           │
  │  SOLD                     BOUGHT          │
  └────────────────────────────────────────────┘
  🟡 RSI: 58.45 - Normal
```

### 3. **MACD Chart** 📉
Visualisasi momentum dan trend.

```
  ┌────────────────────────────────────────────┐
  │ MACD Line:    45.3200                      │
  │ Signal Line:  38.2100                      │
  │ Histogram:    7.1100                       │
  └────────────────────────────────────────────┘
  Histogram: ████████████░░░░░░░░ ▲ BULLISH
```

### 4. **Fibonacci Levels** 📐
Level-level penting Fibonacci retracement.

```
  ┌──────────────────────────────────────────────┐
  │ 0% (High)         3100 │──────────●──────────│
  │ 23.6%             2958 │───────●─────────────│
  │ 38.2% (Resist)    2870 │─────●──────────────│ ◀═══ HARGA DI SINI
  │ 50%               2800 │───●────────────────│
  │ 61.8% (Support)   2729 │─●──────────────────│
  │ 100% (Low)        2500 │●───────────────────│
  └──────────────────────────────────────────────┘
```

### 5. **Volume Chart** 📊
Visualisasi volume trading dengan warna.

```
    │░░▓░░▓▓▓░░▓▓▓▓▓░░░▓▓░░░░░░▓▓▓▓░░░
    └─────────────────────────────────────
    Max: 125.50M shares
    (▓ = Volume naik, ░ = Volume turun)
```

### 6. **Moving Averages** 📈
Visual comparison harga vs MA lines.

```
  ┌────────────────────────────────────────────────┐
  │ MA5    2820 ────────────●───────────── 🟢      │
  │ MA10   2795 ────────●──────────────── 🟢       │
  │ MA20   2750 ─────●────────────────── 🟢        │
  │ MA50   2680 ──●──────────────────── 🟢         │
  │ HARGA  2850 ───────────────●──────── ⭐        │
  └────────────────────────────────────────────────┘
```

## 🎮 Cara Pakai

```
🔍 > teknikal ADRO 30
```

Akan menampilkan:
- 📈 **Price Chart** - Pergerakan harga 30 hari
- 📊 **Moving Averages** - MA5, MA10, MA20, MA50
- 📊 **RSI Gauge** - Overbought/Oversold meter
- 📈 **MACD** - Momentum visualization
- 📐 **Fibonacci** - Support/Resistance levels
- 📊 **Volume** - Trading volume bars
- 🎯 **Signal** - BULLISH/BEARISH/NETRAL
- 💡 **Rekomendasi** - BUY/SELL/HOLD + Target & Stop Loss

## 💡 Contoh Output

```
🔍 > teknikal BBRI 30

═══════════════════════════════════════════════════
  📊 ANALISIS TEKNIKAL: BBRI
═══════════════════════════════════════════════════

═══════════════════════════════════════════════════
  📈 HARGA SAHAM: BBRI
═══════════════════════════════════════════════════

   5200 │              ●───●
        │         ●───│
   5150 │    ●───│    │
        │ ●──│    │   │
   5100 ││    │   │   │
        └──────────────────────────────
   📈 Current: 5175 | Change: +3.2%

═══════════════════════════════════════════════════
  📊 MOVING AVERAGES
═══════════════════════════════════════════════════

  ┌────────────────────────────────────────────────┐
  │ MA5    5160 ───────────●────────────── 🟢      │
  │ MA10   5140 ────────●─────────────── 🟢       │
  │ MA20   5100 ──────●──────────────── 🟢        │
  │ MA50   5050 ────●────────────────── 🟢         │
  │ HARGA  5175 ────────────●────────── ⭐        │
  └────────────────────────────────────────────────┘

✅ Harga di atas 4/4 MA (BULLISH)

═══════════════════════════════════════════════════
  📊 RSI GAUGE
═══════════════════════════════════════════════════

  ┌────────────────────────────────────────────┐
  │░░░░░░░░░░███████████░░░░░░░░░░░░░░░░░░░░░│
  │ 0      30        50        70       100  │
  │  OVER   NORMAL              OVER         │
  │  SOLD                     BOUGHT         │
  └────────────────────────────────────────────┘
  🟡 RSI: 58.45 - Normal

═══════════════════════════════════════════════════
  🎯 SINYAL KESELURUHAN
═══════════════════════════════════════════════════
  🟢 BULLISH
  Confidence: 72%
  Bullish: 5 | Bearish: 1 | Netral: 2

═══════════════════════════════════════════════════
  💡 REKOMENDASI
═══════════════════════════════════════════════════
  ✅ Sinyal BULLISH kuat - Potensi naik
  💡 Pertimbangkan untuk BUY
  🎯 Target Price: 5,250
  🛡️  Stop Loss: 5,050
```

## 📦 Tech Stack

- Node.js (ES Modules)
- Puppeteer (Browser automation)
- Custom ASCII/Unicode chart renderer

## 🎯 Fitur Utama

- ✅ **Visual Charts** - Price chart, RSI gauge, MACD, Fibonacci
- ✅ **Interactive** - CLI dengan prompt interaktif
- ✅ **Bahasa Indonesia** - Semua output dalam Bahasa Indonesia
- ✅ **Real-time Data** - Data langsung dari Yahoo Finance
- ✅ **Technical Analysis** - MA, RSI, MACD, Fibonacci, Volume
- ✅ **Auto Signal** - BULLISH/BEARISH/NETRAL + Confidence
- ✅ **Rekomendasi** - BUY/SELL/HOLD + Target & Stop Loss

## ⚠️ Catatan

- Web scraping tergantung pada struktur website
- Pastikan koneksi internet stabil
- Untuk production, gunakan API resmi
- Bukan saran investasi, hanya untuk edukasi

## 📝 License

MIT
