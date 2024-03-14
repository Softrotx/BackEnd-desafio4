const { Router } = require('express')
const router = Router();
const fs = require('fs')

const readArchive = async (nameAsset) => {
    const filename = `../assets/${nameAsset}.json`

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

router.post('/', async (_req, res) => {
    try {
        const carts = await readArchive("Carts")
        const newCart = {
            id: "",
            products: []
        }
        newCart.id = Number.parseInt(Math.random() * 1000)
        const validateId = await carts.find(cart => cart.id === newCart.id)
        while (validateId) {
            newCart.id = Number.parseInt(Math.random() * 1000)
        }
        await carts.push(newCart)

        await fs.promises.writeFile('../assets/Carts.json', JSON.stringify(carts, null, '\t'))
        res.status(201).send({ status: "Success!", Message: "se ha creado un nuevo carrito con id " + newCart.id })

    }
    catch (err) {
        throw (err)

    }
})

router.get('/:cid', async (req, res) => {
    try {
        const cartId = parseInt(req.params.cid)
        const carts = await readArchive("Carts")
        const cartfound = await carts.find(({ id }) => id === cartId)
        if (isNaN(cartId)) {
            // HTTP 400 => hay un error en el request o alguno de sus parámetros
            res.status(400).json({ error: "Invalid ID format" })
            return
        }
        res.json(cartfound)



    }
    catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
        throw (err)

    }


})

router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = parseInt(req.params.cid)
        const productId = parseInt(req.params.pid)
        const [carts, products] = await Promise.all([
            readArchive("Carts"),
            readArchive("Productos")
        ])
        const [productFound, cartIndex] = await Promise.all([
            products.find(({ id }) => id === productId),
            carts.findIndex(({ id }) => id === cartId)
            
        ])
        console.log(cartIndex)
        if (isNaN(cartId || productId)) {
            res.status(400).json({ error: "Invalid ID format" })
            return
        }
        if (productFound === undefined){
            res.status(400).json({ error: "No existe el producto solicitado" })
            return
        }
        if (cartIndex < 0){
            res.status(400).json({ error: "No existe el Carrito solicitado" })
            return
        }
        
        const productOnCart = await carts[cartIndex].products.findIndex(({ ProductID }) => ProductID === productId)
        console.log(productOnCart)


        if (productOnCart >= 0){
            let cantidad = parseInt(carts[cartIndex].products[productOnCart].quantity) +1
            carts[cartIndex].products[productOnCart].quantity = cantidad
            await fs.promises.writeFile('../assets/Carts.json', JSON.stringify(carts, null, '\t'))
            res.status(201).send({status: "Success!", message: `Producto ID ${productFound.id} agregado correctamente al Carrito N° ${carts[cartIndex].id} con un total de ${cantidad} unidades`})
            return
        }
        carts[cartIndex].products.push({ProductID: productFound.id, quantity: 1})
        await fs.promises.writeFile('../assets/Carts.json', JSON.stringify(carts, null, '\t'))
        res.status(201).send({status: "Success!", message: `Producto ID ${productFound.id} agregado correctamente al Carrito N° ${carts[cartIndex].id}`})
        
    }
    catch (err) {
        res.status(500).send({status: "Success!", message: `Error interno`,error: err })

}



})









module.exports = router

