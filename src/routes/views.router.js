const { Router } = require('express')
const router = Router();
const fs = require('fs')

const readArchive = async (nameAsset) => {
    const filename = `./assets/${nameAsset}.json`

    try {
        const data = await fs.promises.readFile(filename, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') {
            // El archivo no existe, se crea con un array vacío
            await fs.promises.writeFile(filename, JSON.stringify([], null, '\t'));
            console.log('Archivo creado con un array vacío.');
            return [];
        } else {
            // Otro tipo de error, se maneja aquí
            console.error('Error al leer el archivo:', err.message);
            throw err;
        }
    }
}

router.get('/', async (req, res) => {

    res.render('index', {
        

    })
})

router.get('/home', async (req, res) => {
    const products = await readArchive('Productos')

    res.render('home', { products })
})

router.get('/realtimeproducts', async (req, res) => {
    const products = await readArchive('Productos')
    console.log('mensaje desde realtimeproducts')
    const wsServer = req.app.get('ws')

    res.render('realTimeProducts', {})

    wsServer.on('connection', socket => {
        console.log("nuevo cliente conectado")

        for (const product of products) {
            socket.emit('Productos', product )    
        } }) 
    })


    
    

    module.exports = router