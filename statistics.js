async function loadStatistics() {
    try {
        const response = await fetch('iphone.csv');
        if (!response.ok) throw new Error('Failed to fetch CSV');
        
        const data = await response.text();
        const rows = data.split('\n').slice(1); // Exclude header row

        // Group data by series and subcategories (e.g., iPhone 11 Pro 64GB)
        const seriesStats = {};
        rows.forEach(row => {
            const [title, priceStr, , model, category, storage] = row.split(',');
            const price = parseInt(priceStr?.replace(/\D/g, ''));
            
            if (!isNaN(price) && model) {
                const series = model.match(/iPhone \d+/i)?.[0]; // Extract series like "iPhone 11"
                const subcategory = `${category} ${storage}`; // Combine category and storage
                
                if (series) {
                    if (!seriesStats[series]) seriesStats[series] = {};
                    if (!seriesStats[series][subcategory]) seriesStats[series][subcategory] = [];
                    seriesStats[series][subcategory].push(price);
                }
            }
        });

        // Sort models from oldest to newest
        const sortedSeries = Object.keys(seriesStats).sort((a, b) => {
            const numA = parseInt(a.match(/\d+/)[0]);
            const numB = parseInt(b.match(/\d+/)[0]);
            return numA - numB;
        });

        // Generate and display statistics for each series
        const statsContainer = document.getElementById('statistics-content');
        statsContainer.innerHTML = ''; // Clear existing content

        sortedSeries.forEach(series => {
            const subcategories = seriesStats[series];
            const box = document.createElement('div');
            box.classList.add('series-box');
            
            // Add the series header
            box.innerHTML = `<h2>${series}</h2>`;

            // Add statistics for each subcategory
            Object.keys(subcategories).forEach(subcategory => {
                const prices = subcategories[subcategory];
                if (prices.length === 0) return;

                const avgPrice = (prices.reduce((sum, price) => sum + price, 0) / prices.length).toFixed(2);
                const sortedPrices = prices.slice().sort((a, b) => a - b);
                const medianPrice = sortedPrices.length % 2 === 0
                    ? ((sortedPrices[sortedPrices.length / 2 - 1] + sortedPrices[sortedPrices.length / 2]) / 2).toFixed(2)
                    : sortedPrices[Math.floor(sortedPrices.length / 2)];
                
                const stats = document.createElement('p');
                stats.innerHTML = `
                    <strong>${subcategory}:</strong> 
                    Average Price: ${avgPrice}, Median Price: ${medianPrice}
                `;
                box.appendChild(stats);
            });

            statsContainer.appendChild(box);
        });
    } catch (error) {
        console.error(error);
    }
}

window.onload = loadStatistics;
