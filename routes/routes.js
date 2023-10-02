const express=require('express');
const router=express.Router()
const User=require('../models/users')
const multer=require('multer');
const users = require('../models/users');
const fs=require('fs')

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

router.get('/edit/:id', (req, res) => {
    let id = req.params.id;
    User.findById(id)
        .exec()
        .then((user) => {
            if (!user) {
                res.redirect('/');
            } else {
                res.render('edit_users', {
                    title: 'Edit user',
                    user: user,
                });
            }
        })
        .catch((err) => {
            console.error(err);
            res.redirect('/');
        });
});



//update user route

router.post('/update/:id', upload, async (req, res) => {
    try {
        let id = req.params.id;
        let new_image = '';

        if (req.file) {
            new_image = req.file.filename;
            try {
                fs.unlinkSync('./uploads/' + req.body.old_image);
            } catch (err) {
                console.log(err);
            }
        } else {
            new_image = req.body.old_image;
        }

        await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image,
        });

        req.session.message = {
            type: 'success ',
            message: 'User updated successfully',
        };

        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.json({ message: error.message, type: 'danger' });
    }
});


//delete user route

router.get('/delete/:id', (req, res) => {
    let id = req.params.id;
    
    User.findByIdAndRemove(id)
        .then(result => {
            if (result.image !== "") {
                try {
                    fs.unlinkSync('./uploads/' + result.image);
                } catch (err) {
                    console.log(err);
                }
            }
            req.session.message = {
                type: 'success',
                message: 'User deleted successfully!'
            };
            res.redirect('/');
        })
        .catch(err => {
            res.json({ message: err.message });
        });
});




module.exports=router;;