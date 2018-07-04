
import {notes} from './notes.js'

export const SIGNATURE = {
	//https://wenku.baidu.com/view/9c39492c4693daef5ff73d77.html
	//五线谱调号的识别
	"C":{
		"audio-index":[0, 2, 4, 5, 7, 9, 11],
	},
	//一个#   F#
	"#":{
		"audio-index":[7, 9, 11,13,14,16,18],
	},
	//一个b   Fb
	"b":{
		"audio-index":[5, 7, 9, 10, 12 , 14, 16],
	},
	
	//2个b   Bb,Eb
	"bb":{
		"audio-index":[-1,1,2,4,6,8,9],
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


function isDigit(value) {
    var patrn = /^[0-9]*$/;
    if (patrn.exec(value) == null || value == "") {
        return false
    } else {
        return true
    }
}

export class Song{
	constructor(tracks,meter_time){
		this.tracks = [];
		tracks.forEach((item,index)=>{
		    this.tracks.push (new Track(item,meter_time))
		})
		
		this.meter_time = meter_time;

	}
	play(){
		this.tracks.forEach((item,index)=>{
		    item.play();
		})
	}
}

export class Track{ //类
    //为对象添加属性
    constructor(spectrum,meter_time){ //给参数传默认值，防止调用时忘记传实参而报错
        this.spectrum=spectrum;
        this.position=0;
        this.meter_time = meter_time;
        this.key_signature = "C";
		this.last_meter= 1;
		this.groupKeys= 12;
		this.base = 0;
		this.prefix = 'data:audio/mpeg;base64,';
		this.keys = ['C','D','E','F','G','A','B'];

    }

    //keys 组合key
    playKeys(keys,meter){

    	keys.forEach((key,index)=>{
    		this.playSingleKey(key.code,key.group,meter,key.sjd);
    	})

    	setTimeout(()=>{this.play()},parseInt(this.meter_time*meter));
    }
    //key 音符  group 音组  meter 拍数,sjd 升降调
    playSingleKey(key,group,meter,sjd){
        
    	console.log("play key="+ key+group+",meter="+meter+",sjd="+sjd);
        if(key=='S'){
            //休止符
            setTimeout(()=>{this.play()},parseInt(this.meter_time*meter));
            return;

        }
       
        //console.log(SIGNATURE[this.key_signature]);
        let whites = SIGNATURE[this.key_signature]["audio-index"];
        group = group+this.base;
        console.log("audio index="+(this.keys.indexOf(key) % 7));
        let index =  group*this.groupKeys + whites[this.keys.indexOf(key) % 7]+sjd;
        console.log("audio index="+index);


        let audio = new Audio(this.prefix + notes[index]);
        audio.play();

        

    }
    play(){

        if(this.position==-1) return;

        if(this.position>=this.spectrum.length){

            this.position = -1;
            return;
        }

        let c = this.spectrum.charAt(this.position);
        if(c=='{'){
            let cc=[];
            this.position = this.position + 1;
            while(c!='}' && this.position<this.spectrum.length){
                c = this.spectrum.charAt(this.position);
                this.position = this.position + 1;
                if(c!='}') cc.push(c);

            }

            this.key_signature = cc.join("");
            console.log("signature: "+this.key_signature)

        }


        //解析key
        let keys=[]
        let key={
        	code:'C',
        	group:'3',
        	sjd:0
        };
        while(this.position<this.spectrum.length){
            c = this.spectrum.charAt(this.position);
            this.position = this.position + 1;
            let group = '3';
	        if (c!='S'){ //休止符没有group
	            group = this.spectrum.charAt(this.position);
	            this.position=this.position+1;
	            if (!isDigit(group)){
	                group='3';
	                this.position--;
	            }

	        }
	        key['code'] = c;
	        key['group'] = parseInt(group);

	        while(this.position<this.spectrum.length){
	        	c = this.spectrum.charAt(this.position);
	        	this.position=this.position+1;
	        	if(c=='b' || c=='#'){
	        		if(c=='b') key['sjd']--;
	        		else key['sjd']++;
	        	}else{
	        		this.position=this.position-1;
	        		break;
	        	}
	        }

	        keys.push(key);

	        c = this.spectrum.charAt(this.position);
	        if(c!='+'){
	        	break;
	        }
	        key={
	        	code:'C',
	        	group:'3',
	        	sjd:0
	        };
	        this.position=this.position+1;

        }
        

        //解析拍数
        c = this.spectrum.charAt(this.position);
        let meter=1;
        if(c=='['){
            let cc = []; 
            this.position = this.position + 1;
            while(c!=']' && this.position<this.spectrum.length){
                c = this.spectrum.charAt(this.position);
                this.position = this.position + 1;
                if(c!=']') cc.push(c);
            }
            meter = parseFloat(cc.join(''));
            this.last_meter = meter;

        }else{

            meter = this.last_meter;

        }
        this.playKeys(keys,meter);
        console.log("------------------");
        


    }
    
};