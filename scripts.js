"use strict";

/* https://github.com/kirbylover4000/irccloud-colornicks (based on https://github.com/avidal/irccloud-colornicks (based on http://userscripts.org/scripts/show/88258 (based on http://chatlogs.musicbrainz.org/mb_chatlogger.user.js))) */

var colorNicks = {
	css: document.createElement("style"),

	cache: localStorage.colorNicks ? JSON.parse(localStorage.colorNicks) : {},

	cleanNick: function(nick) {
		// attempts to clean up a nickname
		// by removing alternate characters from the end
		// nc_ becomes nc, avidal` becomes avidal

		nick = nick.toLowerCase();

		// typically ` and _ are used on the end alone
		nick = nick.replace(/[`_]+$/, '');

		// remove |<anything> from the end
		nick = nick.replace(/\|.*$/, '');

		// remove [<anything>] or {<anything>} from the end
		nick = nick.replace(/^(!\[|!\{)(.*)(\[.*\]|\{.*\})$/, '$2');

		return nick;
	},

	getHash: function(nick) {
		var cleaned = colorNicks.cleanNick(nick), hash = 0;

		for(var i = 0; i < cleaned.length; i++) {
			hash = cleaned.charCodeAt(i) + (hash << 6) + (hash << 16) - hash;
		}

		return hash;
	},

	getColor: function(nick) {
		var nickHash = colorNicks.getHash(nick);

		// get a positive value for the hue
		var deg = nickHash % 360, h = deg < 0 ? 360 + deg : deg;

		// default L is 50
		var l = 50;

		// half of the hues are too light, for those we
		// decrease lightness
		if (h >= 30 && h <= 210) {
			l = 30;
		}

		// keep saturation above 20
		var s = 20 + Math.abs(nickHash) % 80;

		return "hsl(" + h + ", " + s + "%, " + l + "%)";
	},

	addNick: function(nick) {
		if (nick in colorNicks.cache) {
			return;
		}

		var color = colorNicks.getColor(nick);

		colorNicks.cache[nick] = color;
		localStorage.colorNicks = JSON.stringify(colorNicks.cache);

		colorNicks._addCSS(nick, color);
	},

	viewFinishedLoading: function() {
		for (var nick in colorNicks.cache) {
			colorNicks._addCSS(nick, colorNicks.cache[nick]);
		}

		document.body.appendChild(colorNicks.css);
	},

	_addCSS: function(nick, color) {
		colorNicks.css.textContent += ".sender[nick='" + nick + "'], .inline_nickname[nick='" + nick + "'] { color: " + color + " !important; }";
	}
};


/* Defined in: "Textual.app -> Contents -> Resources -> JavaScript -> API -> core.js" */

Textual.viewFinishedLoading = function() {
	colorNicks.viewFinishedLoading();

	Textual.fadeInLoadingScreen(1.00, 0.95);

	setTimeout(function() {
		Textual.scrollToBottomOfView();
	}, 500);
};

Textual.viewFinishedReload = function() {
	Textual.viewFinishedLoading();
};

Textual.newMessagePostedToView = function(lineId) {
	var currentLine = document.getElementById("line-" + lineId);

	if (!currentLine) {
		return;
	}

	var nicks = currentLine.querySelectorAll(".sender, .message .inline_nickname");

	if (!nicks) {
		return;
	}

	[].forEach.call(nicks, function(element) {
		var nick;

		if (element.className == "inline_nickname") {
			nick = element.innerText;
			element.setAttribute("nick", element.innerText);
		} else {
			nick = element.getAttribute("nick");
		}

		if (nick) {
			colorNicks.addNick(nick);
		}
	});
};
