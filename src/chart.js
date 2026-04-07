/**
 * ASCII/Unicode Chart Renderer - Fixed & Optimized
 * Creates visual diagrams in terminal
 */

/**
 * Draw a line chart with price history
 */
export function drawPriceChart(data, width = 60, height = 15) {
  try {
    if (!data || data.length < 2) {
      return '❌ Data tidak cukup untuk chart';
    }

    const closes = data.map(d => d.close).reverse();
    const min = Math.min(...closes);
    const max = Math.max(...closes);
    const range = max - min || 1;

    // Create grid
    const grid = Array(height).fill(null).map(() => Array(width).fill(' '));

    // Plot points
    const step = Math.max(1, Math.floor(closes.length / width));
    const points = [];
    
    for (let i = 0; i < closes.length; i += step) {
      if (points.length >= width) break;
      const x = Math.floor((i / closes.length) * (width - 1));
      const y = Math.min(height - 1, Math.max(0, Math.floor((1 - (closes[i] - min) / range) * (height - 1))));
      points.push({ x, y, value: closes[i] });
      
      if (x >= 0 && x < width && y >= 0 && y < height) {
        grid[y][x] = '●';
      }
    }

    // Connect points with lines (FIX: prevent infinite loop)
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      
      // Skip if same position
      if (p1.x === p2.x && p1.y === p2.y) continue;
      
      const dx = p2.x > p1.x ? 1 : p2.x < p1.x ? -1 : 0;
      const dy = p2.y > p1.y ? 1 : p2.y < p1.y ? -1 : 0;
      let x = p1.x, y = p1.y;
      
      let safety = 0;
      while ((x !== p2.x || y !== p2.y) && safety < 200) {
        if (x >= 0 && x < width && y >= 0 && y < height && grid[y][x] === ' ') {
          grid[y][x] = '─';
        }
        x += dx;
        y += dy;
        safety++;
      }
    }

    // Build output
    const lines = [];
    const priceWidth = 10;
    
    // Y-axis labels and grid
    for (let y = 0; y < height; y++) {
      const priceLabel = (max - (y / Math.max(1, height - 1)) * range).toFixed(0);
      const label = priceLabel.padStart(priceWidth);
      const row = grid[y].join('');
      lines.push(`${label} │${row}`);
    }

    // X-axis
    lines.push(' '.repeat(priceWidth) + ' └' + '─'.repeat(width));
    
    // Date labels
    const dateStr = `${data[data.length - 1]?.date?.substring(0, 5) || ''} → ${data[0]?.date?.substring(0, 5) || ''}`;
    lines.push(' '.repeat(priceWidth) + '  ' + dateStr);

    // Legend
    const currentPrice = closes[closes.length - 1];
    const change = currentPrice - closes[0];
    const changePercent = (change / closes[0] * 100).toFixed(2);
    const emoji = change >= 0 ? '📈' : '📉';
    const sign = change >= 0 ? '+' : '';
    
    lines.push('');
    lines.push(`${emoji} Current: ${currentPrice.toFixed(0)} | Change: ${sign}${changePercent}%`);
    lines.push(`   High: ${max.toFixed(0)} | Low: ${min.toFixed(0)}`);

    return lines.join('\n');
  } catch (err) {
    return `⚠️  Error rendering chart: ${err.message}`;
  }
}

/**
 * Draw horizontal bar chart
 */
export function drawBarChart(items, options = {}) {
  const {
    maxWidth = 50,
    label = 'Bar',
    showValue = true,
    colorFn = null
  } = options;

  if (!items || items.length === 0) {
    return '❌ Tidak ada data';
  }

  const maxVal = Math.max(...items.map(i => i.value));
  const lines = [];

  items.forEach((item, i) => {
    const barLength = Math.round((item.value / maxVal) * maxWidth);
    const bar = '█'.repeat(barLength);
    const label = (item.label || item.name || `Item ${i + 1}`).padEnd(20);
    const value = showValue ? ` ${item.value.toFixed(2)}` : '';
    
    lines.push(`  ${label} ${bar}${value}`);
  });

  return lines.join('\n');
}

/**
 * Draw volume bars
 */
export function drawVolumeChart(data, width = 60, height = 10) {
  try {
    if (!data || data.length < 2) {
      return '❌ Data tidak cukup';
    }

    const volumes = data.map(d => d.volume).reverse();
    const closes = data.map(d => d.close).reverse();
    const maxVol = Math.max(...volumes.filter(v => v > 0)) || 1;

    // Create grid
    const grid = Array(height).fill(null).map(() => Array(width).fill(' '));

    // Plot volume bars
    const step = Math.max(1, Math.floor(volumes.length / width));
    
    for (let i = 0; i < volumes.length && Math.floor(i / step) < width; i += step) {
      const x = Math.floor((i / volumes.length) * width);
      if (x >= width) break;
      const barHeight = Math.min(height, Math.ceil((volumes[i] / maxVol) * height));
      
      for (let y = height - barHeight; y < height; y++) {
        if (y >= 0 && y < height) {
          // Color by price direction
          if (i > 0 && closes[i] >= closes[i - 1]) {
            grid[y][x] = '▓'; // Up
          } else {
            grid[y][x] = '░'; // Down
          }
        }
      }
    }

    const lines = [];
    lines.push('  📊 VOLUME');
    
    for (let y = 0; y < height; y++) {
      lines.push('    │' + grid[y].join(''));
    }
    
    lines.push('    └' + '─'.repeat(width));
    lines.push(`    Max: ${(maxVol / 1000000).toFixed(2)}M shares`);

    return lines.join('\n');
  } catch (err) {
    return `⚠️  Error rendering volume chart: ${err.message}`;
  }
}

/**
 * Draw RSI gauge
 */
export function drawRSIGauge(rsi) {
  try {
    if (rsi === null || rsi === undefined || isNaN(rsi)) {
      return '  RSI: Tidak ada data';
    }

    const lines = [];
    lines.push('  📊 RSI GAUGE');
    lines.push('  ┌────────────────────────────────────────────┐');
    
    // Create gauge bar
    const barWidth = 40;
    const position = Math.min(barWidth, Math.max(0, Math.floor((rsi / 100) * barWidth)));
    
    let gauge = '  │';
    for (let i = 0; i < barWidth; i++) {
      if (i < 12) gauge += '🟢'; // 0-30: oversold
      else if (i < 28) gauge += '🟡'; // 30-70: normal
      else gauge += '🔴'; // 70-100: overbought
      
      if (i === position) gauge += '◀';
    }
    gauge += '│';
    
    lines.push(gauge);
    lines.push('  │ 0         30        50        70       100  │');
    lines.push('  │  OVER    NORMAL              OVER           │');
    lines.push('  │  SOLD                     BOUGHT           │');
    lines.push('  └────────────────────────────────────────────┘');
    
    let status, emoji;
    if (rsi > 70) {
      status = 'Overbought - Potensi TURUN';
      emoji = '🔴';
    } else if (rsi < 30) {
      status = 'Oversold - Potensi NAIK';
      emoji = '🟢';
    } else {
      status = 'Normal';
      emoji = '🟡';
    }
    
    lines.push(`  ${emoji} RSI: ${rsi.toFixed(2)} - ${status}`);

    return lines.join('\n');
  } catch (err) {
    return `⚠️  Error rendering RSI gauge: ${err.message}`;
  }
}

/**
 * Draw MACD chart
 */
export function drawMACDChart(macd, signal, histogram) {
  try {
    if (macd === null || macd === undefined || isNaN(macd)) {
      return '  MACD: Tidak ada data';
    }

    const lines = [];
    lines.push('  📈 MACD INDICATOR');
    lines.push('  ┌────────────────────────────────────────────┐');
    lines.push(`  │ MACD Line:    ${macd.toFixed(4).padEnd(30)} │`);
    lines.push(`  │ Signal Line:  ${signal.toFixed(4).padEnd(30)} │`);
    lines.push(`  │ Histogram:    ${histogram.toFixed(4).padEnd(30)} │`);
    lines.push('  └────────────────────────────────────────────┘');
    
    // Visual histogram
    const histBars = 30;
    const maxHist = Math.abs(histogram) * 3 || 1;
    const barLength = Math.min(histBars, Math.max(1, Math.abs(histogram) / maxHist * histBars));
    
    if (histogram > 0) {
      const bar = '█'.repeat(Math.ceil(barLength));
      const empty = '░'.repeat(histBars - Math.ceil(barLength));
      lines.push(`  Histogram: ${bar}${empty} ▲ BULLISH`);
    } else {
      const empty = '░'.repeat(histBars - Math.ceil(barLength));
      const bar = '█'.repeat(Math.ceil(barLength));
      lines.push(`  Histogram: ${empty}${bar} ▼ BEARISH`);
    }

    return lines.join('\n');
  } catch (err) {
    return `⚠️  Error rendering MACD: ${err.message}`;
  }
}

/**
 * Draw Fibonacci levels visualization
 */
export function drawFibonacciChart(fibonacci) {
  try {
    if (!fibonacci) {
      return '  Fibonacci: Tidak ada data';
    }

    const lines = [];
    lines.push('  📐 FIBONACCI RETRACEMENT');
    lines.push('  ┌──────────────────────────────────────────────┐');

    const levels = [
      { label: '0% (High)', value: fibonacci.levels['0%'] },
      { label: '23.6%', value: fibonacci.levels['23.6%'] },
      { label: '38.2%', value: fibonacci.levels['38.2%'] },
      { label: '50%', value: fibonacci.levels['50%'] },
      { label: '61.8%', value: fibonacci.levels['61.8%'] },
      { label: '100% (Low)', value: fibonacci.levels['100%'] }
    ];

    const currentPrice = fibonacci.currentPrice;
    const width = 38;

    levels.forEach(level => {
      const priceStr = level.value.toFixed(0).padStart(8);
      const position = Math.min(width - 1, Math.max(0, 
        Math.floor((1 - (level.value - fibonacci.low) / fibonacci.range) * width)
      ));
      
      // Check if current price is near this level
      const isNear = Math.abs(currentPrice - level.value) < fibonacci.range * 0.05;
      const indicator = isNear ? ' ◀══ HARGA DI SINI' : '';
      
      // FIX: Ensure repeat counts are never negative
      const leftDashes = Math.max(0, position);
      const rightDashes = Math.max(0, width - 1 - position);
      
      const line = `  ${level.label.padEnd(15)} ${priceStr} │${'─'.repeat(leftDashes)}●${'─'.repeat(rightDashes)}│${indicator}`;
      lines.push(line);
    });

    lines.push('  └──────────────────────────────────────────────┘');
    
    if (fibonacci.nearestLevel) {
      lines.push(`  ⭐ Harga terdekat ke level ${fibonacci.nearestLevel.level} (${fibonacci.nearestLevel.price.toFixed(0)})`);
    }

    return lines.join('\n');
  } catch (err) {
    return `⚠️  Error rendering Fibonacci: ${err.message}`;
  }
}

/**
 * Draw moving averages visualization
 */
export function drawMAChart(ma, currentPrice) {
  try {
    if (!ma || !currentPrice) {
      return '  Moving Averages: Tidak ada data';
    }

    const lines = [];
    lines.push('  📊 MOVING AVERAGES');

    // FIX: Keep in order MA5, MA10, MA20, MA50 (don't sort by value)
    const maOrder = ['MA5', 'MA10', 'MA20', 'MA50'];
    const maValues = maOrder.map(label => ({ label, value: ma[label] })).filter(ma => ma.value !== null && !isNaN(ma.value));

    if (maValues.length === 0) {
      return '  Moving Averages: Tidak ada data valid';
    }

    const width = 45;
    const allValues = [...maValues.map(ma => ma.value), currentPrice];
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const range = max - min || 1;

    lines.push('  ┌─────────────────────────────────────────────────────┐');

    maValues.forEach(ma => {
      const position = Math.round(((ma.value - min) / range) * width);
      const priceStr = ma.value.toFixed(0).padStart(8);
      const isAbove = currentPrice > ma.value;
      const signal = isAbove ? '🟢' : '🔴';
      const safePos = Math.min(width - 1, Math.max(0, position));
      
      lines.push(`  │ ${ma.label.padEnd(6)} ${priceStr} ${'─'.repeat(safePos)}●${'─'.repeat(width - 1 - safePos)} ${signal}`);
    });

    // Current price
    const pricePos = Math.round(((currentPrice - min) / range) * width);
    const safePricePos = Math.min(width - 1, Math.max(0, pricePos));
    lines.push(`  │ ${'HARGA'.padEnd(6)} ${currentPrice.toFixed(0).padStart(8)} ${'─'.repeat(safePricePos)}★${'─'.repeat(width - 1 - safePricePos)} ⭐`);
    
    lines.push('  └─────────────────────────────────────────────────────┘');

    // Signals summary
    const above = maValues.filter(ma => currentPrice > ma.value).length;
    const below = maValues.length - above;
    
    lines.push('');
    if (above > below) {
      lines.push(`  ✅ Harga di atas ${above}/${maValues.length} MA (BULLISH)`);
    } else if (below > above) {
      lines.push(`  ❌ Harga di bawah ${below}/${maValues.length} MA (BEARISH)`);
    } else {
      lines.push(`  🟡 Harga netral terhadap MA`);
    }

    return lines.join('\n');
  } catch (err) {
    return `⚠️  Error rendering MA chart: ${err.message}`;
  }
}
