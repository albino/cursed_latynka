(function() {
	document.querySelectorAll(".mode_radio")
	.forEach(function(button) {
		button.onclick = function(ev) {
			browser.storage.sync.set({
				mode: ev.target.value
			});
			browser.tabs.query({}).then(function(tabs) {
				for (const tab of tabs) {
					browser.tabs
					.sendMessage(tab.id, ev.target.value);
				}
			});
		}
	});


})();
