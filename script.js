async function loadIphoneListings() {
        try {
                const response = await fetch('singular_iphones.csv');  // Adjust the path to your CSV file
                if (!response.ok) {
                    throw new Error(`Failed to load CSV: ${response.statusText}`);
                }
                const data = await response.text();

                const tableBody = document.querySelector("#iphone-listings tbody");

                const rows = data.split('\n');
                const headers = rows[0].split(',');

                for (let i = 1; i < rows.length; i++) {
                    const columns = rows[i].split(',');

                    if (columns.length === headers.length) {
                        const tr = document.createElement('tr');

                        columns.forEach((column, index) => {
                            const td = document.createElement('td');

                            if (headers[index] === 'link') {
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

                        tableBody.appendChild(tr);
                    }
                }
        } catch (error) {
                console.error(error);
        }
 }

window.onload = function() {
            loadIphoneListings();
};
