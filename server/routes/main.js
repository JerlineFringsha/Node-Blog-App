const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

router.get('/', async (req, res) => {
    try {
        const locals = {
        title: "Nodejs Blog",
        description: "Welcome to the Home Page"
    };
        let perPage=5;
        let page = req.query.page || 1;
        
        const data = await Post.aggregate([
            { $sort: { createdAt: -1 } },
            { $skip: perPage * page - perPage },
            { $limit: perPage }
        ]).exec();

        const count = await Post.countDocuments({});
        const nextPage =parseInt(page)+1;
        const totalPages = Math.ceil(count / perPage);
        const hasNextPage = nextPage <= totalPages;
        res.render('index', { 
             locals,
             data,
             current: page,
             nextPage: hasNextPage ? nextPage : null,
            // currentRoute: '/'
            });   
    } catch (error) {
        console.error(error);
        res.render('index', { locals, data: [] });
    }
});

router.get('/post/:id', async (req, res) => {
    try {
        const data = await Post.findById(req.params.id);
        const locals = {
            title: data.title,
            description: "Blog Post"
        };
        res.render('post', { 
            locals,
            data,
            // currentRoute: `/post/${slug}`
 });
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
})

/**
 * POST /
 * Post - searchTerm
*/
router.post('/search', async (req, res) => {
    try{
        const locals = {
            title: "Search",
            description: "Search Results"
    }
    let searchTerm = req.body.searchTerm;
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");
    const data = await Post.find({
        $or: [
            { title: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
            { body: { $regex: new RegExp(searchNoSpecialChar, 'i') } }
        ]
    });
    res.render('search', { locals, data, currentRoute: '/' });
}
    catch (error) {
        console.error(error);
        res.render('search', { locals, data: [] });
    }   
});

router.get('/about', (req, res) => {
  res.render('about', { title: 'about', 
    // currentRoute: '/about'
   });
});


module.exports = router;