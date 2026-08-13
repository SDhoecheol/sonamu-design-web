async function run() {
  const url = 'https://d3dt0c2uw6ie93.cloudfront.net/ebook_1786540042510/files/search/book_config.js';
  const fetchRes = await fetch(url);
  const text = await fetchRes.text();
  
  let pageCount = 0;
  const match = text.match(/var textForPages =\[(.*?)\]/s);
  if (match) {
    const arrayContent = match[1];
    pageCount = 1;
    let inString = false;
    for (let i = 0; i < arrayContent.length; i++) {
      if (arrayContent[i] === '"' && (i === 0 || arrayContent[i-1] !== '\\')) {
        inString = !inString;
      }
      if (arrayContent[i] === ',' && !inString) {
        pageCount++;
      }
    }
  } else {
    console.error('textForPages variable not found in config');
  }
  console.log("Total Pages:", pageCount);
}
run();
