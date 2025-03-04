const express = require('express');
const cors = require('cors');

const app = express();

app.listen(3000);
console.log(`Server on port ${3000}`);

app.use(express.json());
app.use(cors());


let products = [
    { id: 1, name: "Producto 1", price: 60 },
    { id: 3, name: "Producto 3", price: 120 },
    { id: 2, name: "Producto 2", price: 100 },
    { id: 4, name: "Producto 4", price: 70 }
]

let shoppingCart = [];

app.get('/', (req, res) => {
    res.json(["Servidor funcionando en port 3000"]);
});

app.get('/products', (req, res) => {
    res.json(products);
});

function getCarrito() {
    const total = shoppingCart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    return {shoppingCart, total};
}

app.get('/cart', (req, res) => {
    res.json(getCarrito());
});

app.get('/cart/:id', (req, res) => {
    //res.send("Consultando un producto");
    const product = products.find(product => product.id === parseInt(req.params.id));
    
    //if (product != undefined) {}
    if (!product) {
        res.status(404).json({message : "Producto no encontrado"});
        return;
    }

    const index = shoppingCart.findIndex(item => item.id === product.id);
    if (index != -1) {
        shoppingCart[index].quantity++;
    } else {
        shoppingCart.push({...product, quantity : 1});
    }

    const {total} = getCarrito()
    res.json({message : "Producto Agregado al carrito", shoppingCart, total});
})

app.get('/reduceCart/:id/:qty', (req, res) => {
    //res.send("Consultando un producto");
    const product = products.find(product => product.id === parseInt(req.params.id));
    
    //if (product != undefined) {}
    if (!product) {
        res.status(404).json({message : "Producto no encontrado"});
        return;
    }

    const index = shoppingCart.findIndex(item => item.id === product.id);
    if (index != -1) {
        shoppingCart[index].quantity += parseInt(req.params.qty);

        if (shoppingCart[index].quantity <= 0) {
            shoppingCart = shoppingCart.filter(item => item.id !== product.id);
        }
    } else {
        res.status(404).json({message : "Producto no se encuentra en el carrito"});
        return;
    }
    
    const {total} = getCarrito();
    res.json({message : "Carrito actualizado", shoppingCart, total});
})