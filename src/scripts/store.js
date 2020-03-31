const bookmarks = [];
const adding = false;
const edit = false;
const editingID = null;
const error = null;
const filter = 0;

function findById(id) {
	return this.bookmarks.find(bookmark => bookmark.id === id);
}

function addBookmark(bookmark) {
	this.bookmarks.push(bookmark);
}

function findAndUpdate(id, newData) {
	const currentItem = this.findById(id);
	Object.assign(currentItem, newData);
}

function findAndDelete(id) {
	this.bookmarks = this.bookmarks.filter(bookmark => bookmark.id !== id);
}

function filterByRating(rating) {
	const newBookmarks = this.bookmarks.filter(
		bookmark => bookmark.rating >= rating
	);
	return newBookmarks;
}

function setError(error) {
	this.error = error;
}

export default {
	bookmarks,
	adding,
	edit,
	editingID,
	filter,
	findById,
	addBookmark,
	findAndUpdate,
	findAndDelete,
	filterByRating,
	error,
	setError
};
