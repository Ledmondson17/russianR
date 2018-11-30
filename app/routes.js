module.exports = function(app, passport, db) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    // app.get('/index', function(req, res) {
    //   db.collection('users').find().toArray((err, result) => {
    //       if (err) return console.log(err)
    //       console.log(req.user)
    //       console.log(result)
    //       res.render('index.ejs', {
    //         user : req.user,
    //         messages: result
    //       })
    //     })
    // });

    app.get('/', function(req, res){
      res.render('index.ejs');
    })

    // PROFILE SECTION ========================= function..will only goes thru if prof is logged in
    app.get('/profile', isLoggedIn, function(req, res) {
        db.collection('messages').find().toArray((err, result) => {
          if (err) return console.log(err)
          res.render('profile.ejs', {
            user : req.user,
            messages: result
          })
        })
    });

    app.get('/score', (req, res) => {
      db.collection('users').find().toArray((err, results) => {
        if(err) return console.log(err);
        res.render('score.ejs', {
          score: results
        });
      })
    });

    // LOGOUT ============================== ends sec redirects to home page
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// message board routes ===============================================================
//req body sending form data body parser (breaks down form)
//post sending information (info in req parameter)
//form makes post to server sends database, req pulls data
    // app.post('/messages', (req, res) => {
    //   db.collection('messages').save({name: req.body.name, msg: req.body.msg, thumbUp: 0, thumbDown:0}, (err, result) => {
    //     if (err) return console.log(err)
    //     console.log('saved to database')
    //     res.redirect('/profile')
    //   })
    // })

    // app.post('/user', (req, res) => {
    //   db.collection('users').save({name: req.body.name, total: req.body.total}, (err, result) => {
    //     if (err) return console.log(err)
    //     console.log('saved to database')
    //     res.redirect('/index')
    //   })
    // })

//trigger req.
    app.put('/messages', (req, res) => {
      db.collection('messages')
      .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
        $set: {
          thumbUp:req.body.thumbUp + 1
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

    //============================================
    //SCORE
    //============================================
    app.post('/score', (req,res) => {
      db.collection('users').save({housewins:req.body.housewin, userwins:req.body.userwin, housecache:req.body.houseCache, usercache:req.body.userCache}, (err, result) => {
        res.redirect('/score')
      })
    })


    app.post('/messages', (req, res) => {
      db.collection('messages').save({name: req.body.name, msg: req.body.msg, thumbUp: 0, thumbDown:0}, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/profile')
      })
    })

    app.delete('/messages', (req, res) => {
      db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
        if (err) return res.send(500, err)
        res.send('Message deleted!')
      })
    })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login',passport.authenticate('local-login', {
            successRedirect : '/admin', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local --------------------------------- undefined by email,psswrd)(morally ethical way to fully delete an account) ->
   //some sites save info by setting boolean to false but ur subject to hacks n being re-targeted with future ads running against u.
   //fb uses machine algorithms to know everything about you target an push ads ,faragade pocket for privacy, blocking all asignals

    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
