// CONFIG file for MyPhotos Client side
// 1) Create a copy / rename to config.js
// 2) Specify below variables as per requested

Config = {
	// Google Analytics Client ID (format UA-XXXX-Y) or false to disable it
	ga_client_id: false,
	// log level, can be 1 for production, 2 for network, 3 for logging, 4 for debug
	log_level: 	1,
	// language, can be auto (navigator.language) or any language code (http://www.metamodpro.com/browser-language-codes)
	language: 'auto',
	// fallback language in case translation is not found
	fallback_language: 'en',
	// default album sorting, can be title_asc/modified_desc/modified_asc
	default_album_sort: 'modified_desc'
};