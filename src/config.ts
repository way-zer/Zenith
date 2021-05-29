export const config = {
    camera: {
        speed: 2, //pixels pre ms
        maxScale: 5,
        minScale: 0.3,
        minSelectTime: 120, //ms
        minSelectDistance: 50, //pixel
    },
    world: {
        width: 1280 * 5,
        height: 720 * 5,
    },
    network: {
        appId: '9r6ewbwIF4EaCEh1cc7kTKse-gzGzoHsz',
        appKey: 'rNpiz7XNgteng4iuYB14ejcT',
        server: 'https://9r6ewbwi.lc-cn-n1-shared.com',
    },
    game: {
        resourceGenInterval: 10, //in ms
        resourceGenMax: 500,
        resEnergy: 3,
        singleClickMove: true,
        resOnDeath: 0.3,
        resNumOnDeath: 5,
    },
    version: '0.1.0',
}

