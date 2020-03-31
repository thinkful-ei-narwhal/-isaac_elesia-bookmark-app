import $ from 'jquery';

import api from './api';
import store from './store';

/* ****************************
      Generate Functions
*******************************/

const generateOptions = rating => {
	const options = [];
	for (let i = 6; i > 0; i--) {
		if (i === parseInt(rating)) {
			options.push(`<option value="${i}" selected>${i} stars</option>`);
		} else if (i === 6) {
			options.push('<option value="0" >Filter By</option>');
		} else if (i === 1) {
			options.push(`<option value="${i}" >${i} star</option>`);
		} else {
			options.push(`<option value="${i}" >${i} stars</option>`);
		}
	}
	return options;
};

const generateHeader = bookmark => {
	const options = generateOptions(store.filter);

	return bookmark.adding || bookmark.edit
		? ` <h1 class="create-h1">My Bookmarks</h1> <!--  Error -- -->
		<section class="error"></section>`
		: `	<h1>My Bookmarks</h1>
  <div class="sub-head">
    <button class="btn-new">New</button>
    <select name="filter" id="filter">
      ${options}
    </select>
	</div>
	<!--  Error -- -->
		<section class="error"></section>`;
};

const generateMainContent = bookmarks => {
	return bookmarks.map(bookmark => {
		let editTrash, description;

		if (bookmark.expanded) {
			editTrash = ` <div class="modify">
  <i class="fas fa-edit"></i>
  <i class="fas fa-trash-alt"></i>
</div>`;

			description = `<div class="description show ">
<div class="des-heading">
	<a href="${bookmark.url}" target="_blank" class="url">Visit Site</a>
</div>
<p class="des-p">
${bookmark.desc}
</p>
</div>`;
		} else {
			editTrash = ` <div class="modify">
	<i class="fas fa-trash-alt"></i>
	</div>`;

			description = '<div></div>';
		}

		return `<div class="bookmark" id="${bookmark.id}">
  <div class="heading">
    <a href="#" class="more"><h3>${bookmark.title}</h3></a>
   ${editTrash}
  </div>

  <div class="stars">
    <i class="fas fa-star star-1 "></i>
    <i class="fas fa-star star-2 "></i>
    <i class="fas fa-star star-3 "></i>
    <i class="fas fa-star star-4 "></i>
    <i class="fas fa-star star-5"></i>
	</div>

  ${description}
</div>`;
	});
};

const generateCreateOrUpdateForm = (id = null) => {
	let title, rating, url, desc;

	if (id) {
		const bookmark = store.findById(id);
		title = bookmark.title;
		rating = bookmark.rating;
		url = bookmark.url;
		desc = bookmark.desc;
	}

	return `<form action="#" id="input-form">
		<input
			type="text"
			name="title"
			id="title"
			value = "${title ? title : ''}"
			placeholder="Title"
			required
		/>
		<input type="url" name="url" id="link" placeholder="Website URL" value ="${
			url ? url : ''
		}" required/>
		<select name="rating" id="rank" required>
			${generateOptions(rating)}
		</select>
		<textarea
			name="desc"
			id="web-des"
			class="scrollbar"
			placeholder="Website description"
			required>${desc ? desc : ''}</textarea>
		<div class="input-btn">
			<input type="submit" />
			<button id="cancel"> Cancel </button>
			<!--  <input type="reset" /> -- -->
			 
		</div>
	</form>`;
};

/* *****************************
  	Functions Handling Error
*********************************/

const generateError = function(message) {
	return `
		<div class="error-bg">
      <div class="error-content">
        <button id="cancel-error">X</button>
        <p>${message}</p>
			</div>
		</div>
    `;
};

const renderError = function() {
	if (store.error) {
		const el = generateError(store.error);
		$('.error').html(el);
	} else {
		$('.error').empty();
	}
};

const handleCloseError = function() {
	$('header').on('click', '#cancel-error', () => {
		store.setError(null);
		renderError();
	});
};

/* *****************************
        Render Functions
*********************************/

// Display Gold Star
const renderGoldStar = () => {
	const bookmarks = [...store.bookmarks];

	return bookmarks.map(bookmark => {
		let id = $(`#${bookmark.id}`).attr('id');
		if (id === bookmark.id) {
			for (let i = 1; i <= bookmark.rating; i++) {
				$(`#${bookmark.id} .star-${i}`).addClass('gold');
			}
		}
	});
};

// Render Pages
const render = () => {
	//If Error, Display it
	renderError();

	//Filter Bookmaks By rating
	const bookmarks = [...store.filterByRating(store.filter)];

	// Render page Header
	$('header').html(generateHeader(store));

	// Render page Main Content
	if (bookmarks.length !== 0 && store.adding === false) {
		$('main').addClass('show-main');
		$('main').html(generateMainContent(bookmarks));
	} else {
		$('main').removeClass('show-main');
	}

	// Render Create page
	if (store.adding) {
		$('main').addClass('show-main');
		$('main').html(generateCreateOrUpdateForm());
	}

	// Render edit page
	if (store.edit) {
		$('main').addClass('show-main');
		$('main').html(generateCreateOrUpdateForm(store.editingID));
	}

	// Call render gold star
	renderGoldStar();
};

/* *****************************
    Create And Update Bookmark
*********************************/
const addBookmarkToDatabaseAndStore = function(bookmark) {
	api
		.createbookmark(bookmark)
		.then(newBookmark => {
			store.addBookmark(newBookmark);
			render();
		})
		.catch(error => {
			store.setError(error.message);
			renderError();
		});
};

const updateBookmarkInDatabaseAndStore = (id, bookmark) => {
	api
		.updateBookmark(id, bookmark)
		.then(() => {
			store.findAndUpdate(store.editingID, JSON.parse(bookmark));
			store.editingID = null;
			render();
		})
		.catch(error => {
			store.setError(error.message);

			renderError();
		});
};

$.fn.extend({
	serializeJson: function() {
		const formData = new FormData(this[0]);
		const bookmark = {};
		formData.forEach((val, name) => (bookmark[name] = val));
		return JSON.stringify(bookmark);
	}
});

// Handle form submission
const handleCreateOrUpdateBookmarkSubmit = () => {
	$('main').on('submit', '#input-form', function(e) {
		event.preventDefault();
		const newBookmark = $(e.target).serializeJson();

		store.editingID
			? updateBookmarkInDatabaseAndStore(store.editingID, newBookmark)
			: addBookmarkToDatabaseAndStore(newBookmark);

		store.adding = false;
		store.edit = false;
		render();
	});
};

// Handle Form Cancel
const handleCreateOrUpdateBookmarkCancel = () => {
	$('main').on('click', '#cancel', function(e) {
		event.preventDefault();
		store.adding = false;
		store.edit = false;
		render();
	});
};

/* **********************************
			Handle Form Generations
*************************************/
const getBookmarkIdFromElement = bookmark => {
	return $(bookmark)
		.closest('.bookmark')
		.attr('id');
};

const handlegenerateBokmarkForm = () => {
	$('header').on('click', '.btn-new', () => {
		store.adding = true;
		render();
	});
};

const handleUpdateBookmarkForm = () => {
	$('main').on('click', '.fa-edit', e => {
		e.preventDefault();
		let id = getBookmarkIdFromElement(e.target);

		store.edit = true;
		store.editingID = id;
		render();
	});
};

const handleDeleteBookmarkClicked = function() {
	$('main').on('click', '.fa-trash-alt', e => {
		const id = getBookmarkIdFromElement(e.currentTarget);

		api
			.deleteBookmark(id)
			.then(() => {
				store.findAndDelete(id);
				render();
			})
			.catch(error => {
				store.setError(error.message);
				//renderError();
			});
	});
};

/* *****************************
      Filter By Rating
*********************************/
const handleFilterByRating = () => {
	$('header').on('change', '#filter', e => {
		e.preventDefault();
		store.filter = $(e.target).val();
		render();
	});
};

/* *****************************
      Toggle Description
*********************************/
const toggleDescription = () => {
	$('main').on('click', '.more', e => {
		e.preventDefault();
		let id = $(e.target)
			.closest('.bookmark')
			.attr('id');

		const bookmark = store.findById(id);
		bookmark.expanded = !bookmark.expanded;
		render();
	});
};

const bindEventListeners = () => {
	handleCreateOrUpdateBookmarkSubmit();
	handleCreateOrUpdateBookmarkCancel();
	handlegenerateBokmarkForm();
	handleUpdateBookmarkForm();
	handleDeleteBookmarkClicked();
	handleFilterByRating();
	toggleDescription();
	handleCloseError();
};

export default {
	render,
	bindEventListeners
};
