const socket = io();
socket.emit('message', "me comunico desde un websocket")

socket.on('Productos', data => {

    const productos = document.createElement('p')
    productos.innerText = `ID: ${data.id} Titulo: ${data.title} `
    document.querySelector('#listaProductos').appendChild(productos)


})