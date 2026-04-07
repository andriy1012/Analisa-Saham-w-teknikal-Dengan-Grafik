import { createPage } from '../utils/browser.js';

/**
 * Convert ticker to Yahoo Finance format
 */
function toYahooTicker(ticker) {
  if (ticker.includes('.')) return ticker;
  return `${ticker}.JK`;
}

/**
 * Fetch historical stock data
 */
export async function fetchHistoricalData(browser, ticker, days = 30) {
  const page = await createPage(browser);
  const historicalData = [];
  const yahooTicker = toYahooTicker(ticker);

  try {
    console.log(`📅 Fetching ${days} days historical data for ${ticker}...`);
    
    await page.goto(`https://finance.yahoo.com/quote/${yahooTicker}/history/`, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });
    await new Promise(resolve => setTimeout(resolve, 4000));

    const data = await page.evaluate((minDays) => {
      const rows = document.querySelectorAll('table tbody tr');
      const data = [];
      
      rows.forEach(row => {
        if (data.length >= minDays) return;
        const cells = row.querySelectorAll('td');
        if (cells.length >= 7) {
          const date = cells[0]?.textContent.trim();
          const open = parseFloat(cells[1]?.textContent.replace(/,/g, ''));
          const high = parseFloat(cells[2]?.textContent.replace(/,/g, ''));
          const low = parseFloat(cells[3]?.textContent.replace(/,/g, ''));
          const close = parseFloat(cells[4]?.textContent.replace(/,/g, ''));
          const adjClose = parseFloat(cells[5]?.textContent.replace(/,/g, ''));
          const volumeStr = cells[6]?.textContent.trim().replace(/,/g, '');
          const volume = parseInt(volumeStr);

          if (!isNaN(close) && close > 0) {
            data.push({
              date,
              open: isNaN(open) ? close : open,
              high: isNaN(high) ? close : high,
              low: isNaN(low) ? close : low,
              close,
              adjClose: isNaN(adjClose) ? close : adjClose,
              volume: isNaN(volume) ? 0 : volume
            });
          }
        }
      });
      
      return data;
    }, days + 5);

    historicalData.push(...data);

    if (historicalData.length > 0) {
      console.log(`✅ Got ${historicalData.length} days of data`);
    } else {
      console.warn('❌ Tidak ada data historis ditemukan');
    }

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
  analysis.indicators.volume = analyzeVolume(data);
  analysis.priceChange = calculatePriceChange(data);

  analysis.overallSignal = calculateOverallSignal(analysis.signals);

  return analysis;
}

/**
 * Calculate Moving Averages
 */
function calculateMovingAverages(data) {
  const closes = data.map(d => d.close).reverse();
  const result = { MA5: null, MA10: null, MA20: null, MA50: null, signals: [] };

  if (closes.length >= 5) result.MA5 = calculateMA(closes, 5);
  if (closes.length >= 10) result.MA10 = calculateMA(closes, 10);
  if (closes.length >= 20) result.MA20 = calculateMA(closes, 20);
  if (closes.length >= 50) result.MA50 = calculateMA(closes, 50);

  const currentPrice = closes[closes.length - 1];

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

  const signalResult = histogram > 0 ? 'BULLISH' : 'BEARISH';
  const message = `MACD ${histogram > 0 ? 'positif' : 'negatif'} (${macdLine.toFixed(2)}, Signal: ${signalLine.toFixed(2)})`;

  return {
    macd: macdLine, signal: signalLine, histogram,
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

  const currentPrice = closes[closes.length - 1];
  let nearestLevel = null, minDistance = Infinity;
  
  for (const [level, price] of Object.entries(levels)) {
    const distance = Math.abs(currentPrice - price);
    if (distance < minDistance) {
      minDistance = distance;
      nearestLevel = { level, price, distance };
    }
  }

  return { high, low, range, levels, currentPrice, nearestLevel };
}

/**
 * Calculate Support & Resistance
 */
function calculateSupportResistance(data) {
  const highs = data.map(d => d.high);
  const lows = data.map(d => d.low);
  const currentPrice = data[data.length - 1].close;

  const recentLows = lows.slice(-Math.min(10, lows.length));
  const recentHighs = highs.slice(-Math.min(10, highs.length));

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
  const currentVolume = volumes[volumes.length - 1];
  const ratio = avgVolume > 0 ? currentVolume / avgVolume : 0;

  let trend;
  if (ratio > 1.5) trend = 'TINGGI';
  else if (ratio < 0.5) trend = 'RENDAH';
  else trend = 'NORMAL';

  return { average: avgVolume, current: currentVolume, ratio: ratio.toFixed(2), trend };
}

/**
 * Calculate Price Change
 */
function calculatePriceChange(data) {
  if (data.length < 2) return null;

  const current = data[0].close;
  const previous = data[data.length - 1].close;
  const yesterday = data[1].close;

  return {
    period: { change: (current - previous).toFixed(2), changePercent: ((current - previous) / previous * 100).toFixed(2), days: data.length },
    daily: { change: (current - yesterday).toFixed(2), changePercent: ((current - yesterday) / yesterday * 100).toFixed(2) }
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
