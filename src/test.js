const Comment = require('./ecomment')

const config = window.config

if (!config) {
  throw new Error('You need your own config to run this test.')
}

const comment = new Comment(config)

comment.render('container')