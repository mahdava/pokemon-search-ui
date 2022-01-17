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
  alert("Implement me!");
};

if (searchButton) {
  searchButton.addEventListener("click", searchCards);
}
if (loadMoreButton) {
  loadMoreButton.addEventListener("click", loadMoreCards);
}
