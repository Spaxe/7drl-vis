#!node
const fs = require('fs');
const fetch = require('node-fetch');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

!(async () => {
  // Setup the list of reviews
  let reviews = [];
  const year_range = [2013];

  // Download the list of reviews
  try {
    const responses = await Promise.all(
      year_range.map(year => fetch(`http://roguetemple.com/7drl/2013/`))
    );
    const data = await Promise.all(
      responses.map(r => r.text())
    );

    // Add year into each entry
    data.forEach( d => {
      const dom = new JSDOM(d);

      // Parse for list of reviews
      const rows = dom.window.document.querySelectorAll('table.sortable tbody tr');

      rows.forEach( row => {
        // Extract values from HTML
        let gameSlug,
            updatesURL;
        const values = Array.from(row.children).map( (el, i) => {
          if (i === 0) { // Author websites are linked in the href
            updatesURL = el.firstChild.href;
          } else if (i === 2) { // runtime requirements are displayed as icons, so we need to get the titles
            return Array.from(el.children).map ( img => {
              return img.title;
            });
          } else if (i === 3) { // videos are linked in the href attribute.
            return el.firstChild.href;
          } else if (i === 4) { // gameSlugs are hidden in the onclick attribute
            gameSlug = el.getAttribute('onclick').match(
              /setDisplayedPage\('(.*)', 'completeness'\)/
            )[1];
          }
          return el.textContent.trim();
        });

        // More field names for review fields
        const [
          gameTitle,
          developerName,
          runtimeRequirements,
          videoURL,
          c, // Completeness: Bug free, polished game with no features that feel like they are missing.
          a, // Aesthetics: Good looking, excellent controls and UI.
          f, // Fun: If you try any 7DRLs, try this one.
          i, // Innovation: Brings something fundamentally new to roguelikes.
          s, // Scope: Beyond what you think could have been done in seven days.
          r, // Roguelike: 3 means Roguelike, 2 means Roguelike-like
          generalScore,
        ] = values

        // Parse for review description and commentary
        const [ ct, at, ft, it, st, rt, reviewText ] = [
          dom.window.document.getElementById(`info_${gameSlug}_completeness`).textContent.trim(),
          dom.window.document.getElementById(`info_${gameSlug}_aesthetics`).textContent.trim(),
          dom.window.document.getElementById(`info_${gameSlug}_fun`).textContent.trim(),
          dom.window.document.getElementById(`info_${gameSlug}_innovation`).textContent.trim(),
          dom.window.document.getElementById(`info_${gameSlug}_scope`).textContent.trim(),
          dom.window.document.getElementById(`info_${gameSlug}_roguelikeness`).textContent.trim(),
          dom.window.document.getElementById(`info_${gameSlug}_long`).textContent.trim(),
        ];

        // console.log(values);
        // console.log(updatesURL);
        // console.log(gameSlug);
        // console.log([ ct, at, ft, it, st, rt, reviewText ]);
        reviews.push({
          gameTitle,
          developerName,
          runtimeRequirements,
          videoURL,
          updatesURL,
          c, a, f, i, s, r, generalScore,
          ct, at, ft, it, st, rt, reviewText,
        });

      });
    });

    // Write to file
    fs.writeFileSync('data/7drl_reviews_2013_prior.json', JSON.stringify(reviews, null, 2));
  }
  catch (e) {
    console.error(e);
  }

})();