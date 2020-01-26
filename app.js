// Import modules

var express = require("express"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    queryString = require("querystring"), 
    request = require("request"),
    timeout = require("connect-timeout");

// Application setup

var app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(timeout("60s"));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://<username>:<password>@cluster0-0cl3l.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true , useUnifiedTopology: true});


var session = {
    userId: null,
    loggedIn: false
};

// Models

var userSchema = new mongoose.Schema({
    username: {type: String, default: "default_username"},
    password: {type: String, default: "password"},
});

var questionSchema = new mongoose.Schema({
    question_content: {type:String, default:"Question Content"},
    asked_by: {type: String}
});

var choicesSchema = new mongoose.Schema({
    choice_content: {type: String, default:"Choice Content"},
    votes: {type: Number, default:0},
    question_id: {type: String, default:null}
});

var User = mongoose.model("user", userSchema);
var Question = mongoose.model("Question", questionSchema);
var Choices = mongoose.model("Choices", choicesSchema);

// Routes
// ===========================================================

app.get("/", function (req, res) {
    if (session.loggedIn) {
        res.redirect(302, "/index");
    }
    res.render("welcome");
});

// GET Index

app.get("/signup", function(req, res) {
    res.render("signup");
});

app.post("/signup", function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var r = req.body.r;

    if (password !== r) {
        res.redirect(302, "/signup");
    }

    else {
        User.find({
            username: username,
            password: password
        }, function (err, user) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(user);
                if (user.length === 0) {
                    User.create({
                        username: username,
                        password: password
                    }, function (err, user) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log("User creation done");
                            console.log(user);
                            console.log(session);

                            res.redirect("/login");
                        }
                    });
                }
                else {
                    console.log("The user is registered!");
                    res.redirect(302, "/login");
                }
            }
        });
    }
});

app.get("/login", function(req, res) {
    res.render("login");
})

app.post("/login", function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    User.find({
        username: username,
        password: password
    }, function(err, user) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(user);
            console.log(session);
            if (user.length === 0) {
                console.log("Credentials are not right");
                res.redirect(302, "/login");
            }
            else {
                var url = "/landing/" + user[0]._id;
                console.log(url);
                res.redirect(302, url);
            }
        }
    })
});

app.get("/landing/:userId", function(req, res) {

    var userId = req.params.userId;
    console.log(userId);
    User.find({
        _id: userId
    }, function(err, user) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("landing", { user: user[0] })
        }
    });
});

app.get("/index/:userId", function (req, res) {
    var userId = req.params.userId;
    User.find({
        _id: userId
    }, function(err, user) {
        if (err) {
            console.log(err);
        }
        else {
            Question.find({}, function (err, questions) {
                if (err) {
                    console.log(err);
                }
                else {
                    // console.log(questions);

                    // console.log(this.choices);

                    Choices.find({}, function (err, choices) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            questions.reverse();
                            res.render("index", { user: user[0], questions: questions, choices: choices });
                        }
                    });
                }
            });
        }
    });
});

app.get("/new/:userId", function (req ,res) {
    var userId = req.params.userId;
    User.find({
        _id: userId
    }, function(err, user) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("new", {user: user[0]});
        }
    });
});

app.post("/new/:userId", function (req, res) {
    var userId = req.params.userId;
    var question = req.body.question;
    var choices = [req.body.choice1, req.body.choice2, req.body.choice3, req.body.choice4];

    // console.log(question);

    User.find({
        _id: userId
    }, function(err, user) {
        if (err) {
            console.log(err);
        }
        else {
            Question.create({
                question_content: question,
                asked_by: user[0].username
            }, function (err, question) {
                if (err) {
                    console.log(err);
                }
                else {
                    var i = 0;
                    for (i = 0; i < 4; i++) {
                        Choices.create({
                            choice_content: choices[i],
                            votes: 0,
                            question_id: question._id
                        });
                    }
                    res.redirect(302, "/index/" + user[0]._id);
                }
            });
        }
    });
});

app.get("/vote/:choice_id/:userId", function(req, res) {
    var userId = req.params.userId;
    User.find({
        _id: userId
    }, function(err, user) {
        if (err) {
            console.log(err);
        }
        else {
            Choices.find({
                _id: req.params.choice_id
            }, function (err, choice) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log(choice);
                    var updatedVotes = Number(choice[0].votes) + 1;
                    console.log(updatedVotes);
                    Choices.findByIdAndUpdate(
                        req.params.choice_id,
                        { $set: { votes: updatedVotes } }, function (err, choice) {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                console.log(choice);
                            }
                        });
                    res.redirect(302, "/index/" + user[0]._id);
                }
            });
        }
    });
});

app.get("/my_questions/:userId", function(req, res) {
    var userId = req.params.userId;
    User.find({
        _id: userId
    }, function (err, user) {
        if (err) {
            console.log(err);
        }
        else {
            Question.find({}, function (err, questions) {
                if (err) {
                    console.log(err);
                }
                else {
                    // console.log(questions);

                    // console.log(this.choices);

                    Choices.find({}, function (err, choices) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            questions.reverse();
                            res.render("my_questions", { user: user[0], questions: questions, choices: choices });
                        }
                    });
                }
            });
        }
    });
});



// ===========================================================

var port = process.env.PORT || 8000;

app.listen(port, process.env.IP, function (req, res) {
    console.log("The Polls App has started!!!!");
});
