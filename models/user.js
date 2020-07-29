const mongodb = require('mongodb');
const Product = require('./product');
const getDb = require('../util/database').getDb;

class User {
    constructor(username, email, cart, id){
        this.name = username;
        this.email = email;
        this.cart = cart;   // {items: []}
        this._id = id
    }

    save(){
        const db = getDb();
        db.collection('users').insertOne(this)
            .then(user => {
                console.log(user);
            })
            .catch(err => {
                console.log(err);
            });
    }

    addToCart(product){
        // cp --> cartProduct
        //find index will return -1 if not found, 
        //if found then it will return the index of that product which eventually means
        // that the product is already there in the cart
        const cartProductIndex = this.cart.items.findIndex(cp => {
            return cp.productId.toString() === product._id.toString();
        });

        let newQuantity = 1;
        
        const updatedCartItems = [...this.cart.items];

        if(cartProductIndex >= 0){
            newQuantity = this.cart.items[cartProductIndex].quantity + 1;
            updatedCartItems[cartProductIndex].quantity = newQuantity;
        }
        else{
            updatedCartItems.push({productId: new mongodb.ObjectId(product._id), quantity: newQuantity});
        }

        const updatedCart = {items: updatedCartItems};

        const db = getDb();
        return db.collection('users').updateOne(
            {_id: new mongodb.ObjectId(this._id)}, 
            {$set: {cart: updatedCart}} );
    }

    static findById(userId){
        const db = getDb();
        return db.collection('users').findOne({_id: new mongodb.ObjectID(userId)})
            .then(user => {
                console.log(user);
                return user;
            })
            .catch(err => {
                console.log(err);
            });
    }

    getCart() {
        const db = getDb();

        const productIds = [];
        const quantities = {};

        this.cart.items.forEach( item => {
            let prodId = item.productId;
            productIds.push(prodId);
            quantities[prodId] = item.quantity;
        });

        return db.collection('products').find({_id: {$in: productIds}}).toArray()
            .then(products => {
                return products.map(product => {
                    return {...product, quantity: quantities[product._id]};
                });
            });
    }

    deleteItemFromCart(productId){
        const updatedCartItems = this.cart.items.filter(item => {
            return item.productId.toString() !== productId.toString();
        });

        const updatedCart = {items: updatedCartItems};

        const db = getDb();
        return db.collection('users').updateOne(
            {_id: new mongodb.ObjectId(this._id)}, 
            {$set: {cart: updatedCart}} );
    }
}

module. exports = User;