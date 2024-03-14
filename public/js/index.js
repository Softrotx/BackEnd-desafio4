const socket = io();

socket.emit('message', "me comunico desde un websocket")




socket.on('globalMenosElActual', data => {
    console.log(data)
})

socket.on('global', data => {
    console.log(data)
})