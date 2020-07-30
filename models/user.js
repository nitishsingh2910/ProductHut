const mongodb = require('mongodb');
const Product = require('./product');
const getDb = require('../util/database').getDb;

class User {
    constructor(username, email, cart, id){
        this.name = username;
        this.email = email;
        // if(typeof this.cart == 'undefined'){
        //     this.cart = {items: []};
        // }
        // else{
            this.cart = cart;   // {items: []}
        // }
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
        console.log(this.cart);
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



    getCart() {
        const db = getDb();

        const productIds = [];
        const quantities = {};
        if(typeof this.cart.items != "undefined"){
            this.cart.items.forEach( item => {
                let prodId = item.productId;
                productIds.push(prodId);
                quantities[prodId] = item.quantity;
            });
        }

        return db.collection('products').find({_id: {$in: productIds}}).toArray()
            .then(products => {
                return products.map(product => {
                    return {...product, quantity: quantities[product._id]};
                });
            });
    }

    // getCart() {
    //     const db = getDb();
    //     const productIds = this.cart.items.map(i => {
    //       return i.productId;
    //     });
    //     return db
    //       .collection('products')
    //       .find({ _id: { $in: productIds } })
    //       .toArray()
    //       .then(products => {
    //         return products.map(p => {
    //           return {
    //             ...p,
    //             quantity: this.cart.items.find(i => {
    //               return i.productId.toString() === p._id.toString();
    //             }).quantity
    //           };
    //         });
    //     });
    // }


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


    addOrder(){
        const db = getDb();
        return this.getCart().then(products => {
            const order = {
                items : products,
                user : {
                    _id: new mongodb.ObjectID(this._id),
                    name: this.name,
                    email: this.email
                }
            };
            return db.collection('orders').insertOne(order);
        })
        .then(result => {
            this.cart = {items: []};
            return db.collection('users').updateOne(
            {_id: new mongodb.ObjectId(this._id)}, 
            {$set: {cart: {items: []} } } );
        });
    }

    getOrders() {
        const db = getDb();
        return db.collection('orders').find({'user._id': new mongodb.ObjectID(this._id)}).toArray();
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
}

module. exports = User;