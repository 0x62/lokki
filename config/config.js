var config = {
  mail: {
    from: 'noreply@site.com'
  }
}

module.exports = {
  mail: {
    change: {
      from: config.mail.from,
      subject: 'Password changed',
      text: function(email) {
        return 'Hello,\n\n' +
               'This is a confirmation that the password for your account ' + email + ' has just been changed.'
      }
    },
    
    forgot: {
      from: config.mail.from,
      subject: 'Forgotten password',
      text: function(uri, token) {
        return 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
               'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
               'http://' + uri + '/reset/' + token + '\n\n' +
               'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      }
    }
  }
}