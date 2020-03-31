const baseURL = 'https://thinkful-list-api.herokuapp.com/isaac';

const apiFetch = (...args) => {
	let error;
	return fetch(...args)
		.then(res => {
			if (!res.ok) {
				// Valid HTTP response but non-2xx status - let's create an error!
				error = { code: res.status };

				// if response is not JSON type, place statusText in error object and
				// immediately reject promise
				if (!res.headers.get('content-type').includes('json')) {
					error.message = res.statusText;
					return Promise.reject(error);
				}
			}

			// In either case, parse the JSON stream:
			return res.json();
		})
		.then(data => {
			// If error was flagged, reject the Promise with the error object
			if (error) {
				error.message = data.message;
				return Promise.reject(error);
			}

			// Otherwise give back the data as resolved Promise
			return data;
		});
};

const getBookmarks = () => apiFetch(`${baseURL}/bookmarks`);

const createbookmark = bookmark => {
	const newBookmark = bookmark;

	return apiFetch(`${baseURL}/bookmarks`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: newBookmark
	});
};

const updateBookmark = (id, updateData) => {
	const data = updateData;

	return apiFetch(`${baseURL}/bookmarks/${id}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: data
	});
};

const deleteBookmark = id => {
	return apiFetch(`${baseURL}/bookmarks/${id}`, {
		method: 'DELETE'
	});
};

export default {
	getBookmarks,
	createbookmark,
	updateBookmark,
	deleteBookmark
};
