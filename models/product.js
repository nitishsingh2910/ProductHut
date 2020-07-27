const Cart = require('./cart');
const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

module.exports = class Product{
    constructor(title, imageUrl, description, price, id){
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
        this._id = id ? new mongodb.ObjectID(id) : null;
    }

    save(){
        const db = getDb();
        let dbOp;
        if(this._id){
            // update the product
            dbOp = db.collection('products').updateOne({_id: this._id}, {$set: this});
        }
        else{
            dbOp = db.collection('products').insertOne(this);
        }
        return dbOp
            .then(result => {
                console.log(result);
            })
            .catch(err => {
            console.log(err);
        });
    }

    static fetchAll(cb){
        const db = getDb();
        return db.collection('products').find().toArray()
            .then(products => {
                console.log(products);
                return products;
            })
            .catch(err => {
                console.log(err);
            });
    }

    static findById(prodId){
        const db = getDb();
        return db.collection('products').findOne({_id: mongodb.ObjectID(prodId)})
            .then(product => {
                console.log(product);
                return product;
            })
            .catch(err => {
                console.log(err);
            });
    }

    static deleteById(prodId){
        const db = getDb();
        return db.collection('products').deleteOne({_id: new mongodb.ObjectID(prodId)})
            .then(result => {
                console.log('Deleted Product');
            })
            .catch(err => {
                console.log(err);
            });
    }

}