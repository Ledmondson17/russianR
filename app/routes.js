module.exports = (app, passport, db) => {

  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', (req, res) => {
    console.log("one");
    res.render('index.ejs');
  });

  // PROFILE SECTION ========================= function..will only goes thru if prof is logged in
  app.get('/admin', isLoggedIn, (req, res) => {
    console.log("two");
    db.collection('casino').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('admin.ejs', {
        user: req.user,
        bet: result
      })
    })
  });

  app.get('/', (req, res) => {
    console.log("three");
    db.collection('casino').find().toArray((err, results) => {
      if (err) return console.log(err);
      res.render('/')
    })
  });

  // LOGOUT ============================== ends sec redirects to home page
  app.get('/logout', (req, res) => {
    console.log("four");
    req.logout();
    res.redirect('/');
  });

  // message board routes ===============================================================
  //req body sending form data body parser (breaks down form)
  //post sending information (info in req parameter)
  //form makes post to server sends database, req pulls data
  app.post('/index', (req, res) => {
    console.log("imma catdaddy");
    db.collection('casino').save({ name: req.body.name, bet: req.body.bet }, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/index')
    })
  })

  //trigger req.
  app.put('/index', (req, res) => {
    db.collection('casino')
      .findOneAndUpdate({ user: req.body.user, bet: req.body.bet }, {
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
  // app.post('/', (req, res) => {
  //   db.collection('casino').save({ housewins: req.body.housewin, userwins: req.body.userwin, housecache: req.body.houseCache, usercache: req.body.userCache }, (err, result) => {
  //     res.redirect('/')
  //   })
  // })

  app.delete('/index', (req, res) => {
    db.collection('casino').findOneAndDelete({ user: req.body.name, bet: req.body.bet }, (err, result) => {
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

  res.redirect('/index');
}
