export class RankListItem{
    ref = fgui.UIPackage.createObject('UI', 'rankListItem').asCom
    name = this.ref.getChild("name").asLabel
    score = this.ref.getChild("score").asLabel

    set(name: string, score: number) {
        this.name.text = name
        this.score.text = score.toString()
    }
}

export class RankList {
    constructor(private list: fgui.GList) {
        const item = new RankListItem()
        list.addChild(item.ref)
        item.set('PlayerTest', 99999)
    }
}