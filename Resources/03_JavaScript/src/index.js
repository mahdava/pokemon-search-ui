const API_URL = "https://api.pokemontcg.io/v2/cards";

// How many cards do we want to display per page?
const pageSize = 8;

// The
const resultsSection = document.getElementById("results");
const resultsOutcome = document.getElementById("results-outcome");
const searchInput = document.getElementById("search");
const searchButton = document.getElementById("submit-search");
let loadMoreButton = document.getElementById("load-more-results");
const searchErrorMessage = document.getElementById("search-error");

const cardList = document.getElementById("card-list");

const createListOfCards = (cards) => {
  // We check again that we have some cards
  if (cards.length > 0) {
    // Let's create HTML for all the cards
    const listItems = cards.map(function (card) {
      // The title that we want to give to the card
      // made by the name and the level of rarity of the card
      const cardCustomTitle = `${card.name} (rarity: ${card.rarity})`;

      // Each card will go in its own list item
      const listItem = document.createElement("li");

      // Each list item will have an image
      const cardImage = document.createElement("img");
      cardImage.src = card.images.small; // We read from the response the url of the image of the card
      cardImage.alt = cardCustomTitle; // We set the alternative text in case the image doesn't load, in this case we just use the title

      // And each list will also have a heading/title
      // that will show the title of the card we created
      const cardTitle = document.createElement("h3");
      cardTitle.innerText = cardCustomTitle;

      // We add the image of the card inside the list
      listItem.append(cardImage);
      // and after it we add the title of the card inside the list as well
      listItem.append(cardTitle);

      return listItem;
    });

    return listItems;
  }
};

let pokemonName = ""; // let lets you modify the content of the variable

const searchCards = (event) => {
  // this prevents the default behavior of submitting a form
  event.preventDefault();

  // clean everything
  cardList.innerHTML = "";
  searchErrorMessage.innerHTML = "";
  resultsOutcome.innerHTML = "";

  resultsSection.classList.add("hidden");

  // let's check before that we have written at least three letters in the input
  // before trying to send a request
  if (searchInput.value.length >= 3) {
    // we need to know on a whole page level what we have entered in the search box
    // so we save that information inside the variable pokemonName
    pokemonName = searchInput.value;

    fetch(`${API_URL}?page=1&pageSize=${pageSize}&q=name:${pokemonName}*`)
      .then(function (response) {
        return response.json();
      })
      .then(function (json) {
        // let's read from our response the array of cards
        let cards = json.data;

        // We do something if we have at least one card
        if (cards.length > 0) {
          // we create the HTML format of all the cards of the first page
          const listItems = createListOfCards(cards);

          // We add them one by one in the place in the HTML page meant to display the cards
          listItems.forEach((item) => cardList.append(item));

          // Because we only show the first 8 cards, we want to tell the user how many cards are in total,
          // so we create a paragraph element
          const cardsNumberMessage = document.createElement("p");

          // And we set it to say that for given search keyword we found x amount of results
          cardsNumberMessage.innerHTML = `Found <strong>${json.totalCount}</strong> pokémon cards for '<em>${searchInput.value}</em>'`;

          // And in the page section dedicated to the results information, we add the paragraph element
          resultsOutcome.append(cardsNumberMessage);

          // If we have more than the default page size, e.g. if we want to display 8 cards
          // but the total card is 20, we want to show the "Load More" button
          // which until now has been in the page but hidden
          if (json.totalCount - pageSize > pageSize) {
            loadMoreButton.disabled = false;
            loadMoreButton.classList.remove("hidden");
          }
        } else {
          // if we don't have any cards

          // we create a paragraph element
          const noCardsMessage = document.createElement("p");

          // that contains a message to tell the user that no card was found
          // based on the text that was searched (and we show them as well what text was searched)
          noCardsMessage.innerHTML = `Cannot find pokémon cards for '<em>${searchInput.value}</em>'`;

          // And in the page section dedicated to the results information, we add the paragraph element
          resultsOutcome.append(noCardsMessage);
        }

        resultsSection.classList.remove("hidden");
      });
  } else {
    // if we have written nothing or less than three letters we will warn the user

    // we create a paragraph element
    const minimumCharactersMessage = document.createElement("p");

    // that contains a message to tell the user to enter at least three letters
    // as well as showing them what they actually typed
    minimumCharactersMessage.innerHTML = `Please enter at least three letters (you searched for '<em>${searchInput.value}</em>').`;

    // And in the page section dedicated to errors we add the paragraph element
    searchErrorMessage.append(minimumCharactersMessage);
  }
};

const loadMoreCards = () => {
  // We read the number of the page we want to load from the meta attribute of the Load More button
  // which we have set to initially start with 2
  let pageToSearch = Number(loadMoreButton.getAttribute("meta-page"));
  fetch(
    `${API_URL}?page=${pageToSearch}&pageSize=${pageSize}&q=name:${pokemonName}*`,
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      // let's read from our response the array of cards
      let cards = json.data;

      // We do something if we have at least one card
      if (cards.length > 0) {
        // we create the HTML format of all the cards of the next page
        const listItems = createListOfCards(cards);

        // We add them one by one in the place in the HTML page meant to display the cards
        // If our cards per page are 8, and in total we have 10
        // this would show only the remaining two
        listItems.forEach((item) => cardList.append(item));

        // If we have still have more cards in total
        // e.g. page one had 8 cards + page two had still 8 cards = 16 cards shown, but the total cards are 20

        // Note: this works also if page one had 8 cards and page two had 4 cards for a total of 12 cards
        // 12 total cards - (8 cards of the first page + 4 cards of the second page) is equal to 0 so it's not "bigger than 0"
        // even if the way we are calculating this is
        // 12 cards total - (8 cards * the current page number 2 ) = 12 - 16 = -4 which is still not bigger than 0
        // This condition explicity requires for us to have more than 0 cards still left to show, so if we have exactly 0 or less
        // it will move to execute the else case

        if (json.totalCount - pageSize * pageToSearch > 0) {
          // we increment the number of the page for the Load More button and save it in the button information itself
          pageToSearch++;
          loadMoreButton.setAttribute("meta-page", pageToSearch);
        } else {
          // If we have already dispayed all the available cards

          // Let's hide and disable again the Load More button
          loadMoreButton.disabled = true;
          loadMoreButton.classList.add("hidden");
        }
      }
    });
};

if (searchButton) {
  searchButton.addEventListener("click", searchCards);
}
if (loadMoreButton) {
  loadMoreButton.addEventListener("click", loadMoreCards);
}
