//variables

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

// cart 
let cart = [];
//buttons
let buttonsDOM = [];

// Getting the products, from API
class Products {
    // async await -> always returns the promise we can use .then await is used to wait till promise is settled
    async getProducts() {
        try {
            let result = await fetch('products.json'); //waiting till the response and then we will proceed
            let data = await result.json();
            let products = data.items;

            //destructuring the data from response to get clean array of objects
            products = products.map(item => {
                const { title, price } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                return { title, price, id, image }
            })
            return products;
        } catch {
            console.log(error);
        }
    }
}

// Display products, getting all the products from product class and displaying them/manipulating them
class UI {
    displayProducts(products) {
        let result = '';
        //loop through products and add data dynamically
        products.forEach(product => {
            result += `
            <!-- single product -->
            <article class="product">
                <div class="img-container">
                    <img src=${product.image} alt="product" class="product-img">
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i>
                        Add to bag
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </article>            
            <!-- end of sigle product -->`
        });
        // rendering on the DOM
        productsDOM.innerHTML = result;
    }


    getBagButtons() {
        // using spread operator so that it is stored as an array.
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            // populate inCart items
            let inCart = cart.find(item => item.id === id);
            // once products is added in cart we should not be able to add it again while page reload
            if (inCart) {
                button.innerText = "In Cart";
                button.disabled = true;
            }
            button.addEventListener('click', (event) => {
                event.target.innerText = "In Cart";
                event.target.disabled = true;
                // get product from products
                let cartItem = { ...Storage.getProduct(id), amount: 1 }; //here amount is the qty, default is 1
                // add product to the cart
                cart = [...cart, cartItem];
                // save cart in local storage
                Storage.saveCart(cart);
                // set cart item
                this.setCartValues(cart);
                // add cart items
                this.addCartItem(cartItem);
                // show the cart
                this.showCart();
            })

        })
    }

    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
        console.log(cartTotal, cartItems);
    }

    addCartItem(item) {
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
                    <img src=${item.image} alt="product" />
                    <div>
                        <h4>${item.title}</h4>
                        <h5>${item.price}</h5>
                        <span class="remove-item" data-id=${item.id}>Remove</span>
                    </div>
                    <div>
                        <i class="fas fa-chevron-up" data-id=${item.id}></i>
                        <p class="item-amount">${item.amount}</p>
                        <i class="fas fa-chevron-down" data-id=${item.id}></i>
                    </div>`;
                    cartContent.appendChild(div);
                    console.log(cartContent);
    }

    showCart(){
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart')
    }

    setUpApp(){
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
    }

    populateCart(cart){
        cart.forEach(item => this.addCartItem(item));
    }
}

//local storage
class Storage {
    //static method can be used without instantiating
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }

    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem("products"));
        return products.find(product => product.id === id)
    }

    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    static getCart(){
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }
}

//The DOMContentLoaded event fires when the initial HTML document has 
//been completely loaded and parsed, without waiting for stylesheets, images, and subframes to finish loading.
document.addEventListener("DOMContentLoaded", () => {
    //inititating instances of classes
    const ui = new UI();
    const products = new Products();
    // setup application
    ui.setUpApp();
    //get all products and send it to the UI component for rendering
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products); // after retrieveing products we are storing in local storage.
    }).then(() => {
        ui.getBagButtons()
    });
})