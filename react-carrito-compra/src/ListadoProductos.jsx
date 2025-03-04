/* import {axios} from "axios"; */
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export const ListadoProducto = () => {

    const Toast = Swal.mixin({
        toast: true,
        position: "bottom",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
        }
    })
    
    const [productos, setProductos] = useState([])
    const [carrito, setCarrito] = useState([])
    const [verCarrito, setVerCarrito] = useState(false)
    
    const [valorPresupuesto, setValorPresupuesto] = useState(0)
    const [verPresupuesto, setVerPresupuesto] = useState(false)
    const [mejoresCombinaciones, setMejoresCombinaciones]  = useState({valor : 0, listado : []})

    const consultarUsuarios = async () => {
        try {
            const response = await fetch('http://localhost:3000/products');
            const data = await response.json();

            console.log(data);
            setProductos(data)
        } catch (error) {
            console.log(error);
            
        }
    }

    const consultarCarrito = async () => {
        try {
            const response = await fetch('http://localhost:3000/cart');
            const data = await response.json();

            console.log(data);
            setCarrito(data.shoppingCart)
        } catch (error) {
            console.log(error);
            
        }
    }

    const agregarProductoEnCarrito = async (producto) => {
        console.log(producto);
        
        try {
            const response = await fetch(`http://localhost:3000/cart/${producto.id}`);
            const data = await response.json();
            console.log(data);
            setCarrito(data.shoppingCart)

            Toast.fire({title: data.message, icon : "success"})
            
        } catch (error) {
            console.log(error);
            
        }
    }
    const reducirProductoEnCarrito = async (producto, cantidad) => {
        console.log(producto);
        
        try {
            const response = await fetch(`http://localhost:3000/reduceCart/${producto.id}/${cantidad}`);
            const data = await response.json();
            console.log(data);
            setCarrito(data.shoppingCart)

            Toast.fire({title: data.message, icon : "info"})
            
        } catch (error) {
            console.log(error);
            
        }
    }

    const mostrarCarrito = () => {
        setVerCarrito(!verCarrito)
    }
    const mostrarPresupuesto = () => {
        setVerPresupuesto(!verPresupuesto)
    }

    const calcularMejorCombinacion = () => {
        if (valorPresupuesto <= 0) {
            Toast.fire({title: "Debe digitar un presupuesto valido", icon : "warning", position: "top"})
            return;
        }
        findBestCombination(productos, valorPresupuesto);
    }

    const findBestCombination = (products, budget) => {
        let combinaciones = [];
        let combinacionActual = [];
        
        let valorMejorCombinacion = 0;
        let valorActual = 0;

        for (let i = 0; i < products.length; i++) {
            valorActual         = 0;
            combinacionActual = [];
            
            const producto = products[i];
            // agrego producto inicial

            combinacionActual.push(producto);
            valorActual += producto.price;
            if (valorActual > budget) {
                continue;
            } 

            for (let j = 0; j < products.length; j++) {
                if (i != j) {
                    const nuevoProducto = products[j];

                    if ((valorActual + nuevoProducto.price) > budget) {
                        continue;
                    } 

                    combinacionActual.push(nuevoProducto);
                    valorActual += nuevoProducto.price;
                }
            }

            if (valorActual >= valorMejorCombinacion) {
                if (valorActual > valorMejorCombinacion) {
                    combinaciones = [];
                }
                valorMejorCombinacion = valorActual;
                combinaciones.push(combinacionActual);
            } 
        }

        console.log(valorMejorCombinacion, combinaciones);

        setMejoresCombinaciones({valor : valorMejorCombinacion, listado : combinaciones});
        
    }

    useEffect(() => {
        consultarUsuarios();
        consultarCarrito();
    }, []);

    return <>
        <nav className="navbar bg-body-tertiary">
            <div className="container-fluid">
                <a className="navbar-brand">Carrito de Compras</a>
                <form className="d-flex" role="search">
                    <button className="btn" type="button" onClick={mostrarPresupuesto}>
                        Presupuesto
                    </button>

                    <button className="btn" type="button" onClick={mostrarCarrito}>
                        <span className="badge text-bg-secondary">{carrito.length}</span> 
                        <i className="fa-solid fa-cart-shopping"></i>
                    </button>
                </form>
            </div>
        </nav>

        <div className={"offcanvas offcanvas-top" + (verCarrito ? " show" : "")} style={{height : "100%"}}
            id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
            <div className="offcanvas-header">
                <h5 className="offcanvas-title" id="offcanvasExampleLabel">Detalle del Carrito</h5>
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"
                        onClick={mostrarCarrito}></button>
            </div>
            <div className="offcanvas-body">
                <ul className="list-group">
                    {carrito.map(item =>
                        <div key={item.id} href="#" className="list-group-item list-group-item-action" aria-current="true">
                            <div className="d-flex w-100 justify-content-between">
                                <h5 className="mb-1">{item.name}</h5>
                                <h6>{item.price * item.quantity}</h6>
                            </div>
                            <div className="d-flex w-100 justify-content-between">
                                <small>
                                    <button type="button" className="btn btn-sm "  onClick={() => reducirProductoEnCarrito(item, -1)}>
                                        <i className="fa-solid fa-minus"></i>
                                    </button>
                                    <span className="">{item.quantity}</span>
                                    <button type="button" className="btn btn-sm " onClick={() => agregarProductoEnCarrito(item)}>
                                        <i className="fa-solid fa-plus"></i>
                                    </button>
                                </small>
                                <small>
                                    <button type="button" className="btn btn-sm"  onClick={() => reducirProductoEnCarrito(item, -item.quantity)}>
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </small>
                            </div>
                        </div>
                    )}

                    {carrito.length == 0 ? <h5 className="text-center">No hay productos en el carrito</h5> : null} 
                </ul>
            </div>
        </div>

        <div className={"offcanvas offcanvas-bottom" + (verPresupuesto ? " show" : "")} style={{height : "100%"}}
            id="offcanvasExampleBottom" aria-labelledby="offcanvasExampleLabel">
            <div className="offcanvas-header">
                <h5 className="offcanvas-title" id="offcanvasExampleLabel">Mejor Combinacion</h5>
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"
                        onClick={mostrarPresupuesto}></button>
            </div>
            <div className="offcanvas-body">
                <div className="row">
                    <div className="col-12">
                        <div className="form-group">
                            <label htmlFor="valorPresupuesto">Valor Presupuesto</label>
                            <input  id="valorPresupuesto" name="valorPresupuesto"
                                    type="number" className="form-control" 
                                    value={valorPresupuesto} onChange={(e) => setValorPresupuesto(e.target.value)} />
                        </div>
                    </div>

                    <div className="col-12 mt-2">
                        <div className="d-grid gap-2">
                            <button className="btn btn-outline-primary" type="button"
                                    onClick={calcularMejorCombinacion}>Buscar Mejor Combinacion</button>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12 mt-2">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">Combinaciones</h5>
                                <div className="row">
                                    <div className="col-8">Valor Mejor Combinacion</div>
                                    <div className="col-4 text-end">{mejoresCombinaciones.valor}</div>
                                </div>
                            </div>
                            <ul className="list-group">
                                {mejoresCombinaciones.listado.map((item, index) => 
                                    <div key={index}>
                                        <p className="card-body text-center">Combinacion {index + 1}</p>
                                        {item.map(producto => 
                                        <div key={producto.id} href="#" className="list-group-item list-group-item-action" aria-current="true">
                                            <div className="d-flex w-100 justify-content-between">
                                                <h5 className="mb-1">{producto.name}</h5>
                                                <h6>{producto.price}</h6>
                                            </div>
                                        </div>)}
                                    </div>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>


        <div className="container">
            <div className="row text-center py-4">
                <div className="col-12">
                    <h1>Listado de Productos</h1>
                </div>
            </div>
            <div className="row text-center row-cols-1 row-cols-md-3 g-4">
                {productos.map(item =>
                    <div className="col" key={item.id}>
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">{item.name}</h5>
                                <p className="card-text">$ {item.price}</p>
                                <button type="button" className="btn btn-sm btn-outline-primary"
                                        onClick={() => agregarProductoEnCarrito(item)}>
                                    <i className="fa-solid fa-cart-shopping"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </>
}