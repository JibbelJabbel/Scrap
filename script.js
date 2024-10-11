// Function to load and display iPhone listings from the combined CSV
async function loadIphoneListings() {
    try {
        // Fetch the combined iPhone listings CSV
        const response = await fetch('iphone.csv');
        if (!response.ok) {
            throw new Error(`Failed to load listings CSV: ${response.statusText}`);
        }
        const data = await response.text();
        console.log("CSV data fetched successfully");

        const listingsContainer = document.getElementById("iphone-listings");

        // Parse the CSV data into rows
        const rows = data.split('\n');
        console.log("Parsed rows:", rows);

        // Extract the headers
        const headers = rows[0].split(',');

        // Loop through each row and create a listing card for each
        for (let i = 1; i < rows.length; i++) {
            const columns = rows[i].split(',');

            if (columns.length === headers.length) {
                // Extract data from the row
                const [title, price, link, model, category, storage, avgPrice, medPrice] = columns;
                console.log("Processing row:", columns);
                
                const numericPrice = parseInt(price.replace(/\D/g, ''));  // Extract numeric price
                const avg = parseInt(avgPrice);
                const med = parseInt(medPrice);

                // Check if average or median are valid numbers
                if (isNaN(avg) || isNaN(med)) {
                    console.log(`Skipping row due to invalid avg or med price for ${title}`);
                    continue;  // Skip this listing if no valid average/median found
                }

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
                card.style.cursor = 'pointer'; // Make it look clickable

                // Add event listener to redirect to the link when the card is clicked
                card.addEventListener('click', () => {
                    window.open(link, '_blank'); // Opens the link in a new tab
                });

                // Create title element
                const titleDiv = document.createElement('div');
                titleDiv.classList.add('title');
                titleDiv.textContent = title;

                // Create left-info and right-info divs
                const leftInfoDiv = document.createElement('div');
                leftInfoDiv.classList.add('left-info');
                
                const rightInfoDiv = document.createElement('div');
                rightInfoDiv.classList.add('right-info');

                // Left info: model, category, storage
                const modelDiv = createDetailElement("Model", model);
                const categoryDiv = createDetailElement("Category", category);
                const storageDiv = createDetailElement("Storage", storage);

                leftInfoDiv.appendChild(modelDiv);
                leftInfoDiv.appendChild(categoryDiv);
                leftInfoDiv.appendChild(storageDiv);

                // Right info: price, avg price, median price
                const priceDiv = document.createElement('div');
                priceDiv.classList.add('price', priceClass);
                priceDiv.textContent = price;

                const avgPriceDiv = createDetailElement("AVG price", avgPrice);
                const medPriceDiv = createDetailElement("Med price", medPrice);

                rightInfoDiv.appendChild(priceDiv);
                rightInfoDiv.appendChild(avgPriceDiv);
                rightInfoDiv.appendChild(medPriceDiv);

                // Append title, left-info, and right-info to the card
                card.appendChild(titleDiv);
                card.appendChild(leftInfoDiv);
                card.appendChild(rightInfoDiv);

                // Append the card to the listings container
                listingsContainer.appendChild(card);
                console.log(`Added listing for ${title}`);
            }
        }
    } catch (error) {
        console.error("Error:", error);
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
