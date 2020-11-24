let createSheetBtn = document.getElementById("sheetUpdateBtn");

document.onload = (() => {
	console.log("onload...");
	let $myInnerSheetSelectBox = $("#myInnerSheet");
	let $mySheetSelectBox = $("#mySheet");
	chrome.runtime.sendMessage({"message":"loadMySheet"}, (response)=> {
		console.log("app.js response list :: ", response)
		let sheetPage = response.mySheet.files;
		sheetPage.forEach((sheet) =>{
			$mySheetSelectBox.append(`<option value=${sheet.id}>${sheet.name}</option>`)
		});
		$mySheetSelectBox.niceSelect();

	});

	$mySheetSelectBox.on("change",  function (){
		const sheetId = $(this).val();
		chrome.runtime.sendMessage({"sheetId": sheetId ,"message":"getSheets"}, (response)=> {
			let innerSheets = response;
			console.log($myInnerSheetSelectBox);
			$myInnerSheetSelectBox.empty();
			innerSheets.forEach((sheet) =>{
				console.log(sheet);
				$myInnerSheetSelectBox.append(`<option value=${ sheet.properties.sheetId}>${sheet.properties.title}</option>`)
			})
			$myInnerSheetSelectBox.niceSelect('destroy').niceSelect();
		});
	});
	$myInnerSheetSelectBox.on("click", function (){
		$myInnerSheetSelectBox.niceSelect('destroy').niceSelect();
	})



})();

createSheetBtn.addEventListener("click", (e)=>{
	let data = {};
	console.log(data);
	chrome.runtime.sendMessage({"data" : data, "message":"sheetUpdate"}, (response)=>console.log(`app.js response`, response))
})


