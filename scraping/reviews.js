#!node
const fs = require('fs');
const fetch = require('node-fetch');

!(async () => {
  // Setup the list of reviews
  let reviews = [];
  const year_range = [2014, 2015, 2016, 2017];

  // Download the list of reviews
  try {
    const responses = await Promise.all(
      year_range.map(year => fetch(`http://7drl.roguetemple.com/Game?operation=getReviews&year=${year}`))
    );
    const data = await Promise.all(
      responses.map(r => r.json())
    );

    // Add year into each entry
    data.forEach((d, i) => {
      d.reviews.forEach(review => {
        reviews.push(review);
      });
    });

    // Write to file
    fs.writeFileSync('data/7drl_reviews.json', JSON.stringify(reviews, null, 2));
  }
  catch (e) {
    console.error(e);
  }

})();