async function run() {
  const url = 'https://d3dt0c2uw6ie93.cloudfront.net/ebook_1786540042510/index.html';
  const res = await fetch(url);
  const text = await res.text();
  console.log(text.substring(0, 1000));
}
run();
