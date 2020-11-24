const API_KEY = 'AIzaSyAsTfYFL0isLr9pppKSaz9IMQ16MnUB1YA';
const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4",
	"https://www.googleapis.com/drive/v3/drives?q=mimeType='application/vnd.google-apps.spreadsheet'"];
const SPREADSHEET_ID = '1HVzgXTbqBG5NKwvu1JeroUJwnHlVmhr9vbwBXpygZng';
const SPREADSHEET_TAB_NAME = 'main';


function onGAPILoad() {
	gapi.client.init({
		apiKey: API_KEY,
		discoveryDocs: DISCOVERY_DOCS
	});

}

chrome.extension.onMessage.addListener(
	function(request, sender, sendResponse) {
		// Get the token
		chrome.identity.getAuthToken({interactive: true}, function(token) {
			// Set GAPI auth token
			gapi.auth.setToken({
				'access_token': token,
			});

			if(request.message === "loadMySheet"){
				const pageToken = request.pageToken || "";
				fetch(`https://www.googleapis.com/drive/v3/files?corpora=user&pageSize=10&q=mimeType='application/vnd.google-apps.spreadsheet'&key=${API_KEY}&pageToken=${pageToken}`, {
						headers: {Authorization: `Bearer ${token}`}
					})
					.then(res => res.json())
					.then(res => {
						console.log(res);
						sendResponse({"mySheet" : res });
					});
			}
			if(request.message === "getSheets"){
				const sheetId = request.sheetId;
				gapi.client.sheets.spreadsheets.get({
					spreadsheetId: sheetId
				}).then(function(response) {
					sendResponse(response.result.sheets)
				}, function(response) {
					console.log('Error: ' + response.result.error.message);
				});

			} else if(request.message === 'createSheet'){
				console.log(`sendResponse : > ${sendResponse}`);
				gapi.client.sheets.spreadsheets.create({
					properties: {
						title: title
					}
				}).then((response) => {
					console.log(response)
				});


			}else if(request.message === 'sheetUpdate'){
				const body = {values: [[
						new Date(), // Timestamp
						request.data.title, // Page title
						request.data.url, // Page URl
					]]};
				console.log(body);

				// Append values to the spreadsheet
				gapi.client.sheets.spreadsheets.values.append({
					spreadsheetId: SPREADSHEET_ID,
					range: SPREADSHEET_TAB_NAME,
					valueInputOption: 'USER_ENTERED',
					resource: body
				}).then((response) => {
					// On success
					console.log(`${response.result.updates.updatedCells} cells appended.`)
					sendResponse({success: true});
				});
			}

		})

		// Wait for response
		return true;
	}
);