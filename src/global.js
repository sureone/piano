export const SIGNATURE = {
	//https://wenku.baidu.com/view/9c39492c4693daef5ff73d77.html
	//五线谱调号的识别
	"C":{
		"audio-index":[0, 2, 4, 5, 7, 9, 11],
	},
	//一个#   F#
	"#":{
		"audio-index":[0, 2, 4, 6, 7, 9, 11],
	},
	//一个b   Fb
	"b":{
		"audio-index":[0, 2, 4, 4, 7, 9, 11],
	},
	//2个b   Bb,Eb
	"bb":{
		"audio-index":[0, 2, 3, 5, 7, 9, 10],
	},

	//2个#   F#,C#
	"##":{
		"audio-index":[1, 2, 4, 6, 7, 9, 11],
	},

	//3个b   Bb,Eb,Ab
	"bbb":{
		"audio-index":[1, 2, 3, 6, 7, 8, 10],
	},
	//3个#   F#,C#,G#
	"###":{
		"audio-index":[1, 2, 4, 6, 8, 9, 11],
	},
};