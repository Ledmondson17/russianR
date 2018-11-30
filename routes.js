module.exports = (app, passport, db) => {

  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', (req, res) => {
    res.render('index.ejs');
  });

  // PROFILE SECTION ========================= function..will only goes thru if prof is logged in
  app.get('/admin', isLoggedIn, (req, res) => {
    db.collection('users').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('admin.ejs', {
        user: req.user,
        money: result
      })
    })
  });

  app.get('/user', (req, res) => {
    db.collection('users').find().toArray((err, results) => {
      if (err) return console.log(err);
      res.render('user.ejs', {
        users: results
      });
    })
  });

  // LOGOUT ============================== ends sec redirects to home page
  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  // message board routes ===============================================================
  //req body sending form data body parser (breaks down form)
  //post sending information (info in req parameter)
  //form makes post to server sends database, req pulls data
  app.post('/user', (req, res) => {
    db.collection('users').save({ name: req.body.name, money: req.body.money }, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/admin')
    })
  })

  //trigger req.
  app.put('/user', (req, res) => {
    db.collection('users')
      .findOneAndUpdate({ user: req.body.user, money: req.body.msg }, {
        $set: {
          thumbUp: req.body.thumbUp + 1
        }
      }, {
          sort: { _id: -1 },
          upsert: true
        }, (err, result) => {
          if (err) return res.send(err)
          res.send(result)
        })
  })

  //============================================
  //SCORE
  //============================================
  app.post('/user', (req, res) => {
    db.collection('users').save({ housewins: req.body.housewin, userwins: req.body.userwin, housecache: req.body.houseCache, usercache: req.body.userCache }, (err, result) => {
      res.redirect('/user')
    })
  })


  app.post('/', (req, res) => {
    db.collection('users').save({ name: req.body.name, money: req.body.money, thumbUp: 0, thumbDown: 0 }, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/admin')
    })
  })

  app.delete('/user', (req, res) => {
    db.collection('users').findOneAndDelete({ user: req.body.name, money: req.body.money }, (err, result) => {
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
  app.get('/login', (req, res) => {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/admin', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', (req, res) => {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/admin', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
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

  app.get('/unlink/local', isLoggedIn, (req, res) => {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save((err) => {
      res.redirect('/admin');
    });
  });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}
