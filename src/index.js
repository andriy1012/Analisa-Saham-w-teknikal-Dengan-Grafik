import puppeteer from 'puppeteer';
import readline from 'readline';
import { fetchHistoricalData, performTechnicalAnalysis } from './scraper/technical.js';
import {
  drawPriceChart, drawBarChart, drawVolumeChart,
  drawRSIGauge, drawMACDChart, drawFibonacciChart,
  drawMAChart
} from './chart.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '\n🔍 > '
});

const ASCII_TITLE = `
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     💹  ANALISIS SAHAM dengan DIAGRAM VISUAL  💹         ║
║                                                           ║
║     Ketik perintah atau 'help' untuk bantuan              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`;

console.log(ASCII_TITLE);

let browser = null;

async function initBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }
}

async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

function printDivider(char = '═', length = 70) {
  console.log(char.repeat(length));
}

function printHeader(text) {
  console.log('\n' + '─'.repeat(70));
  console.log(`  ${text}`);
  console.log('─'.repeat(70));
}

function formatNumber(num) {
  if (!num && num !== 0) return '-';
  if (typeof num === 'string') return num;
  return new Intl.NumberFormat('id-ID').format(num);
}

async function technicalAnalysis(ticker, days = 30) {
  try {
    await initBrowser();
    const tickerUpper = ticker.toUpperCase();
    
    printHeader(`📊 ANALISIS TEKNIKAL: ${tickerUpper}`);
    console.log(`⏳ Mengambil data ${days} hari terakhir...\n`);

    const data = await fetchHistoricalData(browser, tickerUpper, days);
    
    if (!data || data.length < 10) {
      console.log('\n❌ Data historis tidak cukup (minimal 10 hari)');
      console.log('💡 Coba saham yang lebih likuid: BBRI, TLKM, ADRO, BBCA');
      return;
    }

    const analysis = performTechnicalAnalysis(data);

    // Display with VISUAL DIAGRAMS
    console.log('\n');
    printDivider('═');
    console.log(`  📈 HARGA SAHAM: ${tickerUpper}`);
    printDivider('═');
    console.log(drawPriceChart(data, 65, 12));

    console.log('\n');
    printDivider('═');
    console.log('  📊 MOVING AVERAGES');
    printDivider('═');
    if (analysis.indicators.movingAverages) {
      console.log(drawMAChart(analysis.indicators.movingAverages, analysis.currentPrice));
    }

    if (analysis.priceChange) {
      const { period, daily } = analysis.priceChange;
      console.log(`\n  📉 Perubahan ${period.days} hari: ${period.change} (${period.changePercent}%)`);
      console.log(`  📊 Perubahan 24 Jam: ${daily.change} (${daily.changePercent}%)`);
    }

    // RSI GAUGE
    if (analysis.indicators.RSI?.value !== null) {
      console.log('\n');
      printDivider('═');
      console.log(drawRSIGauge(analysis.indicators.RSI.value));
    }

    // MACD
    if (analysis.indicators.MACD?.macd !== null) {
      console.log('\n');
      printDivider('═');
      console.log(drawMACDChart(
        analysis.indicators.MACD.macd,
        analysis.indicators.MACD.signal,
        analysis.indicators.MACD.histogram
      ));
      // Tampilkan prediksi dari histogram
      if (analysis.indicators.MACD.prediction) {
        console.log(`  📊 ${analysis.indicators.MACD.prediction}`);
      }
    }

    // FIBONACCI
    if (analysis.fibonacci) {
      console.log('\n');
      printDivider('═');
      console.log(drawFibonacciChart(analysis.fibonacci));
      // Tampilkan keterangan/arti level Fibonacci
      if (analysis.fibonacci.explanation) {
        console.log('\n  📖 KETERANGAN:');
        console.log(`  Kondisi: ${analysis.fibonacci.marketCondition}`);
        console.log(`  ${analysis.fibonacci.explanation}`);
        console.log(`  ${analysis.fibonacci.recommendation}`);
      }
    }

    // VOLUME
    console.log('\n');
    printDivider('═');
    console.log(drawVolumeChart(data, 65, 8));

    // SUPPORT & RESISTANCE
    if (analysis.supportResistance) {
      console.log('\n');
      printDivider('═');
      console.log('  🎯 SUPPORT & RESISTANCE');
      printDivider('─');
      console.log(`  Support           : ${formatNumber(analysis.supportResistance.support.toFixed(2))}`);
      console.log(`  Resistance        : ${formatNumber(analysis.supportResistance.resistance.toFixed(2))}`);
      console.log(`  Posisi Harga      : ${analysis.supportResistance.position}`);
      console.log(`  Jarak ke Support  : ${analysis.supportResistance.distanceToSupport}%`);
      console.log(`  Jarak ke Resist   : ${analysis.supportResistance.distanceToResistance}%`);
    }

    // OVERALL SIGNAL
    console.log('\n');
    printDivider('═');
    console.log('  🎯 SINYAL KESELURUHAN');
    printDivider('═');
    console.log(`  ${analysis.overallSignal.signal}`);
    console.log(`  Confidence: ${analysis.overallSignal.confidence}%`);
    console.log(`  ${analysis.overallSignal.details}`);

    // Signal breakdown
    console.log('\n  Detail Sinyal:');
    printDivider('─');
    analysis.signals.forEach((sig, i) => {
      const emoji = sig.signal === 'BULLISH' ? '🟢' : sig.signal === 'BEARISH' ? '🔴' : '🟡';
      console.log(`    ${i + 1}. ${emoji} ${sig.indicator.padEnd(15)} ${sig.message}`);
    });

    // RECOMMENDATION
    console.log('\n');
    printDivider('═');
    console.log('  💡 REKOMENDASI TRADING');
    printDivider('═');

    if (analysis.overallSignal.confidence > 60) {
      if (analysis.overallSignal.signal.includes('BULLISH')) {
        console.log('  ✅ Sinyal BULLISH kuat - Potensi naik');
        console.log('  💡 Pertimbangkan untuk BUY');
      } else if (analysis.overallSignal.signal.includes('BEARISH')) {
        console.log('  ❌ Sinyal BEARISH kuat - Potensi turun');
        console.log('  💡 Pertimbangkan untuk SELL/WATCH');
      } else {
        console.log('  ⏸️  Sinyal NETRAL - Tunggu konfirmasi');
        console.log('  💡 HOLD jika sudah punya, tunggu breakout/breakdown');
      }
    } else {
      console.log('  ⏸️  Sinyal LEMAH - Tidak ada arah jelas');
      console.log('  💡 WAIT AND SEE');
    }

    // TRADING RECOMMENDATION (Buy Zone, Take Profit, Stop Loss)
    if (analysis.tradingRecommendation) {
      const rec = analysis.tradingRecommendation;
      console.log('\n');
      printDivider('═');
      console.log('  🎯 KESIMPULAN & REKOMENDASI HARGA');
      printDivider('═');

      console.log(`\n  💲 HARGA SEKARANG: ${formatNumber(rec.currentPrice.toFixed(2))}`);
      console.log(`  📊 Posisi: ${rec.pricePosition}`);
      console.log('─'.repeat(70));

      console.log('\n  📍 ZONA BELI (Buy Zone):');
      console.log(`     Support          : ${formatNumber(rec.buyZone.lower.toFixed(2))}`);
      console.log(`     Batas Atas       : ${formatNumber(rec.buyZone.upper.toFixed(2))}`);
      console.log(`     ${rec.buyZone.recommendation}`);

      console.log('\n  💰 TARGET TAKE PROFIT (jika beli di zona support):');
      console.log(`     TP1 (Konservatif): ${formatNumber(rec.takeProfit.tp1.price.toFixed(2))} → Potensi: ${rec.takeProfit.tp1.profit}`);
      console.log(`                          ${rec.takeProfit.tp1.note}`);
      console.log(`     TP2 (Moderat)    : ${formatNumber(rec.takeProfit.tp2.price.toFixed(2))} → Potensi: ${rec.takeProfit.tp2.profit}`);
      console.log(`                          ${rec.takeProfit.tp2.note}`);
      console.log(`     TP3 (Agresif)    : ${formatNumber(rec.takeProfit.tp3.price.toFixed(2))} → Potensi: ${rec.takeProfit.tp3.profit}`);
      console.log(`                          ${rec.takeProfit.tp3.note}`);

      console.log('\n  🛡️  STOP LOSS:');
      console.log(`     Harga Stop Loss  : ${formatNumber(rec.stopLoss.price.toFixed(2))}`);
      console.log(`     Risiko           : ${rec.stopLoss.risk} (dari zona beli)`);
      console.log(`     ${rec.stopLoss.recommendation}`);

      console.log('\n  ⚖️  RISK/REWARD RATIO:');
      console.log(`     Ratio            : 1:${rec.riskReward.ratio}`);
      console.log(`     ${rec.riskReward.interpretation}`);

      // Info kalau harga tidak di zona beli
      if (rec.ifBuyNow) {
        console.log('\n  ⚠️  INFO (jika nekat beli di harga sekarang):');
        console.log(`     Potensi ke TP1   : ${rec.ifBuyNow.tp1Profit}%`);
        console.log(`     Risiko Stop Loss : ${rec.ifBuyNow.stopLossRisk}%`);
        console.log(`     ${rec.ifBuyNow.warning}`);
      }

      console.log('\n  📊 STRATEGI TRADING:');
      printDivider('─');
      if (rec.isInBuyZone) {
        console.log('  ✅ Harga saat ini di ZONA BELI - Bagus untuk entry');
        console.log(`  🎯 Entry sekarang di: ${formatNumber(rec.currentPrice.toFixed(2))}`);
        console.log(`  🎯 Target TP1: ${formatNumber(rec.takeProfit.tp1.price.toFixed(2))} (${rec.takeProfit.tp1.profit})`);
        console.log(`  🛡️  Stop Loss di: ${formatNumber(rec.stopLoss.price.toFixed(2))} (${rec.stopLoss.risk})`);
      } else {
        console.log('  ⏸️  Harga saat ini di atas zona beli - Tunggu pullback');
        console.log(`  💡 Tunggu harga turun ke: ${formatNumber(rec.buyZone.upper.toFixed(2))}`);
        console.log(`  💡 Atau breakout di atas resistance: ${formatNumber(analysis.supportResistance.resistance.toFixed(2))}`);
        console.log(`  💰 Kalau berhasil buy di support (${formatNumber(rec.buyZone.lower.toFixed(2))}):`);
        console.log(`     → Potensi profit ke TP1: ${rec.takeProfit.tp1.profit}`);
        console.log(`     → Risiko stop loss: ${rec.stopLoss.risk}`);
      }
    }

    console.log('\n✅ Analisis selesai!');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    console.error(err.stack);
  }
}

function printHelp() {
  printHeader('📖 BANTUAN');
  console.log(`
  Perintah yang tersedia:

  1. <KODE> [hari]           - Langsung ketik kode saham!
     Contoh: BBRI
             ADRO 30
             TLKM 60

  2. help                    - Tampilkan bantuan ini

  3. clear                   - Bersihkan layar

  4. exit / quit             - Keluar

  Fitur Diagram:
  ✓ Price Chart (Line chart dengan waktu 5 menit)
  ✓ Moving Averages (Visual comparison)
  ✓ RSI Gauge (Overbought/Oversold indicator)
  ✓ MACD Chart + Prediksi (Potensi naik/turun dari histogram)
  ✓ Fibonacci Levels + Keterangan (Arti setiap level)
  ✓ Volume Chart (Trading volume bars dengan waktu)
  ✓ Signal Dashboard (Overall summary)
  ✓ Trading Recommendation (Buy Zone, Take Profit, Stop Loss)

  Contoh saham: ADRO, TLKM, BBCA, BBRI, BMRI, GOTO
  `);
}

function printWelcome() {
  console.log('👋 Selamat datang! Langsung ketik kode saham aja.\n');
  console.log('💡 Contoh: BBRI 30 atau ADRO\n');
}

async function handleCommand(input) {
  const trimmed = input.trim();
  if (!trimmed) return;

  const trimmedLower = trimmed.toLowerCase();

  if (trimmedLower === 'exit' || trimmedLower === 'quit' || trimmedLower === 'keluar') {
    console.log('\n👋 Terima kasih! Sampai jumpa!\n');
    await closeBrowser();
    process.exit(0);
  }

  if (trimmedLower === 'help' || trimmedLower === 'bantuan') {
    printHelp();
    return;
  }

  if (trimmedLower === 'clear' || trimmedLower === 'cls') {
    console.clear();
    console.log(ASCII_TITLE);
    printWelcome();
    return;
  }

  // FIX: Auto-detect stock ticker pattern
  // Match: "BBRI", "BBRI 30", "ADRO 10", etc.
  const tickerMatch = trimmed.match(/^([A-Za-z0-9]{2,10})\s*(\d+)?$/);
  if (tickerMatch) {
    const ticker = tickerMatch[1];
    const days = parseInt(tickerMatch[2]) || 30;
    if (days < 10 || days > 365) {
      console.log('\n❌ Jumlah hari harus 10-365. Contoh: BBRI 30');
      return;
    }
    await technicalAnalysis(ticker, days);
    return;
  }

  // Also support 'teknikal' prefix for backwards compatibility
  if (trimmedLower.startsWith('teknikal') || trimmedLower.startsWith('technical')) {
    const parts = trimmedLower.split(' ');
    const ticker = parts[1];
    const days = parseInt(parts[2]) || 30;
    if (!ticker) {
      console.log('\n❌ Masukkan kode saham. Contoh: BBRI 30');
      return;
    }
    if (days < 10 || days > 365) {
      console.log('\n❌ Jumlah hari harus 10-365. Contoh: BBRI 30');
      return;
    }
    await technicalAnalysis(ticker, days);
    return;
  }

  console.log('\n❌ Perintah tidak dikenali. Ketik "help" untuk bantuan.\n');
}

// Main loop
printWelcome();

rl.prompt();

rl.on('line', async (line) => {
  try {
    await handleCommand(line);
  } catch (err) {
    console.error('\n❌ Terjadi error:', err.message);
  }
  rl.prompt();
}).on('close', async () => {
  console.log('\n👋 Sampai jumpa!\n');
  await closeBrowser();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n\n👋 Sampai jumpa!\n');
  await closeBrowser();
  process.exit(0);
});
