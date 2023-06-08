const order = {
    1:{
        "amount" : 1,
        "currency" : "TWD",
        "packages" : [
            {
                "id" : "1",
                "amount": 1,
                "products" : [
                    {
                        "id" : "PEN-B-001",
                        "name" : "Pen Brown",
                        "imageUrl" : "https://pay-store.line.com/images/pen_brown.jpg",
                        "quantity" : 1,
                        "price" : 1
                    }
                ]
            }
        ]
    },
    2:{
        "amount" : 1200,
        "currency" : "TWD",
        "packages" : [
            {
                "id" : "2",
                "amount": 1200,
                "products" : [
                    {
                        "id" : "PEN-B-00122",
                        "name" : "Pen Brown22",
                        "imageUrl" : "https://pay-store.line.com/images/pen_brown.jpg",
                        "quantity" : 1,
                        "price" : 1200
                    }
                ]
            }
        ]
    }
}
module.exports = order;