import {EventEmitter} from 'eventemitter3'

/**
 * 事件键，所有键应当单例保存
 * @type T 事件内容类型
 */
export class EventKey<T extends {} = {}> {
    private static array = [] as EventKey[]

    static getById(id: number): EventKey {
        return this.array[id]
    }

    /**
     * 唯一数字id
     */
    readonly id: number

    /**
     * @param name 事件名
     */
    constructor(public readonly name: string) {
        this.id = EventKey.array.push(this) - 1
    }

    /**
     * 唯一字符串Id
     */
    get nameId() {
        return this.name + '#' + this.id
    }
}

export class MyEventEmitter<Ext = {}> {
    private impl = new EventEmitter()

    /**注册事件处理*/
    on<T>(event: EventKey<T>, listener: (payload: T & Ext) => any): this {
        this.impl.on(event.nameId, listener)
        return this
    }

    /**注册一次性事件处理*/
    once<T>(event: EventKey<T>, listener: (payload: T & Ext) => any): this {
        this.impl.once(event.nameId, listener)
        return this
    }

    /**取消事件处理*/
    off<T>(event: EventKey<T>, listener: (payload: T & Ext) => any): this {
        this.impl.off(event.nameId, listener)
        return this
    }

    /**触发事件*/
    emit<T>(event: EventKey<T>, arg: T & Ext): boolean {
        return this.impl.emit(event.nameId, arg)
    }
}