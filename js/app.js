const updateSheetBtn = document.getElementById("sheetUpdateBtn");
const createNewSheet = document.getElementById("addSheetBtn");
let $myInnerSheetSelectBox = $("#myInnerSheet");
let $mySheetSelectBox = $("#mySheet");

document.onload = (() => {
	console.log("onload...");
	$('#overlay').fadeIn();

	chrome.runtime.sendMessage({"message":"loadMySheet"}, (response)=> {
		//console.log("app.js response list :: ", response)
		let sheetPage = response.mySheet.files;
		sheetPage.forEach((sheet) =>{
			$mySheetSelectBox.append(`<option value=${sheet.id}>${sheet.name}</option>`)
		});
		$mySheetSelectBox.niceSelect();
		$('#overlay').fadeOut();

	});

	$mySheetSelectBox.on("change",function (){
		const sheetId = $(this).val();
		console.log(sheetId);
		$("#addSheetInput").val("");

		if(sheetId !== "0"){
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
			$("#sheetUpdateBtn").prop("disabled", false);
			$("#newSheetColl").addClass("badge-danger").removeClass("badge-dark d-none");
			$("#actionBlock").removeClass("d-none");

		}else {

			$myInnerSheetSelectBox.empty();
			$myInnerSheetSelectBox.append(`<option data-display="Select" value="0" disabled>Nothing</option>`)

			$myInnerSheetSelectBox.niceSelect('destroy').niceSelect();
			$("#innerSheetRow").find("span.current").text("Nothing");
			$("#sheetUpdateBtn").prop("disabled", true);
			$("#newSheetColl").addClass("badge-dark").removeClass("badge-danger d-none");
			$("#actionBlock").addClass("d-none");
		}
	});


	$myInnerSheetSelectBox.on("click", function (){
		$myInnerSheetSelectBox.niceSelect('destroy').niceSelect();
	})
})();


$('#collapseExample').on('hidden.bs.collapse', function () {
	// do something…
	$("#actionBlock").removeClass("d-none");
});

$('#collapseExample').on('shown.bs.collapse', function () {
	// do something…
	$("#actionBlock").addClass("d-none");
})


createNewSheet.addEventListener("click", function (){
	$('#overlay').fadeIn();
	const spreadSheetId = $("#mySheet").val();
	const tabName = $("#addSheetInput").val();
	const sheetInfo ={
		SPREADSHEET_ID :  spreadSheetId,
		SPREADSHEET_TAB_NAME : tabName
	};
	$("#collapseExample").collapse('hide');

	//console.log(" sheet new create :: ",sheetInfo)
	/*chrome.runtime.sendMessage({"sheetInfo": sheetInfo ,"message":"createSheet"}, (response)=>{
		if(response.status === 200){
			alert(`Create a new sheet success !`);
			$mySheetSelectBox.trigger("change");
			$("#newSheetColl").collapse('hide');

		}
		$('#overlay').fadeOut();
		//console.log(`app.js response`, response);
	})*/
	$('#overlay').fadeOut();
});


updateSheetBtn.addEventListener("click", (e)=>{
	const markType = $("fieldset").find("input:radio:checked").val();
	const spreadSheetId = $("#mySheet").val();
	const tabName = $("#myInnerSheet option:selected").text();
	const tabId = $("#myInnerSheet option:selected").val();
	const sheetInfo = {
		SPREADSHEET_ID :  spreadSheetId,
		SPREADSHEET_TAB_NAME : tabName,
		SPREADSHEET_TAB_ID : tabId
	};

	switch (markType){
		case "youtube":
			$('#overlay').fadeIn().delay(300);
			youtubeProcess(sheetInfo).then(function (){
				$('#overlay').fadeOut();
				$("#desc").val("");
			});
			break;
		case "normal":
			normalProcess(sheetInfo).then(()=>{
				$('#overlay').fadeOut();
				$("#desc").val("");
			});
			break;
	}

})



function checkYoutube(url){
	return  url.indexOf("youtube.com/watch") !== -1;
}

async function youtubeProcess(sheetInfo){
	const curretTab = await getCurrentTab();
	const myDesc = $("#desc").val();
	console.log("youtube Process...");
	if(checkYoutube(curretTab.url)){
		const youtubeId = new URL(curretTab.url).searchParams.get("v");
		chrome.runtime.sendMessage({"youtubeId": youtubeId ,"message":"getYoutubeInfo"}, (response)=> {
			let youtubeInfo = response.resYoutubeInfo.items[0].snippet;
			console.log(youtubeInfo);
			const thumbnail = {"height":youtubeInfo.thumbnails.medium.height, "width" :youtubeInfo.thumbnails.medium.width}
			const body = {values: [[
					`=IMAGE("${youtubeInfo.thumbnails.medium.url}", 4, ${youtubeInfo.thumbnails.medium.height}, ${youtubeInfo.thumbnails.medium.width} )`, // thumbnails
					new Date(), // Timestamp
					youtubeInfo.title, // Page title
					curretTab.url, // Page URl
					myDesc  // user disc
				]]};
			youtubeInfo.currentUrl = curretTab.url;
			chrome.runtime.sendMessage({"data" : body,"thumbnail" :thumbnail , "youtubeSheetInfo": sheetInfo ,"message":"typeYoutubeSheetUpdate"}, (response)=>{
				alert(`${response.updates.updatedRange} update success !`)
				//console.log(`app.js response`, response)
			})
		});
	}else {
		alert("not youtube watch");
	}
}

async function normalProcess(sheetInfo){
	const curretTab = await getCurrentTab();
	const myDesc = $("#desc").val();
	console.log("normal Process...");

	const body = {values: [[
			'',
			new Date(), // Timestamp
			 curretTab.title,  // Page title
			 curretTab.url, // Page URl
			myDesc  // user disc
		]]};

	chrome.runtime.sendMessage({"data" : body, "sheetInfo": sheetInfo ,"message":"typeNormalSheetUpdate"}, (response)=>{
		alert(`${response.updates.updatedRange} update success !`)
		//console.log(`app.js response`, response);
	})


}

function getCurrentTab(){
	return new Promise(function (resolve, reject){
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			let activeTab = tabs[0];
			resolve(activeTab);
		});
	})
}
