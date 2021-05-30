import Sprite = egret.Sprite
import TextField = egret.TextField

export class TheLoading extends Sprite implements RES.PromiseTaskReporter {
    constructor() {
        super()
        this.createView()
    }

    private textField: TextField

    private createView() {
        this.textField = new TextField()
        this.textField.width = 1280
        this.textField.y = 300
        this.textField.textAlign = "center"
        this.addChild(this.textField)
    }

    onProgress(current: number, total: number, resItem?: RES.ResourceInfo) {
        this.textField.text = `Loading...${current}/${total}`
    }
}