const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    // name: {
    //     type: String,
    //     required: true
    // },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    cart: {
        items: [{
            productId: {type: Schema.Types.ObjectId, ref: 'Product', required: true}, 
            quantity: {type: Number, required: true}
        }]
    }
});

userSchema.methods.addToCart = function(product) {

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
        updatedCartItems.push({productId: product._id, quantity: newQuantity});
    }

    const updatedCart = {items: updatedCartItems};
    this.cart = updatedCart;
    return this.save();
}

userSchema.methods.removeFromCart = function(productId) {
    const updatedCartItems = this.cart.items.filter(item => {
        return item._id.toString() !== productId.toString();
    });
    console.log(updatedCartItems);
    this.cart.items = updatedCartItems;
    return this.save();
}

userSchema.methods.clearCart = function() {
    this.cart = {items: []}
    return this.save();
}

module.exports = mongoose.model('User', userSchema);



//     addOrder(){
//         const db = getDb();
//         return this.getCart().then(products => {
//             const order = {
//                 items : products,
//                 user : {
//                     _id: new mongodb.ObjectID(this._id),
//                     name: this.name,
//                     email: this.email
//                 }
//             };
//             return db.collection('orders').insertOne(order);
//         })
//         .then(result => {
//             this.cart = {items: []};
//             return db.collection('users').updateOne(
//             {_id: new mongodb.ObjectId(this._id)}, 
//             {$set: {cart: {items: []} } } );
//         });
//     }

//     getOrders() {
//         const db = getDb();
//         return db.collection('orders').find({'user._id': new mongodb.ObjectID(this._id)}).toArray();
//     }

//     static findById(userId){
//         const db = getDb();
//         return db.collection('users').findOne({_id: new mongodb.ObjectID(userId)})
//             .then(user => {
//                 console.log(user);
//                 return user;
//             })
//             .catch(err => {
//                 console.log(err);
//             });
//     }
// }

// module. exports = User;