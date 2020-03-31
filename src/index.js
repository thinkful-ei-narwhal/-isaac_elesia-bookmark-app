import $ from 'jquery';
import '../node_modules/@fortawesome/fontawesome-free/js/all';
import './css/style.css';

import bookmarkApp from './scripts/bookmark-app';
import store from './scripts/store';
import api from './scripts/api';

const main = function() {
	api.getBookmarks().then(bookmarks => {
		bookmarks.forEach(bookmark => store.addBookmark(bookmark));
		bookmarkApp.render();
	});

	bookmarkApp.bindEventListeners();
	bookmarkApp.render();
};

$(main);
