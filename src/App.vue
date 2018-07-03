

<template>
    <div id="app">
        <div class="control">
            <input type="checkbox" v-model="full" id="full"><label for="full">完整键盘</label>
            <label for="meter_time">拍长（毫秒）</label><input type="text" v-model="meter_time" id="meter_time">

            <label for="key_signature">调</label>

            <select v-model="key_signature" id="key_signature">
                <option value="C">C</option>
                <option value="b">F (b)</option>
                <option value="#">G (#)</option>
                <option value="bb">Bb (bb)</option>
                <option value="##">D (##)</option>
                <option value="bbb">Eb (bbb)</option>
                <option value="###">A (###)</option>
            </select>
        </div>
        <div class="keyboard">
            <group :group="0" v-show="full"></group>
            <group :group="1" v-show="full"></group>
            <group :group="2"></group>
            <group :group="3"></group>
            <group :group="4"></group>
            <group :group="5" v-show="full"></group>
            <group :group="6" v-show="full"></group>
        </div>
        <div class="spectrum">
            <textarea v-model="spectrum" id="spectrum">
            </textarea>
            <a v-on:click="doPlay">play</a>
        </div>

    </div>
</template>


<script>
var attachFastClick = require('fastclick');
attachFastClick.attach(document.body);
import Group from './components/Group'
const prefix = 'data:audio/mpeg;base64,';
import {notes} from './notes.js'
import {SIGNATURE} from './global.js'
const groupKeys = 12;
const base = 2;
var currentPlayPos=-1;


export default {
    components: {
        Group
    },
    data() {
        return {
            full: false,
            meter_time:400, //一拍时长（毫秒)
            key_signature:"C", //调号
            
            spectrum1:'C3[1]C3[1]G3[1]G3[1]A3[1]A3[1]G3[2]F3[1]F3[1]E3[1]E3[1]D3[1]D3[1]C3[2]',  //小星星
            spectrum2://雪绒花
                '{bb}D3[3]F3[3]E3[3]F3[3]D3[2]F3[1]C4[3]B3[2]F3[1]E3[3]D3[2]D3[2]D3[1]E3[1]F3[1]'+
                'G3[3]F3[3]D3[2]F3[1]C4[3]B3[2]F3[1]E3[3]D3[2]F3[1]F3[1]G3[1]A3[1]B3[3]B3[3]'+
                'B3[0.5]S[3]S[3]F3[0.5]F3[1]A3[1]G3[1]F3[1]D3[2]F3[1]B3[3]G3[2]B3[1]C4[2]B3[1]A3[2]A3[1]F3[3]D3[2]F3[1]'+
                'C4[3]B3[2]F3[1]E3[3]D3[2]F3[1]F3[1]G3[1]A3[1]B3[3]B3[2]',

            spectrum://隐形的翅膀
                '{C}D3[0.5]F3[0.5]C4[1.5]A3[0.5]C4[1]C4[0.5]B3[0.25]A3[0.25]'+
                'B3[1.5]G3[0.5]A3[0.5]G3[2]'+
                'A3[1]G3[0.5]F3[0.5]F3[0.5]E3[1]D3[0.5]'+
                'E[4]',
                  

        }
    },
    methods: {
        play(keyCode) {
            let keys = [90,88,67,86,66,78,77,65,83,68,70,71,72,74,81,87,69,82,84,89,85];
            if(keys.indexOf(keyCode) < 0) {
                return;
            }
            let whites = [0, 2, 4, 5, 7, 9, 11];
            let index = base + 2 * groupKeys + whites[keys.indexOf(keyCode) % 7] + parseInt(keys.indexOf(keyCode) / 7)*groupKeys;
            let audio = new Audio(prefix + notes[index]);
            audio.play();
        },
        //key 音符  group 音组  meter 拍数
        playKey(key,group,meter){
            console.log("play "+ key+group||"")

            if(key=='S'){
                //休止符
                setTimeout(this.parseAndPlaySpectrum,parseInt(this.meter_time*meter));
                return;

            }
            let keys=['C','D','E','F','G','A','B'];
            //console.log(SIGNATURE[this.key_signature]);
            let whites = SIGNATURE[this.key_signature]["audio-index"];
            let index =  group*groupKeys + whites[keys.indexOf(key) % 7] + parseInt(keys.indexOf(key) / 7)*groupKeys;
                    let audio = new Audio(prefix + notes[index]);
                    audio.play();
            setTimeout(this.parseAndPlaySpectrum,parseInt(this.meter_time*meter));

        },


        parseAndPlaySpectrum(){

            if(currentPlayPos==-1) return;

            if(currentPlayPos>=this.spectrum.length){

                currentPlayPos = -1;
                return;
            }

            let c = this.spectrum.charAt(currentPlayPos);
            if(c=='{'){
                let cc=[];
                currentPlayPos = currentPlayPos + 1;
                while(c!='}' && currentPlayPos<this.spectrum.length){
                    c = this.spectrum.charAt(currentPlayPos);
                    currentPlayPos = currentPlayPos + 1;
                    if(c!='}') cc.push(c);

                }

                this.key_signature = cc.join("");
                console.log("signature: "+this.key_signature)

            }

            let key = this.spectrum.charAt(currentPlayPos);
            currentPlayPos=currentPlayPos+1;
            let group = '3';
            if (key!='S'){ //休止符没有group
                group = this.spectrum.charAt(currentPlayPos);
                currentPlayPos=currentPlayPos+1;
            }


            //解析拍数
            c = this.spectrum.charAt(currentPlayPos);
            let meter=1;
            if(c=='['){
                let cc = []; 
                currentPlayPos = currentPlayPos + 1;
                while(c!=']' && currentPlayPos<this.spectrum.length){
                    c = this.spectrum.charAt(currentPlayPos);
                    currentPlayPos = currentPlayPos + 1;
                    if(c!=']') cc.push(c);
                }

                meter = parseFloat(cc.join(''));

            }
            console.log(currentPlayPos+","+group+","+meter);
            this.playKey(key,parseInt(group),meter);
            


        },
        doPlay(){
            currentPlayPos=0;


            this.parseAndPlaySpectrum();
            console.log(this.spectrum);


        }
    },
    ready() {
        document.body.addEventListener('keydown', e => {
            this.play(e.keyCode);
        });
    }
}
</script>

<style>
html, body {
  height: 100%;
}
body {
    padding: 0;
    margin: 0;
}

.keyboard{
    display: flex;
    margin: 20px;
}
.spectrum{
    display: flex;
    margin: 20px;
}


.control {
    text-align: center;
    margin-top: 50px;
}
</style>
