const API_KEY = 'AIzaSyAsTfYFL0isLr9pppKSaz9IMQ16MnUB1YA';
const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4",
	"https://www.googleapis.com/drive/v3/drives?q=mimeType='application/vnd.google-apps.spreadsheet'"];

function onGAPILoad() {
	gapi.client.init({
		apiKey: API_KEY,
		discoveryDocs: DISCOVERY_DOCS
	});
}

chrome.extension.onMessage.addListener(
	function(request, sender, sendResponse) {
		// Get the token
		chrome.identity.getAuthToken({interactive: true},  function(token) {
			// Set GAPI auth token
			gapi.auth.setToken({
				'access_token': token,
			});

			if(request.message === "loadMySheet"){
				const pageToken = request.pageToken || "";
				fetch(`https://www.googleapis.com/drive/v3/files?corpora=user&pageSize=10&q=mimeType='application/vnd.google-apps.spreadsheet' and 'me' in owners&key=${API_KEY}&pageToken=${pageToken}`, {
						headers: {Authorization: `Bearer ${token}`}
					})
					.then(res => res.json())
					.then(res => {
						//console.log(res);
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
					sendResponse(response.result.error.code);
				});

			} else if(request.message === 'createSheet'){
				fetch(`https://sheets.googleapis.com/v4/spreadsheets/${request.sheetInfo.SPREADSHEET_ID}:batchUpdate`, {
					method: 'POST',
					headers: {Authorization: `Bearer ${token}`},
					body: JSON.stringify({
						"requests": [
							{
								"addSheet": {
									"properties": {
										"title": request.sheetInfo.SPREADSHEET_TAB_NAME,
										"gridProperties": {
											"columnCount": 5
										},
										"tabColor": {
											"red": 1.0
										}
									}
								}
							}
						]
					})
				}).then((res) => {
					const body = {values: [[
							'thumbnails', // thumbnails
							'Timestamp',
							'title', // Page title
							'url', // Page URl
							'Description'  // user disc
						]]};

					gapi.client.sheets.spreadsheets.values.append({
						spreadsheetId: request.sheetInfo.SPREADSHEET_ID,
						range: request.sheetInfo.SPREADSHEET_TAB_NAME,
						valueInputOption: 'USER_ENTERED',
						resource: body
					}).then((response) => {
						sendResponse(response);
					})
				})


			}else if(request.message === 'typeYoutubeSheetUpdate') {
				// Append values to the spreadsheet
				gapi.client.sheets.spreadsheets.values.append({
					spreadsheetId: request.youtubeSheetInfo.SPREADSHEET_ID,
					range: request.youtubeSheetInfo.SPREADSHEET_TAB_NAME,
					valueInputOption: 'USER_ENTERED',
					resource: request.data
				}).then(async (response) => {
					// On success

					try {
						await updateSheetStyle(request, token);
						sendResponse(response.result);
						//console.log(response.result)
						//console.log(`${response.result.updates.updatedCells} cells appended.`)
					}catch (e){
						console.log(e);
					}


				});

			}else if (request.message === 'typeNormalSheetUpdate'){
				gapi.client.sheets.spreadsheets.values.append({
					spreadsheetId: request.sheetInfo.SPREADSHEET_ID,
					range: request.sheetInfo.SPREADSHEET_TAB_NAME,
					valueInputOption: 'USER_ENTERED',
					resource: request.data
				}).then((response) => {
					// On success
					/*fetch(`https://sheets.googleapis.com/v4/spreadsheets/${request.sheetInfo.SPREADSHEET_ID}:batchUpdate`, {
						method: 'POST',
						headers: {Authorization: `Bearer ${token}`},
						body: JSON.stringify({
							"requests": [
								{
									"autoResizeDimensions": {
										"dimensions": {
											"sheetId": request.sheetInfo.SPREADSHEET_TAB_ID,
											"dimension": "COLUMNS"
										}
									}
								}
							]
						})
					}).then((res) => {return res.json()})*/

					sendResponse(response.result);
					console.log(`${response.result.updates.updatedCells} cells appended.`)
				});
			}else if(request.message === 'getYoutubeInfo'){
				const youtubeId = request.youtubeId || "";
				fetch(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${youtubeId}&key=${API_KEY}`, {})
					.then(res => res.json())
					.then(res => {
						//console.log(res);
						sendResponse({"resYoutubeInfo" : res });
					});
			}

		})

		// Wait for response
		return true;
	}
);

async function updateSheetStyle(request, token){
	return  fetch(`https://sheets.googleapis.com/v4/spreadsheets/${request.youtubeSheetInfo.SPREADSHEET_ID}:batchUpdate`, {
		method: 'POST',
		headers: {Authorization: `Bearer ${token}`},
		body: JSON.stringify({
			"requests": [
				{
					"updateDimensionProperties": {
						"range": {
							"sheetId": request.youtubeSheetInfo.SPREADSHEET_TAB_ID,
							"dimension": "COLUMNS",
							"startIndex": 0,
							"endIndex": 1
						},"properties": {
							"pixelSize": request.thumbnail.width
						},
						"fields": "pixelSize"
					}
				},
				{
					"updateDimensionProperties": {
						"range": {
							"sheetId": request.youtubeSheetInfo.SPREADSHEET_TAB_ID,
							"dimension": "ROWS",
							"startIndex": 1,
						},
						"properties": {
							"pixelSize": request.thumbnail.height
						},
						"fields": "pixelSize"
					}
				},
				/*{
					"autoResizeDimensions": {
						"dimensions": {
							"sheetId": request.youtubeSheetInfo.SPREADSHEET_TAB_ID,
							"dimension": "COLUMNS"
						}
					}
				}*/
			]
		})
	})
	.then((res) => {return res.json()})
}
