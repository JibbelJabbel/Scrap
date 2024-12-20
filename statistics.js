async function loadStatistics() {
    try {
        const response = await fetch('iphone.csv');
        if (!response.ok) throw new Error('Failed to fetch CSV');
        
        const data = await response.text();
        const rows = data.split('\n').slice(1); // Exclude header row

        // Group data by series (e.g., iPhone 11, iPhone 12, etc.) with categories and storage
        const seriesStats = {};
        rows.forEach(row => {
            const [title, priceStr, link, model, category, storage] = row.split(',');
            const price = parseInt(priceStr?.replace(/\D/g, ''));
            
            if (!isNaN(price) && model) {
                const series = model.match(/iPhone \d+/i)?.[0]; // Extract series like "iPhone 11"
                if (series) {
                    if (!seriesStats[series]) seriesStats[series] = [];
                    seriesStats[series].push({ price, title, category, storage, link });
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
            const listings = seriesStats[series];
            const prices = listings.map(item => item.price);
            
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

            // Add a list of categories and storage options
            const details = document.createElement('ul');
            details.classList.add('details-list');
            listings.forEach(item => {
                const detailItem = document.createElement('li');
                detailItem.innerHTML = `
                    <strong>${item.category}</strong>, ${item.storage} - 
                    <a href="${item.link}" target="_blank">View</a>
                `;
                details.appendChild(detailItem);
            });

            box.appendChild(details);
            statsContainer.appendChild(box);
        });
    } catch (error) {
        console.error(error);
    }
}

window.onload = loadStatistics;
