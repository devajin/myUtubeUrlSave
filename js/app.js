
window.onload = function() {
	document.querySelector('button').addEventListener('click', function() {
		chrome.identity.getAuthToken({interactive: true}, function(token) {

		});
	});

	const API_KEY = 'AIzaSyAsTfYFL0isLr9pppKSaz9IMQ16MnUB1YA';
	const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

	function onGAPILoad() {
		gapi.client.init({
			// Don't pass client nor scope as these will init auth2, which we don't want
			apiKey: API_KEY,
			discoveryDocs: DISCOVERY_DOCS,
		}).then(function () {
			console.log(thisToken);
			console.log('gapi initialized')
			chrome.identity.getAuthToken({interactive: true}, function(token) {
				console.log(token)
				gapi.auth.setToken({
					'access_token': token,
				});

			})
		}, function(error) {
			console.log('error', error)
		});
	};
	onGAPILoad();
};
