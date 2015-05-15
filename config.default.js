// CONFIG file for MyPhotos Client side
// 1) Create a copy / rename to config.js
// 2) Specify below variables as per requested

Config = {
	// Google Analytics Client ID (format UA-XXXX-Y) or false to disable it
	ga_client_id: false,

	// Level of messages logging, can be:
	// 0 to display only errors (will not display information and success notifications!!!)
	// 1 to display all above + warnings (will not display information and success notifications!!!)
	// 2 to display all above + success & info messages (recommended for production)
	// 3 to display all above + network exchanges in the console (recommended for troubleshooting)
	// 4 to display all above + debug information in the console (recommended for development)
	log_level: 2,

	// language of the user interface, can be:
	// 'auto' to automatically detect the browser's language
	// or any language code (http://www.metamodpro.com/browser-language-codes)
	language: 'auto',

	// fallback language in case translation is not found
	fallback_language: 'en',

	// default album sorting, can be:
	// 'title_asc' to sort albums alphabetically
	// 'modified_desc' to see newest albums on top
	// 'modified_asc' to see oldest albums on top
	default_album_sort: 'modified_desc'
};