// Current API Plan: Free 
// Usage: 0 / 500 
// API Key: d773120f227e18f8c8118ae3cfcdd36d 

// http://food2fork.com/api/search

import Search from './models/Search'
import * as searchView from './views/searchView'
import {elements, renderLoader, clearLoader} from './views/base'
//Global state of the app
//Search object
//current recipe object
//shopping list object
//liked recipes

const state = {
};

const controlSearch = async () => {
    //1) Get query from the view
    const query = searchView.getInput() //todo

    if (query) {
        //New search object and add to state
        state.search = new Search(query);
        //prepare UI for results
        searchView.clearInput();
        searchView.clearResults();

        renderLoader(elements.searchRes);

        //search for recipes
        await state.search.getResults();
        clearLoader();

        //render results on UI
        console.log(state.search.result)

        searchView.renderResults(state.search.result);

    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline')
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});
