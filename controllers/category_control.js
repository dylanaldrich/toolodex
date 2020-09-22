const express = require('express');
const router = express.Router();
const db = require('../models');
module.exports = router;


/* Base route is /categories */

// new route
router.get('/new', (req, res) => {
    res.render('category/new');
});

// create route
router.post('/', (req, res) => {
    // TODO need to add code to push new category into user's categories array
    db.Category.create(req.body, (error, createdCategory) => {
        if(error) return res.send(error);
        const activeUser = req.session.currentUser;
        //console.log('activeUser:', activeUser);
        createdCategory.user = activeUser.id;
        //console.log('Created category: ', createdCategory);
        createdCategory.save();
        res.redirect('/');
    });
});

// show route (view contents of one category)
router.get('/:id', (req, res) => {
    db.Category.findById(req.params.id)
    .populate('tools')
    .exec( (error, foundCategory) => {
        if(error) return res.send(error);
        const context = {
            category: foundCategory,
        };
        res.render('category/show', context);
    });
});

// edit (form) route
router.get('/:id/edit', async (req, res) => {
    try{
        const userArray = await db.User.find({});
        db.Category.findById(req.params.id)
        .populate('tools')
        .exec( (error, foundCategory) => {
            if(error) return res.send(error);
            const context = {
                category: foundCategory,
                allUsers: userArray,
            };
            res.render('category/edit', context);
        });

    }
    catch(error){
        res.send("category edit route error: "+error);
    }
});

// update route
router.put('/:id', async (req, res) => {

    try {
        const oldCategory = await db.Category.findById(req.params.id);
        const isUserChange = (oldCategory.user != req.params.user);
        if(isUserChange) {
            const oldUser = await db.User.findById(oldCategory.user);
            oldUser.categories.remove(oldCategory);
            oldUser.save();
        }
        const updatedCategory = await db.Category.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if(isUserChange){
            const newUser = await db.User.findById(updatedCategory.user);
            newUser.categories.push(updatedCategory);
            newUser.save();
        }
        res.redirect('/categories/'+req.params.id);

    }

    catch(err){
        res.send("update route error: "+err);
    }
});

// delete route
router.delete('/:id', async (req, res) => {
    try {
        const doomedCategory= await db.Category.findById(req.params.id).populate('tools').exec();
        
        //removes the reference to the category from each associated tool
        const childTools = doomedCategory.tools;
        for(eachTool of childTools){
            eachTool.categories.remove(doomedCategory);
            eachTool.save();
        }

        //removes the reference to the category from its associated User
        const parentUser = doomedCategory.user;
        parentUser.categories.remove(doomedCategory);
        parentUser.save();

        doomedCategory.deleteOne();
        console.log('Deleted category: ', doomedCategory);

        //DK-note: just commented out this now that MTM is running
        //const deletedTools = await db.Tool.deleteMany({ category: deletedCategory._id });

        // redirect to the homepage (aka categories index)
        res.redirect('/');
    } catch (error) {
        return res.send("category deletion route error: "+error);
    }
});

