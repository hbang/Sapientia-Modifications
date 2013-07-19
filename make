#!/bin/bash
rsync -a "$(dirname "$0")" ~/Library/Containers/com.codeux.irc.textual/Data/Library/Application\ Support/Textual\ IRC/Styles/Sapientia\ Modifications --exclude ".git" --exclude ".DS_Store" --exclude "._*" \
	&& echo "Theme installed. Use Textual's style preferences to enable it." \
	|| echo "Error $?"
