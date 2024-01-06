var express = require('express');
var router = express.Router();
let passport = require("passport")
let passportlocal = require("passport-local")
const POST = require('../models/post_models');
const CATEGORI = require('../models/categori_models');
const USER = require('../models/users_models');
const upload = require("../multer/multer")
let slugfield = require("url-slug")
let nodemailer = require("nodemailer")

passport.use(new passportlocal(USER.authenticate()))

// router.get('/', async function (req, res, next) {
//   try {
//     let data = await CATEGORI.create({
//       cat_name: "Lifestyle",
//     })
//     if (!data) {
//       throw new Error("please enter valid data")
//     }
//     res.status(200).json({
//       status: "success",
//       message: "all data",
//       data: data
//     })
//   } catch (error) {
//     res.status(404).json({
//       status: "fail",
//       message: error.message
//     })
//   }
// });

router.post('/api/gmail', async (req, res) => {
  try {
  console.log(req.body);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'khushalmakwana786@gmail.com',
      pass: 'tpjj mcuq tbuf aauq'
    }
  });
  const mailOptions = {
    from: 'khushalmakwana786@gmail.com',
    to: req.body.gmail,
    subject: 'Hello!',
    html  : '<h2>Hello I am Khushal</h2>Visit my PortFolio ( <a href="https://portfolio-khushal-makwana.netlify.app/">PortFolio</a> ) <br><h4>This is My Resume</h4> <br> <img src="http://res.cloudinary.com/dgcqvuu01/image/upload/v1704518736/dregc45x0nvs44iiwmaf.jpg"/> <br><br> Thank you for Visiting my Website'
  };
  
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
})


router.get("/api/category", async (req, res) => {
  let PageNo = Number(req.query.page) || 1
  let limit = Number(5)
  let data = await POST.find({ categori: req.query.id }).skip((PageNo - 1) * limit).limit(4)

  try {
    res.status(201).json({
      status: "success",
      data: data
    })
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: "not found category"
    })
  }
})

// show categori post
router.get("/api/AdminPanel/:cat_name", async (req, res) => {
  const catName = req.params.cat_name;
  try {
    // Query the database using Mongoose (assuming CATEGORI is a Mongoose model)
    let data = await CATEGORI.find({ cat_name: catName }).populate("posts");
    // If no data is found, throw an error
    if (!data || data.length === 0) {
      throw new Error("Data not found");
    }
    // Respond with a JSON object containing the retrieved data
    res.status(201).json({
      status: "success",
      message: "Data available",
      data: data,
    });
  } catch (error) {
    // If an error occurs during the database query or other processing
    res.status(404).json({
      status: "fail",
      message: "Failed to retrieve data",
      error: error.message, // Include the error message in the response
    });
  }
});

// find by id and delete
router.delete("/api/posts/:postid", async (req, res) => {
  try {
    const deletedPost = await POST.findByIdAndDelete(req.params.postid);
    let del_p_cat = await deletedPost.categori
    await CATEGORI.updateOne(
      { "_id": del_p_cat },
      { $pull: { "posts": deletedPost._id } }
    )
    // console.log(ccc + "acccc");
    if (deletedPost) {
      // console.log('Deleted Post:', deletedPost);
      res.status(200).json({ message: 'Post deleted successfully' });
    } else {
      console.log('Post not found');
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// get data to update page
router.get("/admin/posts/update/:id", async (req, res) => {
  const id = req.params.id
  try {
    const post = await POST.findOne({ _id: id });
    if (!post) {
      return res.status(404).json({ message: "Post Not Found" });
    }
    res.status(200).json({
      message: "Success",
      data: post
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      // message: error.message,
    });
  }
});

router.post("/admin/posts/update/:id", upload.fields([
  { name: 'post_img1', maxCount: 1 },
  { name: 'post_img2', maxCount: 1 },
  { name: 'post_img3', maxCount: 1 },
  { name: 'post_img4', maxCount: 1 },
  { name: 'post_img5', maxCount: 1 },
  { name: 'post_img6', maxCount: 1 },
]), async (req, res) => {
  const id = req.params.id;
  try {
    const post = await POST.findById({ _id: id });

    if (!post) {
      return res.status(404).json({ message: "Post Not Found" });
    }
    // console.log(post.description_1 + "main heading olg");
    // Update other fields
    post.main_heading = req.body.main_heading || post.main_heading;
    post.description_1 = req.body.description_1 || post.description_1;
    post.description_2 = req.body.description_2 || post.description_2;
    post.description_3 = req.body.description_3 || post.description_3;
    post.description_4 = req.body.description_4 || post.description_4;

    // console.log(post.description_1 + "new main heading");

    // Update image fields if files are uploaded
    if (req.files) {
      post.post_img1 = req.files['post_img1'] ? req.files['post_img1'][0].filename : post.post_img1;
      post.post_img2 = req.files['post_img2'] ? req.files['post_img2'][0].filename : post.post_img2;
      post.post_img3 = req.files['post_img3'] ? req.files['post_img3'][0].filename : post.post_img3;
      post.post_img4 = req.files['post_img4'] ? req.files['post_img4'][0].filename : post.post_img4;
      post.post_img5 = req.files['post_img5'] ? req.files['post_img5'][0].filename : post.post_img5;
      post.post_img6 = req.files['post_img6'] ? req.files['post_img6'][0].filename : post.post_img6;
    }

    // Save the updated post
    const updatedPost = await post.save();
    res.status(200).json({
      message: "Success",
      data: updatedPost
    });

  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
});

// create post
router.post('/api/posts/create', upload.fields([
  { name: 'post_img1', maxCount: 1 }, 
  { name: 'post_img2', maxCount: 1 }, 
  { name: 'post_img3', maxCount: 1 }, 
  { name: 'post_img4', maxCount: 1 }, 
  { name: 'post_img5', maxCount: 1 }, 
  { name: 'post_img6', maxCount: 1 }]), async (req, res) => {

    try {
    let category11 = await CATEGORI.findById(req.query.id)

    let slug = slugfield.convert(req.body.main_heading)
    // File paths for the uploaded images
    const post_img1 = req.files['post_img1'][0].filename;
    const post_img2 = req.files['post_img2'][0].filename;
    const post_img3 = req.files['post_img3'][0].filename;
    const post_img4 = req.files['post_img4'][0].filename;
    const post_img5 = req.files['post_img5'][0].filename;
    const post_img6 = req.files['post_img6'][0].filename;

    // Create a new post using the PostSchema
    const newPost = new POST({
      post_img1: post_img1,
      main_heading: req.body.main_heading,
      description_1: req.body.description_1,
      post_img2: post_img2,
      description_2: req.body.description_2,
      post_img3: post_img3,
      description_3: req.body.description_3,
      post_img4: post_img4,
      post_img5: post_img5,
      description_4: req.body.description_4,
      post_img6: post_img6,
      slug: slug,
      categori: category11._id,
      cat_name: category11.cat_name
    });
    // Save the post to the database
    await newPost.save();
    await category11.posts.push(newPost._id);
    await category11.save();
    // Send a success response
    res.status(200).json({ message: 'Post created successfully' });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get("/api/posts", async (req, res) => {
  try {
    let allpost = await POST.find().sort({ _id: -1 });
    if (!allpost) {
      throw new Error("post not found")
    }
    res.status(200).json({
      status: "success",
      data: allpost
    })
  } catch (error) {
    res.status(500).json({
      status: " fail999 ",
      message: error.message
    })
  }
})

router.post("/api/fullpost", async (req, res) => {
  try {
    let data = await POST.findById(req.query.id)
    if (!data) {
      throw new Error("post not available")
    }
    res.status(200).json({
      status: "success",
      data: data
    })
  } catch (error) {
    res.status(200).json({
      status: "success",
      message: error.message
    })
  }
})

// all category
router.get("/api/allcategory", async (req, res) => {
  try {
    let data = await CATEGORI.find()
    res.status(200).json({
      status: "success",
      data: data
    })
  } catch (error) {
    res.status(200).json({
      status: "fail",
      message: error.message
    })
  }
})

// search
router.get("/api/search", async (req, res) => {
  try {
    let regex = new RegExp(req.query.search, "i")
    let data = await POST.find({
      $or: [
        { main_heading: regex },
        { cat_name: regex }
      ]
    })
    res.status(200).json({
      status: "success",
      data: data
    })
  } catch (error) {
    res.status(200).json({
      status: "fail",
      message: error.message
    })
  }
})

// pagination
router.get("/api/page", async (req, res) => {
  let PageNo = Number(req.query.page || 1);
  let limit = parseInt(req.query.limit) || 10;
  try {
    let Post = await POST.find().skip((PageNo - 1) * limit).limit(limit)
    res.status(200).json({
      message: "success",
      data: Post
    })
  } catch (error) {
    res.status(400).json({
      message: "fail",
      message: error.message
    })
  }
})

// Authentication System
router.get('/register', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

// router.get('/login', function(req, res, next) {
//   res.render('login', { title: 'Express' });
// });

router.get('/profile', isLoggedIn, async function (req, res, next) {
  res.render('profile');
});

// admin panel

router.post('/register', function (req, res) {
  try {
    if (!req.body.username | !req.body.password) {
      throw new Error("please enter valid details")
    }
    let userdata = new USER({
      username: req.body.username,
      secret: req.body.secret

    })
    USER.register(userdata, req.body.password)
      .then(function (registereduser) {
        passport.authenticate("local")(req, res, function () {
          res.status(201).json({
            status: "success",
            message: "you are registered",
          })
        })
      })
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message
    })
  }
});

router.post('/api/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }

    if (!user) {
      return res.status(401).json({ status: 'fail', message: 'Authentication failed' });
    }

    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
      }
      console.log("login user");
      // If authentication is successful, return a success JSON response
      return res.status(200).json({ status: 'success', message: 'Authentication successful', user });
    });
  })(req, res, next);
});

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect("/login")
  })
})

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/")
}

//  admin routes
router.get('/api/admin', async (req, res) => {
  // Check if the user is an admin
  if (req.user && req.user.isAdmin) {
    try {
      const data = {
        totalPosts: await POST.countDocuments(),
        totalCategories: await CATEGORI.countDocuments(),
        totalUsers: await USER.countDocuments(),
      };
      let allCategories = await CATEGORI.find({});
      res.json({ success: true, data, allCategories });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  } else {
    res.status(403).json({ success: false, error: 'Unauthorized' });
  }
});

module.exports = router;
