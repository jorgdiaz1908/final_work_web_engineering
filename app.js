var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var multer = require("multer");
var storage = multer.diskStorage({
    destination: (req, file, callBack)=>{
        callBack(null, './uploads/');
    },
    filename: (req, file, callBack)=>{
        callBack(null, file.originalname);
    }
});

var fileFilter = (req, file, callBack)=>{
    //reject a file
    if(file.mimetype === 'image/jpg' || file.mimetype === 'application/pdf' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/svg'){
        callBack(null, true);
    }else{
        callBack(null, false);
    }
}
var upload = multer({
    storage:storage,
    fileFilter: fileFilter
    });


mongoose.connect("mongodb://localhost/confection_machines_store", { useUnifiedTopology: true, useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use('/uploads',express.static('uploads'));

//SCHEMAS SETUP

var machineSchema = new mongoose.Schema({
    brand: String,
    model: String,
    location: String,
    purchase_price: Number,
    purchase_receipt: String,
    creation_date: {type: Date, default: Date.now()},
    sale_date: {type: Date, default: Date.now()},
    seller: String,
    quantity: Number,
    image: String,
    state: String
});


var Machine = mongoose.model("Machine", machineSchema);

// Machine.create({brand: "marca", 
//                 image: "https://5.imimg.com/data5/KJ/BP/MY-48534858/merritt-popular-sewing-machine-500x500.jpg", 
//                 model: "modelo", 
//                 location: "punto de venta central", 
//                 price: "5000", 
//                 date: "05/08/1995", 
//                 sale_date: "05/08/1995", 
//                 seller: "Alejandro"},(err, product)=>{
//                     if(err){
//                         console.log(err);
//                     }else{
//                         console.log("newly created prodcut: ");
//                         console.log(product);
//                     }
//                 });
                

app.get("/", (req, res)=>{
    res.render("landing");
});

//INDEX ROUTE FOR THE INVENTORY
app.get("/machines", (req, res)=>{
    //get all machines from de DB
    Machine.find({}, (err, machines)=>{
        if(err){
            console.log(err);
        }else{
            //render all the machines in the template
            res.render("machines", {machines:machines})
        }
    });
});

//CREATE ROUTE OR THE INVENTORY--ADD NEW MACHINE
app.post("/machines", upload.fields([{name: 'image', maxCount: 1},{name: 'purchase_receipt', maxCount: 1}]),(req, res)=>{
    //get data from form and add to machines array
    console.log(req.files.purchase_receipt[0]);
    var today = new Date();
    var brand = req.body.brand;
    var state = req.body.state;
    var model = req.body.model;
    var location = req.body.location;
    var purchase_price = req.body.purchase_price;
    var purchase_receipt = req.files.purchase_receipt[0].path;
    var image = req.files.image[0].path;
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var creation_date = new Date(date);
    creation_date.setDate(creation_date.getDate());
    var sale_date = req.body.sale_date;
    var seller = req.body.seller;
    var quantity = req.body.quantity;
    var newMachine = {state:state, brand:brand, quantity:quantity, image: image, model:model, location:location, purchase_price:purchase_price, creation_date:creation_date, sale_date: sale_date, seller:seller, purchase_receipt:purchase_receipt};
    // Create a new machine and save to DB
    Machine.create(newMachine, (err, machine)=>{
        if(err){
            console.log(err);
        }else{
            //redirect back to machines page
            console.log(typeof machine.creation_date);
            console.log(typeof creation_date);
            res.redirect("/machines");
        }
    });
});

//NEW-- SHOW FORM TO CREATE A NEW MACHINE
app.get("/machines/new", (req, res)=>{
    res.render("new");
});

app.listen(3002, ()=>{
    console.log("confection machines server runnin at port 3002");
})