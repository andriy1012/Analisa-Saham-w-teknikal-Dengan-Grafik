import { createPage } from '../utils/browser.js';

/**
 * Convert ticker to Yahoo Finance format
 */
function toYahooTicker(ticker) {
  if (ticker.includes('.')) return ticker;
  return `${ticker}.JK`;
}

/**
 * Fetch historical stock data with 5-minute intervals via Yahoo Finance API
 * Combines 5-min data (last 7 days) + daily data (up to 30 days)
 */
export async function fetchHistoricalData(browser, ticker, days = 30) {
  const page = await createPage(browser);
  const historicalData = [];
  const yahooTicker = toYahooTicker(ticker);

  try {
    console.log(`📅 Fetching data for ${ticker} (${days} days)...`);

    // Step 1: Fetch 5-minute data for last 7 days (most accurate for recent data)
    console.log(`   ├─ Mengambil data 5 menit (7 hari terakhir)...`);
    const url5m = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooTicker}?interval=5m&range=7d`;
    
    await page.goto(url5m, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });
    await new Promise(resolve => setTimeout(resolve, 2000));

    const apiData5m = await page.evaluate(() => {
      const body = document.querySelector('pre');
      if (body) {
        try {
          return JSON.parse(body.textContent);
        } catch (e) {
          return null;
        }
      }
      return null;
    });

    if (apiData5m && apiData5m.chart && apiData5m.chart.result) {
      const result = apiData5m.chart.result[0];
      const timestamps = result.timestamp;
      const quote = result.indicators.quote[0];

      console.log(`   └─ ✅ Got ${timestamps.length} data points 5-menit`);

      timestamps.forEach((ts, i) => {
        const date = new Date(ts * 1000);
        const dateStr = date.toLocaleString('id-ID', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });

        const close = quote.close?.[i];
        if (close && close > 0) {
          historicalData.push({
            date: dateStr,
            timestamp: ts,
            open: quote.open?.[i] || close,
            high: quote.high?.[i] || close,
            low: quote.low?.[i] || close,
            close: close,
            volume: quote.volume?.[i] || 0
          });
        }
      });
    }

    // Step 2: Fetch daily data for longer history (if requested days > 7)
    if (days > 7) {
      console.log(`   ├─ Mengambil data harian (${days} hari untuk konteks jangka panjang)...`);
      const urlDaily = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooTicker}?interval=1d&range=${Math.min(days, 90)}d`;
      
      await page.goto(urlDaily, {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });
      await new Promise(resolve => setTimeout(resolve, 2000));

      const apiDataDaily = await page.evaluate(() => {
        const body = document.querySelector('pre');
        if (body) {
          try {
            return JSON.parse(body.textContent);
          } catch (e) {
            return null;
          }
        }
        return null;
      });

      if (apiDataDaily && apiDataDaily.chart && apiDataDaily.chart.result) {
        const result = apiDataDaily.chart.result[0];
        const timestamps = result.timestamp;
        const quote = result.indicators.quote[0];

        console.log(`   └─ ✅ Got ${timestamps.length} data points harian`);

        // Only add data older than 7 days to avoid duplicates
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const sevenDaysAgoSec = Math.floor(sevenDaysAgo / 1000);

        timestamps.forEach((ts, i) => {
          if (ts < sevenDaysAgoSec) { // Only add older data
            const date = new Date(ts * 1000);
            const dateStr = date.toLocaleString('id-ID', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            });

            const close = quote.close?.[i];
            if (close && close > 0) {
              historicalData.push({
                date: dateStr,
                timestamp: ts,
                open: quote.open?.[i] || close,
                high: quote.high?.[i] || close,
                low: quote.low?.[i] || close,
                close: close,
                volume: quote.volume?.[i] || 0
              });
            }
          }
        });
      }
    }

    // Sort by timestamp (newest first)
    historicalData.sort((a, b) => b.timestamp - a.timestamp);

    console.log(`\n✅ Total: ${historicalData.length} data points (5-menit + harian)`);
    return historicalData;

  } catch (err) {
    console.error('❌ Error fetching historical data:', err.message);
    return historicalData;
  } finally {
    await page.close();
  }
}

/**
 * Perform comprehensive technical analysis
 */
export function performTechnicalAnalysis(data, options = {}) {
  if (!data || data.length < 10) {
    return {
      error: 'DATA TIDAK CUKUP ❌',
      message: 'Minimal 10 hari data diperlukan untuk analisis'
    };
  }

  const analysis = {
    data,
    dataPoints: data.length,
    dateRange: {
      from: data[data.length - 1]?.date,
      to: data[0]?.date
    },
    currentPrice: data[0]?.close,
    indicators: {},
    fibonacci: null,
    supportResistance: null,
    signals: [],
    overallSignal: null
  };

  // Calculate all indicators
  analysis.indicators.movingAverages = calculateMovingAverages(data);
  analysis.signals.push(...analysis.indicators.movingAverages.signals);

  analysis.indicators.RSI = calculateRSI(data);
  analysis.signals.push(analysis.indicators.RSI.signal);

  analysis.indicators.MACD = calculateMACD(data);
  analysis.signals.push(analysis.indicators.MACD.signalResult);

  analysis.fibonacci = calculateFibonacci(data);
  analysis.supportResistance = calculateSupportResistance(data);
  analysis.tradingRecommendation = calculateTradingRecommendations(data, analysis.supportResistance);
  analysis.indicators.volume = analyzeVolume(data);
  analysis.priceChange = calculatePriceChange(data);

  analysis.overallSignal = calculateOverallSignal(analysis.signals);

  return analysis;
}

/**
 * Calculate Moving Averages
 */
function calculateMovingAverages(data) {
  // data sudah sorted newest first, jadi ambil dari awal
  const closes = data.map(d => d.close);
  const result = { MA5: null, MA10: null, MA20: null, MA50: null, signals: [] };

  // MA calculations - use last N closes (which are oldest data)
  if (closes.length >= 5) result.MA5 = calculateMAFromEnd(closes, 5);
  if (closes.length >= 10) result.MA10 = calculateMAFromEnd(closes, 10);
  if (closes.length >= 20) result.MA20 = calculateMAFromEnd(closes, 20);
  if (closes.length >= 50) result.MA50 = calculateMAFromEnd(closes, 50);

  const currentPrice = closes[0]; // data[0] = terbaru (newest first)

  if (result.MA20 !== null) {
    result.signals.push({
      indicator: 'MA20',
      signal: currentPrice > result.MA20 ? 'BULLISH' : 'BEARISH',
      weight: 1,
      message: `Harga ${currentPrice > result.MA20 ? 'di atas' : 'di bawah'} MA20 (${result.MA20.toFixed(0)})`
    });
  }

  if (result.MA10 !== null && result.MA20 !== null) {
    result.signals.push({
      indicator: 'MA Crossover',
      signal: result.MA10 > result.MA20 ? 'BULLISH' : 'BEARISH',
      weight: 1.5,
      message: `MA10 ${result.MA10 > result.MA20 ? 'di atas' : 'di bawah'} MA20`
    });
  }

  return result;
}

function calculateMA(data, period) {
  const slice = data.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

function calculateMAFromEnd(data, period) {
  // Ambil period data dari akhir array (data terlama)
  const slice = data.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

/**
 * Calculate RSI
 */
function calculateRSI(data, period = 14) {
  const actualPeriod = Math.min(period, data.length - 1);
  if (actualPeriod < 2) {
    return { value: null, signal: { indicator: 'RSI', signal: 'NEUTRAL', weight: 0, message: 'Data tidak cukup' } };
  }

  const closes = data.map(d => d.close).reverse();
  let gains = 0, losses = 0;

  for (let i = 1; i <= actualPeriod; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  let avgGain = gains / actualPeriod;
  let avgLoss = losses / actualPeriod;

  for (let i = actualPeriod + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    avgGain = ((avgGain * (actualPeriod - 1)) + (change > 0 ? change : 0)) / actualPeriod;
    avgLoss = ((avgLoss * (actualPeriod - 1)) + (change < 0 ? Math.abs(change) : 0)) / actualPeriod;
  }

  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));

  let signal, message;
  if (rsi > 70) { signal = 'BEARISH'; message = `RSI ${rsi.toFixed(2)} (Overbought)`; }
  else if (rsi < 30) { signal = 'BULLISH'; message = `RSI ${rsi.toFixed(2)} (Oversold)`; }
  else { signal = 'NEUTRAL'; message = `RSI ${rsi.toFixed(2)} (Normal)`; }

  return { value: rsi, signal: { indicator: 'RSI', signal, weight: 1.5, message } };
}

/**
 * Calculate MACD
 */
function calculateMACD(data, fast = 12, slow = 26, signalPeriod = 9) {
  if (data.length < 10) {
    fast = Math.max(3, Math.floor(data.length / 3));
    slow = Math.max(5, Math.floor(data.length / 2));
    signalPeriod = Math.max(2, Math.floor(slow / 3));
  }

  if (data.length < slow + signalPeriod) {
    return { macd: null, signal: null, histogram: null, signalResult: { indicator: 'MACD', signal: 'NEUTRAL', weight: 0, message: 'Data tidak cukup' } };
  }

  const closes = data.map(d => d.close).reverse();
  const emaFast = calculateEMA(closes, fast);
  const emaSlow = calculateEMA(closes, slow);
  const macdLine = emaFast - emaSlow;

  const macdValues = [];
  for (let i = slow; i < closes.length; i++) {
    const f = calculateEMA(closes.slice(0, i + 1), fast);
    const s = calculateEMA(closes.slice(0, i + 1), slow);
    macdValues.push(f - s);
  }

  const signalLine = macdValues.length >= signalPeriod ? calculateEMA(macdValues, signalPeriod) : macdValues[macdValues.length - 1];
  const histogram = macdLine - signalLine;
  const currentPrice = closes[closes.length - 1];

  const signalResult = histogram > 0 ? 'BULLISH' : 'BEARISH';
  const message = `MACD ${histogram > 0 ? 'positif' : 'negatif'} (${macdLine.toFixed(2)}, Signal: ${signalLine.toFixed(2)})`;

  // Hitung potensi pergerakan berdasarkan histogram
  // Histogram menunjukkan momentum - semakin besar semakin kuat
  const histogramPercent = (Math.abs(histogram) / currentPrice * 100).toFixed(2);
  const prediction = histogram > 0 
    ? `BULLISH - Potensi naik ~${histogramPercent}% (momentum positif)`
    : `BEARISH - Potensi turun ~${histogramPercent}% (momentum negatif)`;

  return {
    macd: macdLine, signal: signalLine, histogram,
    histogramPercent,
    prediction,
    signalResult: { indicator: 'MACD', signal: signalResult, weight: 1.5, message }
  };
}

function calculateEMA(data, period) {
  if (data.length < period) return data[data.length - 1];
  const multiplier = 2 / (period + 1);
  let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < data.length; i++) {
    ema = (data[i] - ema) * multiplier + ema;
  }
  return ema;
}

/**
 * Calculate Fibonacci
 */
function calculateFibonacci(data) {
  const closes = data.map(d => d.close);
  const high = Math.max(...closes);
  const low = Math.min(...closes);
  const range = high - low;

  const levels = {
    '0%': high, '23.6%': high - (range * 0.236),
    '38.2%': high - (range * 0.382), '50%': high - (range * 0.5),
    '61.8%': high - (range * 0.618), '100%': low
  };

  const currentPrice = closes[0]; // data[0] = terbaru (newest first)
  let nearestLevel = null, minDistance = Infinity;

  for (const [level, price] of Object.entries(levels)) {
    const distance = Math.abs(currentPrice - price);
    if (distance < minDistance) {
      minDistance = distance;
      nearestLevel = { level, price, distance };
    }
  }

  // Tentukan arti dari posisi harga sekarang
  let marketCondition, explanation, recommendation;
  if (currentPrice >= high * 0.98) {
    marketCondition = '🔴 ATAS (Overbought)';
    explanation = 'Harga di pucuk - area jenuh beli, potensi turun/reversal';
    recommendation = '⚠️ Hati-hati, jangan entry sekarang. Tunggu pullback.';
  } else if (currentPrice <= low * 1.02) {
    marketCondition = '🟢 BAWAH (Oversold)';
    explanation = 'Harga di dasar - area jenuh jual, potensi naik/rebound';
    recommendation = '✅ Area bagus untuk entry jika ada konfirmasi reversal';
  } else if (currentPrice >= levels['23.6%']) {
    marketCondition = '🟡 AREA ATAS';
    explanation = 'Harga masih di atas - momentum kuat, tapi mendekati resistensi';
    recommendation = '⚠️ Tunggu pullback ke level Fibonacci tengah';
  } else if (currentPrice >= levels['38.2%']) {
    marketCondition = '🟢 UPER MID';
    explanation = 'Harga di area tengah atas - trend masih kuat';
    recommendation = '✅ Bisa hold, TP di level atas Fibonacci';
  } else if (currentPrice >= levels['50%']) {
    marketCondition = '⚪ NEUTRAL (50% Level)';
    explanation = 'Harga di tengah - market ragu-ragu antara bullish dan bearish';
    recommendation = '⏸️ Tunggu breakout/breakdown dari level 50%';
  } else if (currentPrice >= levels['61.8%']) {
    marketCondition = '🟠 LOWER MID';
    explanation = 'Harga di area tengah bawah - mulai lemah tapi masih ada harapan';
    recommendation = '⚠️ Perhatikan support di 61.8%, bisa jadi bouncing point';
  } else {
    marketCondition = '🔴 AREA BAWAH';
    explanation = 'Harga di bawah golden ratio - trend bearish kuat';
    recommendation = '❌ Jangan entry, tunggu konfirmasi reversal dulu';
  }

  return { 
    high, low, range, levels, currentPrice, nearestLevel,
    marketCondition, explanation, recommendation
  };
}

/**
 * Calculate Support & Resistance
 */
function calculateSupportResistance(data) {
  const highs = data.map(d => d.high);
  const lows = data.map(d => d.low);
  const currentPrice = data[0].close; // data[0] = terbaru (newest first)

  const recentLows = lows.slice(0, Math.min(20, lows.length));
  const recentHighs = highs.slice(0, Math.min(20, highs.length));

  const support = Math.min(...recentLows);
  const resistance = Math.max(...recentHighs);

  let position;
  if (currentPrice >= resistance * 0.98) position = 'Di dekat RESISTANCE';
  else if (currentPrice <= support * 1.02) position = 'Di dekat SUPPORT';
  else position = currentPrice > (support + resistance) / 2 ? 'Di tengah (atas)' : 'Di tengah (bawah)';

  return {
    support, resistance, currentPrice, position,
    distanceToSupport: ((currentPrice - support) / currentPrice * 100).toFixed(2),
    distanceToResistance: ((resistance - currentPrice) / currentPrice * 100).toFixed(2)
  };
}

/**
 * Analyze Volume
 */
function analyzeVolume(data) {
  const volumes = data.map(d => d.volume).filter(v => v > 0);
  if (volumes.length === 0) return { average: 0, current: 0, ratio: '0', trend: 'Tidak ada data' };

  const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
  const currentVolume = volumes[0]; // data[0] = terbaru (newest first)
  const ratio = avgVolume > 0 ? currentVolume / avgVolume : 0;

  let trend;
  if (ratio > 1.5) trend = 'TINGGI';
  else if (ratio < 0.5) trend = 'RENDAH';
  else trend = 'NORMAL';

  return { average: avgVolume, current: currentVolume, ratio: ratio.toFixed(2), trend };
}

/**
 * Calculate Trading Recommendations (Buy, Take Profit, Stop Loss)
 */
function calculateTradingRecommendations(data, supportResistance) {
  const currentPrice = data[0].close; // data[0] = terbaru (newest first)
  const { support, resistance } = supportResistance;

  // Buy Zone: near support (within 2%)
  const buyPrice = support;
  const buyZoneUpper = support * 1.02;

  // Take Profit targets (multiple levels) - dihitung dari HARGA BELI IDEAL (support)
  const tp1 = resistance; // First target
  const tp2 = resistance * 1.03; // Extended target (+3%)
  const tp3 = resistance * 1.05; // Aggressive target (+5%)

  // Stop Loss (below support)
  const stopLoss = support * 0.97; // 3% below support

  // Risk/Reward ratio - dihitung dari harga beli ideal (support)
  const risk = buyPrice - stopLoss;
  const reward1 = tp1 - buyPrice;
  const riskRewardRatio1 = risk > 0 ? (reward1 / risk).toFixed(2) : 'N/A';

  // Potential profit/loss percentage - dihitung dari ZONA BELI (support), BUKAN harga sekarang
  const potentialProfit1 = ((tp1 - buyPrice) / buyPrice * 100).toFixed(2);
  const potentialProfit2 = ((tp2 - buyPrice) / buyPrice * 100).toFixed(2);
  const potentialProfit3 = ((tp3 - buyPrice) / buyPrice * 100).toFixed(2);
  const potentialLoss = ((stopLoss - buyPrice) / buyPrice * 100).toFixed(2);

  // Apakah harga sekarang di zona beli?
  const isInBuyZone = currentPrice <= buyZoneUpper;
  const pricePosition = isInBuyZone 
    ? '✅ Harga di ZONA BELI - Bagus untuk entry'
    : `⏸️ Harga ${((currentPrice - buyZoneUpper) / buyZoneUpper * 100).toFixed(1)}% di atas zona beli - Tunggu pullback`;

  return {
    buyZone: {
      lower: buyPrice,
      upper: buyZoneUpper,
      recommendation: isInBuyZone 
        ? '✅ Harga di zona BELI - Bagus untuk entry' 
        : '⏸️ Tunggu harga turun ke zona support'
    },
    takeProfit: {
      tp1: { 
        price: tp1, 
        profit: `${potentialProfit1}%`, 
        label: 'Konservatif',
        note: `Kalau beli di support (${buyPrice.toFixed(0)})`
      },
      tp2: { 
        price: tp2, 
        profit: `${potentialProfit2}%`, 
        label: 'Moderat',
        note: `Kalau beli di support (${buyPrice.toFixed(0)})`
      },
      tp3: { 
        price: tp3, 
        profit: `${potentialProfit3}%`, 
        label: 'Agresif',
        note: `Kalau beli di support (${buyPrice.toFixed(0)})`
      }
    },
    stopLoss: {
      price: stopLoss,
      risk: `${potentialLoss}%`,
      recommendation: 'JUAL jika harga turun di bawah level ini'
    },
    riskReward: {
      ratio: riskRewardRatio1,
      interpretation: riskRewardRatio1 !== 'N/A' && parseFloat(riskRewardRatio1) > 2 ? '✅ Risiko/Reward BAGUS' : '⚠️ Risiko/Reward KURANG BAIK'
    },
    currentPrice,
    pricePosition,
    isInBuyZone,
    // Info tambahan: kalau beli di harga sekarang (bukan di support)
    ifBuyNow: currentPrice > buyZoneUpper ? {
      tp1Profit: ((tp1 - currentPrice) / currentPrice * 100).toFixed(2),
      stopLossRisk: ((stopLoss - currentPrice) / currentPrice * 100).toFixed(2),
      warning: '⚠️ Lebih baik tunggu pullback ke zona beli untuk profit maksimal'
    } : null
  };
}

/**
 * Calculate Price Change
 */
function calculatePriceChange(data) {
  if (data.length < 2) return null;

  const current = data[0].close; // data[0] = terbaru
  const previous = data[data.length - 1].close; // data terakhir = terlama
  
  // Timestamp dalam SECONDS (bukan milliseconds)
  const nowTs = data[0].timestamp;
  const oneDayAgoTs = nowTs - (24 * 60 * 60); // 24 jam yang lalu dalam detik
  
  // Cari data terakhir dari hari sebelumnya (closing price kemarin)
  // Data sorted newest first, jadi cari yang pertama <= oneDayAgoTs
  const yesterdayData = data.find(d => d.timestamp <= oneDayAgoTs);
  const yesterdayClose = yesterdayData ? yesterdayData.close : (data.length > 1 ? data[data.length - 1].close : current);

  // Total hari dalam data - hitung dari selisih timestamp
  const totalSeconds = data[0].timestamp - data[data.length - 1].timestamp;
  const totalDays = Math.max(1, Math.round(totalSeconds / (24 * 60 * 60)));

  return {
    period: { 
      change: (current - previous).toFixed(2), 
      changePercent: ((current - previous) / previous * 100).toFixed(2), 
      days: totalDays
    },
    daily: { 
      change: (current - yesterdayClose).toFixed(2), 
      changePercent: ((current - yesterdayClose) / yesterdayClose * 100).toFixed(2) 
    }
  };
}

/**
 * Calculate Overall Signal
 */
function calculateOverallSignal(signals) {
  const validSignals = signals.filter(s => s && s.weight > 0);
  if (validSignals.length === 0) {
    return { signal: '🟡 NETRAL', confidence: 0, bullishCount: 0, bearishCount: 0, neutralCount: 0, details: 'Tidak ada sinyal' };
  }

  let bullishScore = 0, bearishScore = 0, bullishCount = 0, bearishCount = 0, neutralCount = 0;

  validSignals.forEach(s => {
    if (s.signal === 'BULLISH') { bullishScore += s.weight; bullishCount++; }
    else if (s.signal === 'BEARISH') { bearishScore += s.weight; bearishCount++; }
    else { neutralCount++; }
  });

  const totalScore = bullishScore + bearishScore;
  const confidence = totalScore > 0 ? (Math.abs(bullishScore - bearishScore) / totalScore * 100).toFixed(1) : 0;

  let signal;
  if (bullishScore > bearishScore * 1.3) signal = '🟢 BULLISH';
  else if (bearishScore > bullishScore * 1.3) signal = '🔴 BEARISH';
  else signal = '🟡 NETRAL';

  return {
    signal, confidence, bullishCount, bearishCount, neutralCount,
    details: `Bullish: ${bullishCount} | Bearish: ${bearishCount} | Netral: ${neutralCount}`
  };
}
