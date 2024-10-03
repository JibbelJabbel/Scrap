import time

def scrape_data():
    items = []
    for page in range(1, 6):  # Adjust the range based on how many pages you want to scrape
        url = f"https://www.finn.no/bap/forsale/search.html?category=2.93&search_type=SEARCH_ID_BAP_ALL&q=iphone&page={page}"
        response = requests.get(url)
        if response.status_code != 200:
            print(f"Failed to retrieve page {page}: {response.status_code}")
            break

        soup = BeautifulSoup(response.content, 'html.parser')

        for item in soup.find_all('article', class_='ads__unit'):
            title = item.find('a', class_='ads__unit__link').text.strip() if item.find('a', class_='ads__unit__link') else 'No title'
            price_tag = item.find('div', class_='ads__unit__content__listprice')
            price = price_tag.text.strip() if price_tag else 'No price'
            location_tag = item.find('div', class_='ads__unit__content__details')
            location = location_tag.text.strip() if location_tag else 'No location'
            link_tag = item.find('a', class_='ads__unit__link')
            link = f"https://www.finn.no{link_tag['href']}" if link_tag else 'No link'

            items.append({'title': title, 'price': price, 'location': location, 'link': link})

        print(f"Scraped page {page}")
        time.sleep(2)  # Be polite and wait 2 seconds before fetching the next page

    with open('scraped_data.csv', mode='w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=['title', 'price', 'location', 'link'])
        writer.writeheader()
        writer.writerows(items)

    print(f"Scraped a total of {len(items)} iPhone listings.")

if __name__ == '__main__':
    scrape_data()
