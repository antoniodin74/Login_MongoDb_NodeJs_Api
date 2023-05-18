const User = require('../models/Users')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const register = (req, res, next) => {
    bcrypt.hash(req.body.password, 10, function(err, hashedPass) {
        if(err) {
            req.json({
                error: err
            })
        }
        let user = new User ({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            password: hashedPass
        })
        user.save()
        .then(user => {
            res.json({
                message: 'User Added Successfully!'
            })
        })
        .catch(error => {
            res.json({
                message: 'An error occured!'
            })
        })
    })
}

const login = (req, res, next) => {
    var username = req.body.username
    var password = req.body.password

    User.findOne({$or: [{email:username},{phone:username}]})
    .then(user => {
        if(user){
            bcrypt.compare(password, user.password, function(err, result) {
                if(err) {
                    res.json({
                        error: err
                    })
                }
                if(result){
                    let token = jwt.sign({name: user.name}, 'thesecrettoken', {expiresIn: '600s'})
                    let refreshtoken = jwt.sign({name: user.name}, 'refreshtokensecret', {expiresIn: '48h'})
                    res.status(200).json({
                        message: 'Login Successfully!',
                        token: token,
                        refreshtoken
                    })
                }else{
                    res.status(200).json({
                        message: 'Password does not matched!'
                    })
                }
            })
        }else{
            res.status(200).json({
                message: 'No user found!'
            })
        }
    })
}

const refreshToken = (req, res, next) => {
    const refreshToken = req.body.refreshToken
    jwt.verify(refreshToken, 'refreshtokensecret', function(err,decode) {
        if(err) {
            res.status(400).json({
                err
            })
        }
        else {
            let token = jwt.sign( {name: decode.name}, 'thesecrettoken', {expiresIn: '600s'})
            let refreshToken = req.body.refreshToken
            res.status(200).json({
                message: "Token refreshed successfully!",
                token,
                refreshToken
            })
        }
    })
}

module.exports = {
    register,
    login,
    refreshToken
}