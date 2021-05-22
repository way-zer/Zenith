import GComponent = fgui.GComponent

type Value = { name: string, score: number }

export class RankList {
    constructor(private list: fgui.GList) {
        this.update([{name: 'PlayerTest', score: 99999}])
    }

    update(value: Value[]) {
        value = value.sort((a, b) =>
            (-(a.score - b.score)),//sort decrease
        )
        const newNum = Math.min(value.length, 8)
        while (newNum > this.list.numItems) this.list.addItemFromPool('ui://UI/rankListItem')
        if (newNum < this.list.numItems) this.list.removeChildrenToPool(newNum)

        function setItem(ref: GComponent, v: Value) {
            ref.getChild('name').asLabel.text = v.name
            ref.getChild('score').asLabel.text = v.score.toString()
        }

        for (let i = 0; i < newNum; i++) {
            setItem(this.list.getChildAt(i).asCom, value[i])
        }
    }
}