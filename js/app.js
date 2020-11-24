let createSheetBtn = document.getElementById("sheetUpdateBtn");

document.onload = (() => {
	console.log("onload...");
	chrome.runtime.sendMessage({"message":"loadMySheet"}, (response)=> {
		console.log("app.js response list :: ", response)
		let sheetPage = response.mySheet.files;
		let selectBox = document.getElementById("mySheet");
		sheetPage.forEach((sheet) =>{
			console.log(this);
			$(selectBox).append(`<option value=${sheet.id}>${sheet.name}</option>`)
		});
		$(selectBox).niceSelect();
	})
})();

createSheetBtn.addEventListener("click", (e)=>{
	let data = {};
	console.log(data);
	chrome.runtime.sendMessage({"data" : data, "message":"sheetUpdate"}, (response)=>console.log(`app.js response`, response))
})


