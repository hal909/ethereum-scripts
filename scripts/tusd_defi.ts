import axios from 'axios';
import cheerio from 'cheerio'

var options = {
        url: 'https://info.uniswap.org/token/0x0000000000085d4780b73119b644ae5ecd22b376',
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.3 (KHTML, like Gecko) Version/8.0 Mobile/12A4345d Safari/600.1.4'
        }
      };

const url = 'https://info.uniswap.org/token/0x0000000000085d4780b73119b644ae5ecd22b376'; // URL we're scraping
const AxiosInstance = axios.create(); // Create a new Axios Instance

// Send an async HTTP Get request to the url
AxiosInstance.get(options)
  .then( // Once we have data returned ...
    response => {
      const html = response.data; // Get the HTML from the HTTP request
      console.log(response.data)
      const $ = cheerio.load(html); // Load the HTML string into cheerio
      const statsTable= $('.sc-bdVaJa .KpMoH .css-9on69b'); // Parse the HTML and extract just whatever code contains .statsTableContainer and has tr inside
      console.log(statsTable); // Log the number of captured elements
    }
  )
  .catch(console.error); // Error handling