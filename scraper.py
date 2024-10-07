import requests
from bs4 import BeautifulSoup
import csv


# Function to check if a title matches iPhone models 11 and up
def is_desired_iphone(title):
    # List of iPhone models we are interested in (11 and up)
    valid_models = ['iPhone 11', 'iPhone 12', 'iPhone 13', 'iPhone 14', 'iPhone 15', "iPhone 16"]

    # Check if any of the valid models are in the title
    return any(model in title for model in valid_models)



def scrape_data(filename, url):
    items = []
    page = 1  # Start from the first page

    
    while True:
        # Update the URL to include the current page number
        page_url = f"{url}&page={page}"
        response = requests.get(page_url)
        
        # Check if the request was successful
        if response.status_code != 200:
            print(f"Failed to retrieve page {page}: {response.status_code}")
            break

        # Parse the HTML content
        soup = BeautifulSoup(response.content, 'html.parser')

        # Find all the article elements (listings) on the page
        listings = soup.find_all('article', class_='relative')

        # If no listings are found, we've likely reached the last page
        if not listings:
            print("No more listings found. Scraping complete.")
            break

        # Loop through each listing and extract the required data
        for item in listings:
            title = item.find('h2', class_='h4').text.strip() if item.find('h2', class_='h4') else 'No title'

            # Filter out unwanted iPhones (keep only iPhone 11 and higher)
            if is_desired_iphone(title):
                price_tag = item.find('div', class_='absolute bottom-0')
                price = price_tag.text.strip() if price_tag else 'No price'
                link_tag = item.find('a', class_='sf-search-ad-link')
                link = f"{link_tag['href']}" if link_tag else 'No link'

                # Append the filtered iPhone listing to the items list
                items.append({'title': title, 'price': price, 'link': link})
            
            

        print(f"Scraped page {page}")

        # Check if a "Next" button or pagination link is available
        next_button = soup.find('a', {'aria-label': 'Neste resultatside'})  # The 'aria-label' is often used for next buttons
        if not next_button:
            # No more pages, exit the loop
            print("No more pages found.")
            break
        else:
            # Increment the page number and continue scraping
            page += 1

            # Be polite and wait before scraping the next page
            #time.sleep(2)

    # Write the scraped data to a CSV file
    with open(filename, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=['title', 'price', 'link'])
        writer.writeheader()
        writer.writerows(items)

    print(f"Scraped a total of {len(items)} iPhone listings.")


def merge_csv(file1, file2, output_file):
    # Read the first file
    with open(file1, mode='r', newline='', encoding='utf-8') as f1:
        reader1 = csv.DictReader(f1)
        data1 = list(reader1)

    # Read the second file
    with open(file2, mode='r', newline='', encoding='utf-8') as f2:
        reader2 = csv.DictReader(f2)
        data2 = list(reader2)

    # Ensure the headers are the same in both files
    if reader1.fieldnames != reader2.fieldnames:
        print("Error: CSV files have different headers.")
        return

    # Merge the data from both files
    merged_data = data1 + data2

    # Write the merged data to the output file
    with open(output_file, mode='w', newline='', encoding='utf-8') as output:
        writer = csv.DictWriter(output, fieldnames=reader1.fieldnames)
        writer.writeheader()
        writer.writerows(merged_data)

    print(f"Successfully merged {len(data1)} records from {file1} and {len(data2)} records from {file2} into {output_file}.")


if __name__ == '__main__':
    scrape_data("iPhone_low.csv", "https://www.finn.no/bap/forsale/search.html?price_from=500&price_to=2500&product_category=2.93.3217.39&q=iphone")
    scrape_data("iPhone_mid.csv","https://www.finn.no/bap/forsale/search.html?price_from=2500&price_to=6500&product_category=2.93.3217.39&q=iphone&sort=PRICE_DESC")
    scrape_data("iPhone_high.csv","https://www.finn.no/bap/forsale/search.html?price_from=6500&product_category=2.93.3217.39&q=iphone&sort=PRICE_DESC")

    merge_csv("iPhone_low.csv", "iPhone_mid.csv", "iPhone_all.csv")
    merge_csv("iPhone_all.csv", "iPhone_high.csv", "iPhone_all.csv")
