// Function to load and display iPhone listings from CSV
async function loadIphoneListings() {
    try {
        // Fetch singular iPhone listings
        const listingsResponse = await fetch('singular_iphones.csv');
        if (!listingsResponse.ok) {
            throw new Error(`Failed to load listings CSV: ${listingsResponse.statusText}`);
        }
        const listingsData = await listingsResponse.text();

        // Fetch iPhone statistics (average and median prices)
        const statsResponse = await fetch('iphone_statistics.csv');
        if (!statsResponse.ok) {
            throw new Error(`Failed to load statistics CSV: ${statsResponse.statusText}`);
        }
        const statsData = await statsResponse.text();

        const tableBody = document.querySelector("#iphone-listings tbody");

        // Parse the CSV data into rows
        const listingsRows = listingsData.split('\n');
        const statsRows = statsData.split('\n');

        // Create a dictionary of model -> average and median prices
        const priceMap = {};
        statsRows.slice(1).forEach(row => {
            const [model, avgPrice, medPrice] = row.split(',');
            priceMap[model] = {
                average: avgPrice,
                median: medPrice
            };
        });

        // Parse the singular listings and display them with average and median prices
        const listingsHeaders = listingsRows[0].split(',');

        for (let i = 1; i < listingsRows.length; i++) {
            const columns = listingsRows[i].split(',');

            if (columns.length === listingsHeaders.length) {
                const tr = document.createElement('tr');

                columns.forEach((column, index) => {
                    const td = document.createElement('td');
                    if (listingsHeaders[index] === 'link') {
                        const a = document.createElement('a');
                        a.href = column;
                        a.textContent = "View Listing";
                        a.target = "_blank";
                        td.appendChild(a);
                    } else {
                        td.textContent = column;
                    }
                    tr.appendChild(td);
                });

                // Extract the model name from the listing title
                const title = columns[0];
                const modelMatch = Object.keys(priceMap).find(model => title.includes(model));

                if (modelMatch) {
                    // Add "Listed As" (average price) and "Min Price" (median price) columns
                    const averagePriceTd = document.createElement('td');
                    averagePriceTd.textContent = `${priceMap[modelMatch].average} kr`;
                    tr.appendChild(averagePriceTd);

                    const minPriceTd = document.createElement('td');
                    minPriceTd.textContent = `${priceMap[modelMatch].median} kr`;
                    tr.appendChild(minPriceTd);
                } else {
                    // If the model doesn't match, add empty cells for these columns
                    const averagePriceTd = document.createElement('td');
                    averagePriceTd.textContent = 'N/A';
                    tr.appendChild(averagePriceTd);

                    const minPriceTd = document.createElement('td');
                    minPriceTd.textContent = 'N/A';
                    tr.appendChild(minPriceTd);
                }

                tableBody.appendChild(tr);
            }
        }
    } catch (error) {
        console.error(error);
    }
}

// Ensure the DOM is fully loaded before running the script
window.onload = loadIphoneListings;
