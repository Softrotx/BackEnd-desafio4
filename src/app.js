const productsRouter = require('./routes/products.router')
const cartsRouter = require('./routes/carts.router')
const viewsRouter = require('./routes/views.router')
const express = require('express');
const handlebars = require('express-handlebars')
const { Server } = require('socket.io')



const app = express();
const httpServer = app.listen(8080, () => {
    console.log('servidor listo')
})

const socketServer = new Server(httpServer)

app.use(express.urlencoded({ extended: true }))
app.use(express.json())


app.engine('handlebars', handlebars.engine())
app.set('views', __dirname + '/views')
app.set('view engine', 'handlebars')
app.use(express.static(__dirname + '/../public'))

app.use('/', viewsRouter)

/* ----------API------------ */
app.use('/api/products', productsRouter)
app.use('/api/carts', cartsRouter)
/* ---------/API------------ */

app.set('ws', socketServer)






