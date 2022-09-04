'use strict';

let mode = 0;
let interval;

const dicts = [
	// mode 0 - disabled
	{},
	// mode 1 - cursed
	{
		"й": "i",
		"ц": "c",
		"у": "u",
		"к": "k",
		"е": "e",
		"н": "n",
		"г": "g",
		"ш": "š",
		"щ": "šč",
		"з": "z",
		"х": "x",
		"ї": "ıı",
		"ф": "f",
		"і": "ı",
		"в": "w",
		"а": "a",
		"п": "p",
		"р": "r",
		"о": "o",
		"л": "l",
		"д": "d",
		"ж": "j",
		"є": "ë",
		"ґ": "h",
		"я": "ä",
		"ч": "č",
		"с": "s",
		"м": "m",
		"и": "y",
		"т": "t",
		"ь": "`",
		"б": "b",
		"ю": "ü"
	},
	// mode 2 - extra cursed
	{
		// really cursed hack
		"_(?<=[йцукенгшщзфівапролджєхїґячсмитьбю])'(?=[йцукенгшщзфівапролджєхїґячсмитьбю])": "•",
		"_ь(?= )": "~",
		"_ь$": "~",
		"й": "i",
		"ц": "ç",
		"у": "u",
		"к": "k",
		"е": "e",
		"н": "n",
		"г": "g",
		"ш": "š",
		"щ": "šč",
		"з": "z",
		"х": "x",
		"ї": "ıı",
		"ф": "f",
		"і": "ı",
		"в": "w",
		"а": "a",
		"п": "p",
		"р": "r",
		"о": "o",
		"л": "l",
		"д": "d",
		"ж": "j",
		"є": "ë",
		"ґ": "h",
		"я": "ä",
		"ч": "č",
		"с": "c",
		"м": "m",
		"и": "y",
		"т": "t",
		"ь": "ö",
		"б": "b",
		"ю": "ü"
	},
	// mode 3 - polish
	{
		"й": "j",
		"ц": "c",
		"у": "u",
		"к": "k",
		"е": "e",
		"н": "n",
		"г": "h",
		"ш": "š",
		"щ": "šč",
		"з": "z",
		"х": "x",
		"ї": "ji",
		"ф": "f",
		"і": "i",
		"в": "w",
		"а": "a",
		"п": "p",
		"р": "r",
		"о": "o",
		"л": "l",
		"д": "d",
		"ж": "ž",
		"є": "je",
		"ґ": "g",
		"я": "ja",
		"ч": "č",
		"с": "s",
		"м": "m",
		"и": "y",
		"т": "t",
		"ь": "'",
		"б": "b",
		"ю": "ju"
	}
];

function convert(kir) {
	for (const [k, l] of Object.entries(dicts[mode])) {
		if (k.startsWith("_")) {
			let search = RegExp(k.substring(1), "gi");
			kir = kir.replaceAll(search, l);
			continue;
		}

		kir = kir.replaceAll(k, l);
		kir = kir.replaceAll(k.toUpperCase(), l.toUpperCase());
	}

	return kir;
}

function getCpos(el) {
	let cpos = 0;
	const sel = window.getSelection();
	
	if (sel.rangeCount) {
		const range = sel.getRangeAt(0);
		
		if (range.commonAncestorContainer.parentNode == el) {
			cpos = range.endOffset;
		}
	}
		
	return cpos;
}

function setCpos(el, cpos) {
	const range = document.createRange();
	const sel = window.getSelection();
	
	range.setStart(el.childNodes[0], cpos);
	range.collapse(true);
	
	sel.removeAllRanges();
	sel.addRange(range);
}

function scanDocument(doc) {
	const tw = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
	while (tw.nextNode()) {
		const node = tw.currentNode;

		for (const [k, l] of Object.entries(dicts[mode])) {
			// Only run the function if the node contains some eligible chars
			if (node.textContent.includes(k)) {
				let cpos = 0;
				const isEditable = node.parentNode.isContentEditable;

				if (isEditable) {
					cpos = getCpos(node.parentNode);
				}

				node.textContent = convert(node.textContent);

				if (isEditable) {
					setCpos(node.parentNode, cpos);
				}
				
				continue;
			}
		}
	}
}

function setMode(newMode) {
	mode = parseInt(newMode);

	if (mode === 0) {
		if (interval !== null) {
			window.clearInterval(interval);
		}
		return;
	}

	interval = window.setInterval((function() {
		scanDocument(document);
	}), 500);

	scanDocument(document);
}

(function() {
	// NB: race condition, but not a big deal
	browser.runtime.onMessage.addListener(setMode);

	let gettingMode = browser.storage.sync.get("mode");
	gettingMode.then(function(obj) {
		setMode(obj.mode);
	});
})();
