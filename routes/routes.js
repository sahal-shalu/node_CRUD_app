const express=require('express');
const router=express.Router()
const User=require('../models/users')
const multer=require('multer')

//image upload
var storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./uploads')
    },
 filename:function(req,file,cb){
    cb(null,file.fieldname+"_"+Date.now()+"_"+file.originalname);
 },
})
 var upload=multer({
    storage:storage,
 }).single('image');

 //insert an user into database route

 router.post('/add', upload, (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename,
    });

    user.save()
        .then(() => {
            req.session.message = {
                type: 'success',
                message: 'User added successfully',
            };
            res.redirect('/');
        })
        .catch((err) => {
            res.json({ message: err.message, type: 'danger' });
        });
});


//get all users

router.get('/', (req, res) => {
    User.find()
        .exec()  // Remove the callback function from here
        .then((users) => {
            res.render("index", {
                title: 'Home page',
                users: users,
            });
        })
        .catch((err) => {
            res.json({ message: err.message });
        });
});


router.get('/add',(req,res)=>{
    res.render('add_users',{title:"Add Users"})
})


//Edit an user

router.get('/edit/:id',(req,res)=>{
    let id=req.params.id;
    user.findById(id,(err,user)=>{
        if(err){
            res.redirect('/')

        }else{
            if(user==null){
                res.redirect('/')
            }else{
                res.render('edit_users',{
                    title:'Edit user',
                     user:user,
                })
            }
        }
    })
})




module.exports=router;;