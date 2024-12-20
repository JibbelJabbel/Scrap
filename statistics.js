async function loadStatistics() {
    try {
        const response = await fetch('iphone.csv');
        if (!response.ok) throw new Error('Failed to fetch CSV');
        const data = await response.text();
        const rows = data.split('\n').slice(1); // Exclude header
        const prices = rows.map(row => parseInt(row.split(',')[1]?.replace(/\D/g, ''))).filter(n => !isNaN(n));
        const avgPrice = (prices.reduce((sum, price) => sum + price, 0) / prices.length).toFixed(2);
        const statsContainer = document.getElementById('statistics-content');
        statsContainer.innerHTML = `<p>Total Listings: ${rows.length}</p><p>Average Price: ${avgPrice}</p>`;
    } catch (error) {
        console.error(error);
    }
}

window.onload = loadStatistics;
