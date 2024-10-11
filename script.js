// Function to load and display iPhone listings from the combined CSV
async function loadIphoneListings() {
    try {
        // Fetch the combined iPhone listings CSV
        const response = await fetch('iphone.csv');
        if (!response.ok) {
            throw new Error(`Failed to load listings CSV: ${response.statusText}`);
        }
        const data = await response.text();

        const listingsContainer = document.getElementById("iphone-listings");

        // Parse the CSV data into rows
        const rows = data.split('\n');

        // Extract the headers
        const headers = rows[0].split(',');

        // Loop through each row and create a listing card for each
        for (let i = 1; i < rows.length; i++) {
            const columns = rows[i].split(',');

            if (columns.length === headers.length) {
                // Extract data from the row
                const [title, price, link, model, category, storage, avgPrice, medPrice] = columns;
                const numericPrice = parseInt(price.replace(/\D/g, ''));  // Extract numeric price
                const avg = parseInt(avgPrice);
                const med = parseInt(medPrice);

                // Determine the color of the price box
                let priceClass = '';
                if (numericPrice < Math.min(avg, med) - 500) {
                    priceClass = 'green';
                } else if (numericPrice <= Math.max(avg, med)) {
                    priceClass = 'yellow';
                } else {
                    priceClass = 'red';
                }

                // Create the listing card div
                const card = document.createElement('div');
                card.classList.add('listing-card');

                // Create title element
                const titleDiv = document.createElement('div');
                titleDiv.classList.add('title');
                titleDiv.textContent = title;

                // Create price element
                const priceDiv = document.createElement('div');
                priceDiv.classList.add('price', priceClass);
                priceDiv.textContent = price;

                // Create model, category, storage, avg price, and median price elements
                const modelDiv = createDetailElement("Model", model);
                const categoryDiv = createDetailElement("Category", category);
                const storageDiv = createDetailElement("Storage", storage);
                const avgPriceDiv = createDetailElement("AVG price", avgPrice);
                const medPriceDiv = createDetailElement("Med price", medPrice);

                // Append all elements to the card
                card.appendChild(titleDiv);
                card.appendChild(priceDiv);
                card.appendChild(modelDiv);
                card.appendChild(categoryDiv);
                card.appendChild(storageDiv);
                card.appendChild(avgPriceDiv);
                card.appendChild(medPriceDiv);

                // Append the card to the listings container
                listingsContainer.appendChild(card);
            }
        }
    } catch (error) {
        console.error(error);
    }
}

// Helper function to create detail elements
function createDetailElement(label, value) {
    const div = document.createElement('div');
    div.classList.add('detail');
    div.innerHTML = `<strong>${label}</strong>: ${value}`;
    return div;
}

// Ensure the DOM is fully loaded before running the script
window.onload = loadIphoneListings;
