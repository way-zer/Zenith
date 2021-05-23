import {Main} from './Main'
import {Core} from './entities/Core'

// @ts-ignore
window.Main = Main
console.log(Core.prototype)
egret.runEgret({renderMode: 'webgl', audioType: 0})