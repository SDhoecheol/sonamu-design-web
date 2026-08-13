async function run() {
  try {
    const url = 'https://d3dt0c2uw6ie93.cloudfront.net/ebook_1786540042510/files/search/book_config.js';
    console.log('Fetching', url);
    const res = await fetch(url);
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Text length:', text.length);
    console.log('Preview:', text.substring(0, 100));
  } catch (e) {
    console.error(e);
  }
}
run();
