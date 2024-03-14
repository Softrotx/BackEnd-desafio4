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
    try {
        const { limit } = req.query
        const products = await readArchive('Productos')

        if (limit >= 0) {
            res.json(products.slice(0, limit))
            return
        }
        res.json(products)
    }
    catch (err) {
        console.error("Error al procesar solicitud")
        throw (err)
    }
})

router.get('/:pid', async (req, res) => {
    try {
        const pid = parseInt(req.params.pid)
        console.log(pid)
        const products = await readArchive('Productos')
        const productFound = products.find(({ id }) => id === pid)
        if (isNaN(pid)) {
            // HTTP 400 => hay un error en el request o alguno de sus parámetros
            res.status(400).json({ error: "Invalid ID format" })
            return
        }
        if (productFound === undefined){
            res.status(400).json({ error: "No existe el producto solicitado" })
            return
        }
        res.json(productFound)


    }
    catch (err) {
        throw (err)
    }
})

router.post('/', async (req, res) => {
    try {
        const products = await readArchive('Productos')
        const { title, description, code, price, status, stock, category, thumbnails } = req.body

        if (!title || !description || !code || !price || !status || !stock || !category) {
            res.status(400).end({ Error: "todos los campos son obligatorios" })
            return
        }
        const producto = {
            id: "",
            title: title,
            description: description,
            code: code,
            price: price,
            status: true,
            stock: stock,
            category: category,
            thumbnails: thumbnails
        }


        producto.id = Number.parseInt(Math.random() * 1000)

        
        const validateId = await products.find(product => product.id === producto.id)
        const validateCode = await products.find(product => product.code === producto.code)
        if(validateCode){
            res.status(400).send({Status: "CODE DUPLICATED", message: "No es posible agregar productos con el mismo codigo"})
            return
        }
        while (validateId) {
            producto.id = Number.parseInt(Math.random() * 1000)
        }
        await products.push(producto)
        await fs.promises.writeFile('./assets/Productos.json', JSON.stringify(products, null, '\t'))
        res.status(201).send({status:"Success!", Message: `El producto ha sido creado correctamente con el ID ${producto.id}`})

    }
    catch (err) {

    }




})

router.put('/:pid', async (req, res) => {
    const products = await readArchive('Productos')

    const productId = parseInt(req.params.pid) 
    const productIndex = await products.findIndex(p => p.id === productId)

    if (isNaN(productId)) {
        res.status(400).json({ error: "Invalid ID format" })
        return
    }

    if (productIndex < 0) {
        res.status(404).json({ error: "User not found" })
        return
    }
    const validateCode = await products.find(product => product.code === req.body.code)
    if(validateCode){
        res.status(400).send({Status: "CODE DUPLICATED", message: "No es posible agregar productos con el mismo codigo"})
        return
    }

    const newProductData = await { ...products[productIndex], ...req.body, id: productId }
    products[productIndex] = newProductData
    await fs.promises.writeFile('./assets/Productos.json', JSON.stringify(products, null, '\t'))
    res.status(202).send({status:"Success!", Message: "El producto ha sido actualizado correctamente"})

})

router.delete('/:pid', async (req, res) => {
    const products = await readArchive('Productos')

    const productId = parseInt(req.params.pid) 
    const productIndex = await products.findIndex(p => p.id === productId)

    if (isNaN(productId)) {
        res.status(400).json({ error: "formato de ID invalido" })
        return
    }

    if (productIndex < 0) {
        res.status(404).json({ error: "Producto no encontrado" })
        return
    } else {
        await products.splice(productIndex, 1)
        await fs.promises.writeFile('./assets/Productos.json', JSON.stringify(products, null, '\t'))
        res.status(202).send({status:"Success!", Message: "El producto ha sido eliminado correctamente"})
    }




})

module.exports = router


