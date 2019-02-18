# import libraries
import urllib2
from bs4 import BeautifulSoup

order_page = 'https://www.doordash.com/orders/track/umuJNq9w1y4F3cD/'
page = urllib2.urlopen(order_page)
page = urllib2.urlopen(order_page)

soup = BeautifulSoup(page, "html.parser")

for part in soup.select('div[class*="CartDetail_cartItem"]'):
    print(part.get_text())