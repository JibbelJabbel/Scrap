async function loadStatistics() {
    try {
        const response = await fetch('iphone.csv');
        if (!response.ok) throw new Error('Failed to fetch CSV');
        
        const data = await response.text();
        const rows = data.split('\n').slice(1); // Exclude header row
        
        // Group data by series (e.g., iPhone 11, iPhone 12, etc.)
        const seriesStats = {};
        rows.forEach(row => {
            const [title, priceStr, , model] = row.split(',');
            const price = parseInt(priceStr?.replace(/\D/g, ''));
            
            if (!isNaN(price) && model) {
                const series = model.match(/iPhone \d+/i)?.[0]; // Extract series like "iPhone 11"
                if (series) {
                    if (!seriesStats[series]) seriesStats[series] = [];
                    seriesStats[series].push(price);
                }
            }
        });
        
        // Calculate statistics for each series
        const statsContainer = document.getElementById('statistics-content');
        statsContainer.innerHTML = ''; // Clear existing content
        
        Object.keys(seriesStats).forEach(series => {
            const prices = seriesStats[series];
            if (prices.length === 0) return;
            
            const avgPrice = (prices.reduce((sum, price) => sum + price, 0) / prices.length).toFixed(2);
            const sortedPrices = prices.slice().sort((a, b) => a - b);
            const medianPrice = sortedPrices.length % 2 === 0
                ? ((sortedPrices[sortedPrices.length / 2 - 1] + sortedPrices[sortedPrices.length / 2]) / 2).toFixed(2)
                : sortedPrices[Math.floor(sortedPrices.length / 2)];
            
            // Create a box for each series
            const box = document.createElement('div');
            box.classList.add('series-box');
            box.innerHTML = `
                <h2>${series}</h2>
                <p><strong>Average Price:</strong> ${avgPrice}</p>
                <p><strong>Median Price:</strong> ${medianPrice}</p>
            `;
            
            statsContainer.appendChild(box);
        });
    } catch (error) {
        console.error(error);
    }
}

window.onload = loadStatistics;
