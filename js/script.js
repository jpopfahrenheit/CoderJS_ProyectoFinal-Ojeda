principal()

async function principal() {

    let respuesta = await pedirInfo()
    console.log(respuesta)

    const response = await fetch("./data.json")
    const productos = await response.json()

    let carrito = carritoLS()
    renderizarCarrito(carrito)
    renderizarProductos(productos)

    let botonMostrarOcultar1 = document.getElementById("botonCarrito")
    botonMostrarOcultar1.addEventListener("click", mostrarOcultar)

    let botonMostrarOcultar2 = document.getElementById("botonVolver")
    botonMostrarOcultar2.addEventListener("click", mostrarOcultar)

    let botonBuscar = document.getElementById("botonBuscar")
    botonBuscar.onclick = () => filtrarYRenderizar(productos)

    let inputBusqueda = document.getElementById("inputBusqueda")
    inputBusqueda.addEventListener("keypress", (e) => filtrarYRenderizarEnter(productos, e))
}

function carritoLS() {
    let carrito = []
    let carritoLS = JSON.parse(localStorage.getItem("carrito"))
    if (carritoLS) {
        carrito = carritoLS
    }
    return carrito
}

function renderizarProductos(productos) {
    let inputBusqueda = document.getElementById("inputBusqueda").value
    let contenedorBusqueda = document.getElementById("contenedorBusqueda")
    contenedorBusqueda.innerHTML = `<h4>${inputBusqueda}</h4>`
    console.log(inputBusqueda)

    let contenedorProductos = document.getElementById("contenedorProductos")
    contenedorProductos.innerHTML = ``

    productos.forEach(producto => {
        let { id, nombre, marca, genero, categoria, precio, rutaImagen, stock } = producto

        let tarjetaProducto = document.createElement("div")
        tarjetaProducto.className = "tarjetaProducto"
        if (stock === 0) {
            tarjetaProducto.classList.add("sinStock");
        }
        tarjetaProducto.innerHTML = `
        <img src=${rutaImagen}></img>
        <h3>${marca}</h3>
        <h4>${nombre} ${genero}<br>${categoria}</h4>
        <h3>$${precio.toLocaleString()}</h3>
        <h4>${stock === 0 ? "Sin stock" : `Stock disponible: ${stock}`}</h4>
        <button id=botonCarrito${id} class=${stock === 0 ? "oculto" : ""}>Agregar al carrito</button>
        `
        contenedorProductos.appendChild(tarjetaProducto)

        let botonAgregarAlCarrito = document.getElementById("botonCarrito" + id)
        botonAgregarAlCarrito.addEventListener("click", (e) => agregarProductoAlCarrito(e, productos))
    })
}

function agregarProductoAlCarrito(e, productos) {
    let carrito = carritoLS()
    let idDelProducto = Number(e.target.id.substring(12))
    let posProductoEnCarrito = carrito.findIndex((producto) => producto.id === Number(idDelProducto))
    let productoBuscado = productos.find((producto) => producto.id === Number(idDelProducto))

    if (posProductoEnCarrito !== -1) {
        carrito[posProductoEnCarrito].unidades++
        carrito[posProductoEnCarrito].subtotal = carrito[posProductoEnCarrito].precio * carrito[posProductoEnCarrito].unidades
    } else {
        carrito.push({
            id: productoBuscado.id,
            nombre: productoBuscado.nombre,
            genero: productoBuscado.genero,
            precio: productoBuscado.precio,
            unidades: 1,
            subtotal: productoBuscado.precio,
            rutaImagen: productoBuscado.rutaImagen
        })
    }

    localStorage.setItem("carrito", JSON.stringify(carrito))
    Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Tu producto se ha agregado al carrito",
        showConfirmButton: false,
        timer: 1500
    });
    renderizarCarrito(carrito)
}

function filtrarYRenderizar(productos) {
    let productosFiltrados = filtrarProductos(productos)
    renderizarProductos(productosFiltrados)
    limpiarInput()
}

function filtrarYRenderizarEnter(productos, e) {
    if (e.keyCode === 13) {
        let productosFiltrados = filtrarProductos(productos)
        renderizarProductos(productosFiltrados)
        limpiarInput()
    }
}

function filtrarProductos(productos) {
    let inputBusqueda = document.getElementById("inputBusqueda").value.toLowerCase()
    let palabrasBusqueda = inputBusqueda.split(' ')
    return productos.filter(producto => {
        return palabrasBusqueda.every(palabra =>
            producto.nombre.toLowerCase().includes(palabra) ||
            producto.genero.toLowerCase().includes(palabra)
        )
    })
}

function limpiarInput() {
    document.getElementById("inputBusqueda").value = ""
}

function renderizarCarrito() {
    let carrito = carritoLS()
    let contenedorCarrito = document.getElementById("contenedorCarrito")
    contenedorCarrito.innerHTML = `<h2>Carrito de compras</h2>`
    carrito.forEach(producto => {
        let { id, nombre, genero, precio, rutaImagen, stock, unidades, subtotal } = producto
        let tarjetaProductoCarrito = document.createElement("div")
        tarjetaProductoCarrito.className = "tarjetaProductoCarrito"
        tarjetaProductoCarrito.id = "tarjetaProductoCarrito" + id
        tarjetaProductoCarrito.innerHTML = `
        <img class=miniatura src=${rutaImagen}></img>
        <p>${nombre} | ${genero}</p>
        <p>$${precio.toLocaleString()}</p>
        <div class=unidades>
            <button id=dec${id}>-</button>
            <p>${unidades}</p>
            <button id=inc${id}>+</button>
        </div>
        <p>$${subtotal.toLocaleString()}</p>
        <img src="img/basura.png" class="basura" id=eliminar${id}></img>
        `
        contenedorCarrito.appendChild(tarjetaProductoCarrito)

        let botonDecUnidad = document.getElementById("dec" + id)
        botonDecUnidad.addEventListener("click", decrementarUnidad)

        let botonIncUnidad = document.getElementById("inc" + id)
        botonIncUnidad.addEventListener("click", incrementarUnidad)

        let botonEliminar = document.getElementById("eliminar" + id)
        botonEliminar.addEventListener("click", eliminarProductoDelCarrito)

    })
    let totalCompra = calcularTotalCompra(carrito)
    let totalDiv = document.createElement("div")
    totalDiv.className = "totalCompra"
    totalDiv.innerHTML = `
    <p>Total de la compra: $${totalCompra}</p> 
    <button id=comprar class=${totalCompra == 0 ? "oculto" : ""}>Finalizar compra</button>
    `
    /* <button id=comprar>Finalizar compra</button> */
    /* <button id=botonCarrito${id} class=${stock === 0 ? "oculto" : ""}>Agregar al carrito</button> */
    contenedorCarrito.appendChild(totalDiv)

    let botonComprar = document.getElementById("comprar")

    botonComprar.addEventListener("click", finalizarCompra)
}

function calcularTotalCompra(carrito) {
    let total = 0;
    carrito.forEach(producto => {
        total += producto.subtotal;
    });
    return total.toLocaleString();
}

function incrementarUnidad(e) {
    let carrito = carritoLS()
    let id = Number(e.target.id.substring(3))
    let posProdEnCarrito = carrito.findIndex(producto => producto.id === id)
    carrito[posProdEnCarrito].unidades++
    carrito[posProdEnCarrito].subtotal = carrito[posProdEnCarrito].unidades * carrito[posProdEnCarrito].precio
    localStorage.setItem("carrito", JSON.stringify(carrito))
    renderizarCarrito()
}

function decrementarUnidad(e) {
    let carrito = carritoLS()
    let id = Number(e.target.id.substring(3))
    let posProdEnCarrito = carrito.findIndex(producto => producto.id === id)
    if (carrito[posProdEnCarrito].unidades >= 1) {
        carrito[posProdEnCarrito].unidades--
        carrito[posProdEnCarrito].subtotal = carrito[posProdEnCarrito].unidades * carrito[posProdEnCarrito].precio
        localStorage.setItem("carrito", JSON.stringify(carrito))
        renderizarCarrito()
    }
}

function mostrarOcultar(e) {
    let contenedorCarrito = document.getElementById("contenedorCarrito")
    let contenedorProductos = document.getElementById("contenedorProductos")
    let botonCarrito = document.getElementById("botonCarrito")
    let botonVolver = document.getElementById("botonVolver")

    contenedorCarrito.classList.toggle("oculto")
    contenedorProductos.classList.toggle("oculto")
    botonCarrito.classList.toggle("oculto")
    botonVolver.classList.toggle("oculto")
}

function eliminarProductoDelCarrito(e) {
    let carrito = carritoLS()
    let id = Number(e.target.id.substring(8))
    carrito = carrito.filter(producto => producto.id !== id)
    localStorage.setItem("carrito", JSON.stringify(carrito))
    e.target.parentElement.remove()
    renderizarCarrito()
}

function finalizarCompra() {
    localStorage.removeItem("carrito")
    Swal.fire({
        icon: "success",
        title: "Gracias por tu compra!",
        showConfirmButton: false,
        timer: 1500
    });
    renderizarCarrito()
}

async function pedirInfo() {
    try {
        const response = await fetch("./data.json")
        const productos = await response.json()
        return productos
    } catch (error) {
        console.log("Algo salió mal: ", error)
    }
}
