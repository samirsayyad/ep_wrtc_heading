
const settings = {
	VIDEO_CHAT_LIMIT: 2,
	TEXT_CHAT_KEY: "WRTC:TEXT:",
	TEXT_CHAT_LIMIT: 70,
	INLINE_AVATAR_LIMIT: 6,
	VIDEO_CODEC: "VP9",
	AUDIO_CODEC: "OPUS",
}

const update = (key, val) => {
	if(!settings[key]) return false;
	settings[key] = val;
	return val
}

const get = key => {
	if(!settings[key]) return false;
	return settings[key]
}

module.exports = {
	update, 
	get
}
