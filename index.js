var util = require('util')
  , Resource = require('deployd/lib/resource')
  , express = require('express')
  , path = require('path');
  
function Express(name, options) {
  Resource.apply(this, arguments);
  var app = this.app = express()
    , exp = this;
  
  // handle all routes
  this.path = '/';
  this.name=name;
  
  app.set('views', path.join(path.resolve('.'), options.configPath, 'views'));
}

Express.events = ['init'];

util.inherits(Express, Resource);
module.exports = Express;

Express.prototype.handle = function (ctx, next) {

  if (ctx.url.indexOf('/' + this.name) === 0) {
      var e = this;
      if(e.events && e.events.init) {
        
        var domain = {
            app: e.app
          , require: function () {
            return require.apply(module, arguments);
          }
        }
        
        e.events.init.run({}, domain);
        
        e.app.use(function (req, res) {
          res._finished = true;
        });
      }

    ctx.req.dpd = ctx.dpd;
    ctx.req.me = ctx.session && ctx.session.user;
    this.app.call(this.server, ctx.req, ctx.res);
    if(ctx.res._finished) {
      next();
    }
  } else {
    Resource.prototype.handle.apply(this, arguments);
  }
}



