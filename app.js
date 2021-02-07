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
                        Add to cart
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
                // add single cartItem to the  array of other cart items stored in cart array.
                cart = [...cart, cartItem];
                // save cart in local storage
                Storage.saveCart(cart);
                // set cart item for calculations of the price and displaying the price
                this.setCartValues(cart);
                // add cart to the items so that it can be shown in the side nav panel
                this.addCartItem(cartItem);
                // show the cart i.e the sidenav panel.
                this.showCart();
            })

        })
    }

    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;  //price total
            itemsTotal += item.amount; // number of items
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
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
    }

    showCart(){
        cartOverlay.classList.add('transparentBcg');  // this sets the visibility which is hidden by default
        cartDOM.classList.add('showCart') // this overrides the translatex value from 100% to 0%
    }

    //clicking the close button on the sidenav
    hideCart(){
        cartOverlay.classList.remove('transparentBcg');  // this sets the visibility to hidden which is by default
        cartDOM.classList.remove('showCart') //showcart class is added it is removed i.e translatex is again set to 100%
    }

    // get the items from the existing cart
    //
    setUpApp(){
        // now cart will be either empty (first time) or will have some values in it
        cart = Storage.getCart();

        // set the cartValues, i.e do the calculations of the number of amounts and price for whatever is there in the cart
        this.setCartValues(cart);

        // for each of the cart items if they exist add it to the side nav panel as an individual item
        this.populateCart(cart);

        cartBtn.addEventListener("click", this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart);
    }

    populateCart(cart){
        cart.forEach(item => this.addCartItem(item));
    }

    // increase and decrease the items, remove the product, calculate final price
    cartLogic(){
        // this is referencing the function as we want to do something on clicking it, expample line 154 is referencing the button, here ther's no functionality just hide and show to access DOM elements
        clearCartBtn.addEventListener('click', () =>{
            this.clearCart()
        });

        // cart functionality
        cartContent.addEventListener('click', event =>{

            // if user clicks on remove button then we are going to do one function.
            if(event.target.classList.contains('remove-item')){
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                this.removeItem(id); // removed functionally not from the DOM
                
                // to remove it from DOM we need to traverse to it's parent 
                cartContent.removeChild(removeItem.parentElement.parentElement);
            } else if (event.target.classList.contains('fa-chevron-up')) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;

                //after updating the amount we need to update the locale storage as well 
                Storage.saveCart(cart);
                // update the total as well for the new cart values
                this.setCartValues(cart);

                // update the DOM element with the new number 
                addAmount.nextElementSibling.innerText = tempItem.amount;
            } else if (event.target.classList.contains('fa-chevron-down')){
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if(tempItem.amount > 0){
                    Storage.saveCart(cart);
                    this.setCartValues(cart);    
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                } else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }                
            }
        });
    }

    clearCart(){
        let cartItems = cart.map(item => item.id);
        
        // this removes from the items functionally
        cartItems.forEach(id => this.removeItem(id));

        // remove from the DOM, cartContent is the parent div for cart-items loop over them and remove them
        while(cartContent.children.length>0){
            cartContent.removeChild(cartContent.children[0]);
        }

        // after making the cart empty, we need to close the sidenav as well
        this.hideCart();
    }

    removeItem(id){
        // filters the cart so that it does not have the given the id, hence it updates the cart so that the item is removed.
        cart = cart.filter(item => item.id !== id);

        // does the new calculations for whatever is remaining
        this.setCartValues(cart);

        // update the local storage with new cart items
        Storage.saveCart(cart);

        // now we need to change the button back to Add to cart and enable it for that id which was removed so that it can be added back to the cart
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class = "fas fa-shopping-cart"></i>Add to Cart`
    }

    getSingleButton(id){
        return buttonsDOM.find(button => button.dataset.id === id);
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
        // if loading page for first time return empty array else the items in the cart
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }
}

//The DOMContentLoaded event fires when the initial HTML document has 
//been completely loaded and parsed, without waiting for stylesheets, images, and subframes to finish loading.
document.addEventListener("DOMContentLoaded", () => {
    //inititating instances of classes
    const ui = new UI();
    const products = new Products();
    
    // setup application on page load
    ui.setUpApp();
    
    //get all products and send it to the UI component for rendering
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products); // after retrieveing products we are storing in local storage.
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    });
})