const Cart = require('./cart');
const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

module.exports = class Product{
    constructor(title, imageUrl, description, price){
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save(){
        const db = getDb();
        return db.collection('products').insertOne(this)
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

}