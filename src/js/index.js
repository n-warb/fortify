// Current API Plan: Free 
// Usage: 0 / 500 
// API Key: d773120f227e18f8c8118ae3cfcdd36d 

// http://food2fork.com/api/search

import Search from './models/Search'
import * as searchView from './views/searchView'
import * as recipeView from './views/recipeView'
import * as listView from './views/listView'
import {elements, renderLoader, clearLoader} from './views/base'
import Recipes from './models/Recipes'
import List from  './models/List'
import Likes from './models/Likes';
import * as likesView from './views/likesView'
//Global state of the app
//Search object
//current recipe object
//shopping list object
//liked recipes



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

        try {
        //search for recipes
        await state.search.getResults();
        clearLoader();

        //render results on UI
        console.log(state.search.result)

        searchView.renderResults(state.search.result);
        } catch (err) {
            alert('Something wrong with the search');
            clearLoader();
        }
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

const controlRecipe = async () => {
    const id = window.location.hash.replace('#', '');
    console.log(id);

    if (id) {

        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        if (state.search) searchView.highlightSelected(id);
        state.recipe = new Recipes(id);

        try {
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
            state.recipe.calcServings();
            state.recipe.calcTime();

            clearLoader();
            recipeView.renderRecipe(state.recipe, (state.likes ? state.likes.isLiked(id) : false));  
        } catch (err) {
            alert(`Error processing recipe! ${err}`)
        }
    }
}

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

//list controller

const controlList = () => {
    //crwate a new list if there is none yet
    if (!state.list) {
        state.list = new List();
    }
    //add each ingredient to the list
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

//handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        //delete from state
        state.list.deleteItem(id);
        //delete from user if
        listView.deleteItem(id);
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value);
        state.list.updateCount(id, val);
    }
})



//LIKE controller
const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;
    //user has not yet liked current recipe
    if (!state.likes.isLiked(currentID)) {
        //add like to the state
        const newLike = state.likes.addLike(currentID, state.recipe.title, state.recipe.author, state.recipe.img);
        //toggle the like button
        likesView.toggleLikeBtn(true);

        //add like to UI list
        likesView.renderLike(newLike)
        console.log(state.likes);

        //user has liked the current recipe
    } else {
        //remove like to the state
        state.likes.deleteLike(currentID);
        //toggle the like button
        likesView.toggleLikeBtn(false);

        //remove like to UI list
        console.log(state.likes);
        likesView.deleteLike(currentID);
    }

    likesView.toggleLikeMenu(state.likes.getNumLikes())
}

window.addEventListener('load', () => {

    state.likes = new Likes();
    state.likes.readStorage();
    likesView.toggleLikeMenu(state.likes.getNumLikes())
    state.likes.likes.forEach(like => likesView.renderLike(like))
})



//handle recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        //decrase button is clicked
        if (state.recipe.servings > 1)
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
    }
    if (e.target.matches('.btn-increase, .btn-increase *')) {
        //decrase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        //add ingredients to shopping list
        controlList();
    }  else if (e.target.matches('.recipe__love, .recipe__love *')) {
        //Like controller
        controlLike();
    }
})


const l = new List();
window.l = l;
