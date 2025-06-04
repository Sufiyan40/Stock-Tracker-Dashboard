const apikey = "KKZBJ37SVGTPQ1ST";

    async function fetchStock(symbol) {
      const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${apikey}`;
      const response = await fetch(url);
      const data = await response.json();
      return data;
    }

    function extractData(data) {
      const timeSeries = data["Time Series (5min)"];
      const labels = Object.keys(timeSeries).reverse();
      const prices = labels.map(time => parseFloat(timeSeries[time]["4. close"]));
      return { labels, prices };
    }

    async function renderChart(symbol) {
      const data = await fetchStock(symbol);

      if (!data["Meta Data"] || !data["Time Series (5min)"]) {
        document.getElementById("stockInfo").innerHTML = `No data found for ${symbol}`;
        return;
      }

      const meta = data["Meta Data"];
      const series = extractData(data);

      // Display selected stock metadata
      document.getElementById("stockInfo").innerHTML = `
        <strong>${meta["2. Symbol"]}</strong><br>
        Last Refreshed: ${meta["3. Last Refreshed"]}<br>
        Time Zone: ${meta["6. Time Zone"]}<br>
        Interval: ${meta["4. Interval"]}
      `;

      // Clear the previous chart if any
      if (window.myChart) window.myChart.destroy();

      // Draw new chart with updated data
      const ctx = document.getElementById('stockChart').getContext('2d');
      window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: series.labels,
          datasets: [{
            label: `${symbol} Price`,
            data: series.prices,
            borderColor: 'blue',
            backgroundColor: 'lightblue',
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true
            }
          }
        }
      });
    }

    function loadStock() {
      const symbol = document.getElementById("stockSelector").value;
      renderChart(symbol);
    }

    function searchStock() {
      const symbol = document.getElementById("stockSearch").value.trim().toUpperCase();
      if (symbol) renderChart(symbol);
    }

    // Load a default stock on first load
    window.onload = () => {
      renderChart("AAPL");
    };