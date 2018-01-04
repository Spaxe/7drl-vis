#!node
const fs = require('fs');
const fetch = require('node-fetch');

!(async () => {
  // Setup the list of downloads
  let submissions = [];
  const year_range = [2013, 2014, 2015, 2016, 2017];

  // Download the list of games
  try {
    const responses = await Promise.all(
      year_range.map(year => fetch(`http://7drl.roguetemple.com/Game?operation=getGames&year=${year}`))
    );
    const data = await Promise.all(
      responses.map(r => r.json())
    );

    // Add year into each entry
    data.forEach((d, i) => {
      d.games.forEach(game => {
        game.year = year_range[0]+i;
        delete game.contactEmail; // This field doesn't need to go into the data.
        submissions.push(game);
      });
    });

    // Write to file
    fs.writeFileSync('data/7drl_submissions.json', JSON.stringify(submissions, null, 2));
  }
  catch (e) {
    console.error(e);
  }

})();