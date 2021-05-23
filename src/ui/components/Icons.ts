import TheUI from '../TheUI'

class Icons {
    warPick: egret.Texture
    swords: egret.Texture
    bow: egret.Texture
    heart: egret.Texture

    arrow: egret.Texture

    init() {
        const pkg = TheUI.pkg
        this.warPick = pkg.getItemAssetByName('war-pick') as egret.Texture
        this.swords = pkg.getItemAssetByName('crossed-swords') as egret.Texture
        this.bow = pkg.getItemAssetByName('bow-arrow') as egret.Texture
        this.heart = pkg.getItemAssetByName('heart') as egret.Texture
        this.arrow = pkg.getItemAssetByName('archers-arrow') as egret.Texture
    }
}

export default new Icons()