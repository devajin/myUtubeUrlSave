const updateSheetBtn = document.getElementById("sheetUpdateBtn");

document.onload = (() => {
	console.log("onload...");
	$('#overlay').fadeIn();
	let $myInnerSheetSelectBox = $("#myInnerSheet");
	let $mySheetSelectBox = $("#mySheet");
	chrome.runtime.sendMessage({"message":"loadMySheet"}, (response)=> {
		console.log("app.js response list :: ", response)
		let sheetPage = response.mySheet.files;
		sheetPage.forEach((sheet) =>{
			$mySheetSelectBox.append(`<option value=${sheet.id}>${sheet.name}</option>`)
		});
		$mySheetSelectBox.niceSelect();
		$('#overlay').fadeOut()

	});

	$mySheetSelectBox.on("change",function (){
		const sheetId = $(this).val();
		if(sheetId !== "Nothing"){
			$('#overlay').fadeIn();
			chrome.runtime.sendMessage({"sheetId": sheetId ,"message":"getSheets"}, (response)=> {
				let sheetArray = response;
				$myInnerSheetSelectBox.empty();
				sheetArray.forEach((sheet) =>{
					$myInnerSheetSelectBox.append(`<option value=${sheet.properties.sheetId}>${sheet.properties.title}</option>`)
				});
				$myInnerSheetSelectBox.niceSelect('destroy').niceSelect();  // TODO : 이부분 변경해야 함 두번 호출됨 ;;
				$('#overlay').fadeOut();
			});
		}else {
			$myInnerSheetSelectBox.empty();
			$myInnerSheetSelectBox.append(`<option data-display="Select" value="0" disabled>Nothing</option>`)


			$myInnerSheetSelectBox.niceSelect('destroy').niceSelect();
			$("#innerSheetRow").find("span.current").text("Nothing");
		}
	});


	$myInnerSheetSelectBox.on("click", function (){
		$myInnerSheetSelectBox.niceSelect('destroy').niceSelect();
	})
})();



updateSheetBtn.addEventListener("click", (e)=>{
	const markType = $("fieldset").find("input:radio:checked").val();
	const spreadSheetId = $("#mySheet").val();
	const tabName = $("#myInnerSheet option:selected").text();
	const sheetInfo = {
		SPREADSHEET_ID :  spreadSheetId,
		SPREADSHEET_TAB_NAME : tabName
	};

	switch (markType){
		case "youtube":
			console.log("type youtube...")
			$('#overlay').fadeIn().delay(300);
			youtubeProcess(sheetInfo).then(function (){
				$('#overlay').fadeOut();
			});
			break;
		case "normal":
			normalProcess(sheetInfo);
			break;
	}
	//chrome.runtime.sendMessage({"data" : data, "message":"sheetUpdate"}, (response)=>console.log(`app.js response`, response))
})

$()


function checkYoutube(url){
	return  url.indexOf("youtube.com/watch") !== -1;
}

async function youtubeProcess(sheetInfo){
	const curretTabUrl = await getCurrentTabUrl();
	const myDesc = $("#desc").val();
	console.log("youtubeProcess...");
	if(checkYoutube(curretTabUrl)){
		const youtubeId = new URL(curretTabUrl).searchParams.get("v");
		chrome.runtime.sendMessage({"youtubeId": youtubeId ,"message":"getYoutubeInfo"}, (response)=> {
			let youtubeInfo = response.resYoutubeInfo.items[0].snippet;
			const body = {values: [[
					new Date(), // Timestamp
					youtubeInfo.title, // Page title
					`=IMAGE("${youtubeInfo.thumbnails.medium.url}")`, // thumbnails
					curretTabUrl, // Page URl
					myDesc  // user disc
				]]};
			youtubeInfo.currentUrl = curretTabUrl;
			chrome.runtime.sendMessage({"data" : body, "youtubeSheetInfo": sheetInfo ,"message":"sheetUpdate"}, (response)=>console.log(`app.js response`, response))
		});
	}else {
		alert("not youtube watch");
	}
}

function normalProcess(){
	const curretTabUrl = getCurrentTabUrl();
}

function getCurrentTabUrl(){
	return new Promise(function (resolve, reject){
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			let activeTab = tabs[0];
			resolve(activeTab.url);
		});
	})
}
