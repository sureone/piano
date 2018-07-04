

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
import {SIGNATURE,Song} from './global.js'
const groupKeys = 12;
const base = 2;


var curSong = null;

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

            spectrum3://隐形的翅膀
                //'D3[0.5]F3[0.5]C4[1.5]A3[0.5]C4[1]C4[0.5]B3[0.25]A3[0.25]'+
                //'B3[1.5]G3[0.5]A3[0.5]G3[2]'+
                //'A3[1]G3[0.5]F3[0.5]F3[0.5]E3[1]D3[0.5]'+
                //'E[4]A3[0.5]C4[0.5]D4[0.5]E4[0.5]E4[1.5]D4[0.25]C4[0.25]'+
                //'D4[1.5]C4[0.25]D4[0.25]C4[2]'+
                //'S[0.5]G3[0.5]F3[0.5]E3[0.5]D3[1.5]C3[0.25]B2[0.25]C[3]'+

                '{C}'+
                'G2[0.5]CE[1.5]G[0.5]E[1]D[0.5]CCCCA2[0.25]G2[1]G2[0.5]C'+
                'E[1.5]G[0.5]GGAGGD[0.25]ED[0.5]C[0.25]DD[1]A[0.5]GE[1.5]G[0.5]GGAGEDCC[0.25]DA2[1]G2[0.5]A2'+
                'C[1.5]D[0.25]ED[1]E[0.5]CC[3]'+

                'G2[0.5]CE[1.5]G[0.5]E[1]D[0.5]CCCCA2[0.25]G2[1]G2[0.5]C'+
                'E[1.5]G[0.5]GGAGGD[0.25]ED[0.5]C[0.25]DD[1]A[0.5]GE[1.5]G[0.5]GGAGEDCC[0.25]DA2[1]G2[0.5]A2'+
                'C[1.5]D[0.25]ED[1]E[0.5]CC[3]'+
              

                'E[0.5]GC4[1.5]B[0.25]C4B[1]A[0.5]GAC4EDC3[1]C3[0.5]C3'+
                'C3C4[1]G[0.25]AG[0.5]D[0.25]ED[0.5]C[0.25]DD[3]'+
                'E[0.5]GC4[1.5]A[0.25]C4B[1]A[0.5]GAC4EDC[1]C[0.5]C'+
                'CC4[1]G[0.25]AG[0.5]D[0.25]ED[0.5]CC[3]'+


                'G2[0.5]CE[1.5]G[0.5]E[1]D[0.5]CCCCA2[0.25]G2[1]G2[0.5]C'+
                'E[1.5]G[0.5]GGAGGD[0.25]ED[0.5]C[0.25]DD[1]A[0.5]GE[1.5]G[0.5]GGAGEDCC[0.25]DA2[1]G2[0.5]A2'+
                'C[1.5]D[0.25]ED[1]E[0.5]CC[3]'+
                'E[0.5]GC4[1.5]B[0.25]C4B[1]A[0.5]GAC4EDC3[1]C3[0.5]C3'+
                'C3C4[1]G[0.25]AG[0.5]D[0.25]ED[1]S[1]C[0.5]CC[1]',
            spectrum4://虫儿飞
                '{b}'+
                'E[1]E[0.5]EF[1]GE[2]DC[1]C[0.5]CD[1]EE[1.5]B2[0.5]B2[1.5]'+
                'B2[1]ED[2]B2[1]ED[2]B2[1]ED[1.5]C[0.5]C[4]'+
                'E[0.5]DG[2]F[0.5]ED[2]G[0.5]FEDG[1.5]E[0.5]D[2]G2[1]ED[2]'+
                'B2[1]ED[2]F[0.5]EFED[2]F[0.5]EFEC[1]D[0.5]C[0.25]C[4]',

            spectrum5://鸿雁
                '{b}'+
                'E[1]C[0.5]A2G2[1.5]G[1]A[0.5]C4A[2]A[1]G[0.5]ECDGEDD[3]'+
                'G[1]A[0.5]C4A[2]D[0.5]ECA2G2[2]E[1]C[0.5]A2G2A2E[1]A2[4]'+
                'E[1]C[0.5]A2G2[1.5]G[1]A[0.5]C4A[2]A[1]G[0.5]ECDGEDD[3]'+
                'G[1]A[0.5]C4A[2]D[0.5]ECA2G2[2]E[1]C[0.5]A2G2A2E[1]A2[4]',
            spectrum6://歌声与微笑
                '{b}'+
                'F[0.5]FFFD[0.75]E[0.25]F[1]'+
                'F[0.5]FFFD[0.75]E[0.25]F[1]'+
                'G[0.5]GG[0.25]FGE[4]',
            spectrum7://康定情歌
                '{b}'+
                'E[0.5]GAA[0.25]GA[0.75]E[0.25]D[1]',
            spectrum: //爱的罗曼史
                '{#}B[1]BBBAGGFEEGBE4E4E4E4D4C4C4BAABC4B+D4C4BD4#C4B'+
                'BAGGFEFFE+FD#+F#GFEEEE[3]B[1]BBBAGGFEEGBE4E4E4E4D4C4'+
                'C4BAABC4D4BC4BD4#C4BBAGGFEFFE+FD#+F#GFE+B2E+B2E+B2E+B2[3]'


                  
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

        
        doPlay(){
            curSong = new Song([this.spectrum],this.meter_time);
            curSong.play();
            //console.log(this.spectrum);


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
