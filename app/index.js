'use strict';

var join = require('path').join;
var yeoman = require('yeoman-generator');
var chalk = require('chalk');

module.exports = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    // setup the test-framework property, Gruntfile template will need this
    this.option('test-framework', {
      desc: 'Test framework to be invoked',
      type: String,
      defaults: 'mocha'
    });
    this.testFramework = this.options['test-framework'];

    this.option('coffee', {
      desc: 'Use CoffeeScript',
      type: Boolean,
      defaults: false
    });
    this.coffee = this.options.coffee;

    this.pkg = require('../package.json');
  },

  askFor: function () {
    var done = this.async();

    // welcome message
    if (!this.options['skip-welcome-message']) {
      this.log(require('yosay')());
      this.log(chalk.magenta(
        'Out of the box I include HTML5 Boilerplate, jQuery, and a ' +
        'Gruntfile.js to build your app.'
      ));
    }

    var prompts = [{
      type: 'checkbox',
      name: 'features',
      message: 'What more would you like?',
      choices: [{
        name: 'Bootstrap',
        value: 'includeBootstrap',
        checked: false
      },{
        name: 'Sass',
        value: 'includeSass',
        checked: true
      },{
        name: 'Modernizr',
        value: 'includeModernizr',
        checked: true
      }]
    }, {
      when: function (answers) {
        return answers && answers.features &&
          answers.features.indexOf('includeSass') !== -1;
      },
      type: 'confirm',
      name: 'libsass',
      value: 'includeLibSass',
      message: 'Would you like to use libsass? Read up more at \n' +
        chalk.green('https://github.com/andrew/node-sass#node-sass'),
      default: false
    }, {
      name: 'clientName',
      message: 'What is the client directory name?',
      default: '0distilled'
    }, {
      name: 'ftpHost',
      message: 'What is the ftp host name?',
      default: 'nbed_ftpHost'
    }, {
      name: 'ftpUsername',
      message: 'What is the ftp username?',
      default: 'nbed_ftpUsername'
    }, {
      name: 'ftpPassword',
      message: 'What is the ftp password?',
      default: 'nbed_ftpPassword'
    }, {
      name: 'title',
      message: 'What is the page meta title?',
      default: 'nbed_metaTitle'
    }, {
      name: 'socialTitle',
      message: 'What is the page social/opengraph title?',
      default: 'nbed_socialTitle'
    }, {
      name: 'desc',
      message: 'What is the page meta description?',
      default: 'nbed_desc'
    }, {
      name: 'socialDesc',
      message: 'What is the page social/opengraph description?',
      default: 'nbed_socialDesc'
    }, {
      name: 'twitter',
      message: 'What is the client\'s twitter handle?',
      default: 'nbed_twitter'
    }, {
      name: 'tweet',
      message: 'What is the tweet text?',
      default: 'nbed_tweet'
    }, {
      name: 'url',
      message: 'What is the page URL? (include trailing slash)',
      default: 'http://nbed_url/'
    }, {
      type: 'checkbox',
      name: 'social',
      message: 'What type of social buttons would you like?',
      choices: [{
        name: 'SocialLikes',
        value: 'includeSocialLikes',
        checked: true
      },{
        name: 'Addthis',
        value: 'includeAddthis',
        checked: false
      }]
    }];

    this.prompt(prompts, function (answers) {
      var features = answers.features;

      function hasFeature(feat) {
        return features && features.indexOf(feat) !== -1;
      }

      this.includeSass = hasFeature('includeSass');
      this.includeBootstrap = hasFeature('includeBootstrap');
      this.includeModernizr = hasFeature('includeModernizr');

      this.includeLibSass = answers.libsass;
      this.includeRubySass = !answers.libsass;
      this.clientName = answers.clientName;
      this.ftpHost = answers.ftpHost;
      this.ftpUsername = answers.ftpUsername;
      this.ftpPassword = answers.ftpPassword;

      this.title = answers.title;
      this.socialTitle = answers.socialTitle;
      this.desc = answers.desc;
      this.socialDesc = answers.socialDesc;
      this.socialDesc = answers.socialDesc;
      this.twitter = answers.twitter;
      this.tweet = answers.tweet;
      this.url = answers.url;

      var social = answers.social;
      function hasSocial(s) {
        return social && social.indexOf(s) !== -1;
      }
      this.includeSocialLikes = hasSocial('includeSocialLikes');
      this.includeAddthis = hasSocial('includeAddthis');

      done();
    }.bind(this));
  },

  gruntfile: function () {
    this.template('Gruntfile.js');
  },

  packageJSON: function () {
    this.template('_package.json', 'package.json');
  },

  git: function () {
    this.template('gitignore', '.gitignore');
    this.copy('gitattributes', '.gitattributes');
  },

  ftpauth: function () {
    this.template('ftpauth', '.ftpauth');
  },

  bower: function () {
    var bower = {
      name: this._.slugify(this.appname),
      private: true,
      dependencies: {}
    };

    if (this.includeBootstrap) {
      var bs = 'bootstrap' + (this.includeSass ? '-sass-official' : '');
      bower.dependencies[bs] = "~3.2.0";
    } else {
      bower.dependencies.jquery = "~1.11.1";
    }

    if (this.includeModernizr) {
      bower.dependencies.modernizr = "~2.8.2";
    }

    bower.dependencies.respond = "~1.4.2";

    if (this.includeSocialLikes) {
      bower.dependencies["social-likes"] = "~3.0.4";
      bower.overrides = {};
      bower.overrides["social-likes"] = {};
      bower.overrides["social-likes"].main = "./src/social-likes.js";
    }

    this.copy('bowerrc', '.bowerrc');
    this.write('bower.json', JSON.stringify(bower, null, 2));
  },

  jshint: function () {
    this.copy('jshintrc', '.jshintrc');
  },

  editorConfig: function () {
    this.copy('editorconfig', '.editorconfig');
  },

  stylesheets: function () {
    var self = this;
    function css(file,prefix){
      prefix = prefix || '';
      var css = file + '.' + (self.includeSass ? 's' : '') + 'css';
      self.template(css, 'app/styles/' + prefix + css);
    }
    css('main');
    css('base','_');
    css('social','_');
    if(this.includeSocialLikes){
      css('fontface','_');
    }
  },

  writeIndex: function () {
    this.indexFile = this.engine(
      this.readFileAsString(join(this.sourceRoot(), 'index.html')),
      this
    );

    // wire Bootstrap plugins
    if (this.includeBootstrap && !this.includeSass) {
      var bs = 'bower_components/bootstrap/js/';

      this.indexFile = this.appendFiles({
        html: this.indexFile,
        fileType: 'js',
        optimizedPath: 'scripts/plugins.js',
        sourceFileList: [
          bs + 'affix.js',
          bs + 'alert.js',
          bs + 'dropdown.js',
          bs + 'tooltip.js',
          bs + 'modal.js',
          bs + 'transition.js',
          bs + 'button.js',
          bs + 'popover.js',
          bs + 'carousel.js',
          bs + 'scrollspy.js',
          bs + 'collapse.js',
          bs + 'tab.js'
        ],
        searchPath: '.'
      });
    }

    this.indexFile = this.appendFiles({
      html: this.indexFile,
      fileType: 'js',
      optimizedPath: 'scripts/main.js',
      sourceFileList: ['scripts/main.js'],
      searchPath: ['app', '.tmp']
    });
  },

  app: function () {
    this.directory('app');
    this.mkdir('app/scripts');
    this.mkdir('app/styles');
    this.mkdir('app/styles/fonts');
    this.mkdir('app/images');
    this.mkdir('app/social');
    this.write('app/index.html', this.indexFile);

    if (this.coffee) {
      this.copy('main.coffee', 'app/scripts/main.coffee');
    }
    else {
      this.copy('main.js', 'app/scripts/main.js');
    }
  },

  fonts: function () {
    var self = this;
    function copyFont(ext){
      self.copy('fontello.'+ext, 'app/styles/fonts/fontello.'+ext);
    }
    ['eot','svg','ttf','woff'].forEach(copyFont);
  },

  install: function () {
    this.on('end', function () {
      this.invoke(this.options['test-framework'], {
        options: {
          'skip-message': this.options['skip-install-message'],
          'skip-install': this.options['skip-install'],
          'coffee': this.options.coffee
        }
      });

      if (!this.options['skip-install']) {
        this.installDependencies({
          skipMessage: this.options['skip-install-message'],
          skipInstall: this.options['skip-install']
        });
      }
    });
  }
});
