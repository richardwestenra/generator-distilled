'use strict';
var generators = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var wiredep = require('wiredep');
var mkdirp = require('mkdirp');
var _s = require('underscore.string');

module.exports = generators.Base.extend({
  constructor: function () {
    var testLocal;

    generators.Base.apply(this, arguments);

    this.option('skip-welcome-message', {
      desc: 'Skips the welcome message',
      type: Boolean
    });

    this.option('skip-install-message', {
      desc: 'Skips the message after the installation of dependencies',
      type: Boolean
    });

    // setup the test-framework property, Gruntfile template will need this
    this.option('test-framework', {
      desc: 'Test framework to be invoked',
      type: String,
      defaults: 'mocha'
    });

    this.option('babel', {
      desc: 'Use Babel',
      type: Boolean,
      defaults: true
    });

    if (this.options['test-framework'] === 'mocha') {
      testLocal = require.resolve('generator-mocha/generators/app/index.js');
    } else if (this.options['test-framework'] === 'jasmine') {
      testLocal = require.resolve('generator-jasmine/generators/app/index.js');
    }

    this.composeWith(this.options['test-framework'] + ':app', {
      options: {
        'skip-install': this.options['skip-install']
      }
    }, {
      local: testLocal
    });
  },

  initializing: function () {
    this.pkg = require('../package.json');
  },

  askFor: function () {
    var done = this.async();

    if (!this.options['skip-welcome-message']) {
      this.log(yosay('\'Allo \'allo! Out of the box I include HTML5 Boilerplate, jQuery, and a Gruntfile to build your app.'));
    }

    var prompts = [{
      type: 'checkbox',
      name: 'features',
      message: 'What more would you like?',
      choices: [{
        name: 'Sass',
        value: 'includeSass',
        checked: true
      }, {
        name: 'Bootstrap',
        value: 'includeBootstrap',
        checked: false
      }, {
        name: 'Modernizr',
        value: 'includeModernizr',
        checked: true
      }]
    }, {
      name: 'clientName',
      message: 'What is the client directory name?',
      default: '0distilled'
    }, {
      name: 'sshHost',
      message: 'What is the ssh host name?',
      default: 'nbed_sshHost'
    }, {
      name: 'sshUsername',
      message: 'What is the ssh username?',
      default: 'nbed_sshUsername'
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
      type: 'confirm',
      name: 'includeJQuery',
      message: 'Would you like to include jQuery?',
      default: true,
      when: function (answers) {
        return answers.features.indexOf('includeBootstrap') === -1;
      }
    }];

    this.prompt(prompts, function (answers) {
      var features = answers.features;

      function hasFeature(feat) {
        return features && features.indexOf(feat) !== -1;
      }

      this.includeSass = hasFeature('includeSass');
      this.includeBootstrap = hasFeature('includeBootstrap');
      this.includeModernizr = hasFeature('includeModernizr');
      this.includeJQuery = answers.includeJQuery;

      this.clientName = answers.clientName;
      this.sshHost = answers.sshHost;
      this.sshUsername = answers.sshUsername;

      this.title = answers.title;
      this.socialTitle = answers.socialTitle;
      this.desc = answers.desc;
      this.socialDesc = answers.socialDesc;
      this.twitter = answers.twitter;
      this.tweet = answers.tweet;
      this.url = answers.url;
      done();
    }.bind(this));
  },

  writing: {
    gruntfile: function () {
      this.fs.copyTpl(
        this.templatePath('Gruntfile.js'),
        this.destinationPath('Gruntfile.js'),
        {
          pkg: this.pkg,
          appname: this.appname,
          clientName: this.clientName,
          sshHost: this.sshHost,
          sshUsername: this.sshUsername,
          includeSass: this.includeSass,
          includeBootstrap: this.includeBootstrap,
          includeModernizr: this.includeModernizr,
          testFramework: this.options['test-framework'],
          useBabel: this.options['babel']
        }
      );
    },

    packageJSON: function () {
      this.fs.copyTpl(
        this.templatePath('_package.json'),
        this.destinationPath('package.json'),
        {
          includeSass: this.includeSass,
          includeModernizr: this.includeModernizr,
          includeJQuery: this.includeBootstrap || this.includeJQuery,
          testFramework: this.options['test-framework'],
          useBabel: this.options['babel']
        }
      )
    },

    git: function () {
      this.fs.copy(
        this.templatePath('gitignore'),
        this.destinationPath('.gitignore')
      );

      this.fs.copy(
        this.templatePath('gitattributes'),
        this.destinationPath('.gitattributes')
      );
    },

    bower: function () {
      var bowerJson = {
        name: _s.slugify(this.appname),
        private: true,
        dependencies: {}
      };

      bowerJson.dependencies.respond = "~1.4.2";

      bowerJson.dependencies["social-likes"] = "~3.0.4";
      bowerJson.overrides = {};
      bowerJson.overrides["social-likes"] = {};
      bowerJson.overrides["social-likes"].main = "./src/social-likes.js";

      if (this.includeBootstrap) {
        if (this.includeSass) {
          bowerJson.dependencies['bootstrap-sass'] = '~3.3.5';
          bowerJson.overrides = {
            'bootstrap-sass': {
              'main': [
                'assets/stylesheets/_bootstrap.scss',
                'assets/fonts/bootstrap/*',
                'assets/javascripts/bootstrap.js'
              ]
            }
          };
        } else {
          bowerJson.dependencies['bootstrap'] = '~3.3.5';
          bowerJson.overrides = {
            'bootstrap': {
              'main': [
                'less/bootstrap.less',
                'dist/css/bootstrap.css',
                'dist/js/bootstrap.js',
                'dist/fonts/*'
              ]
            }
          };
        }
      } else if (this.includeJQuery) {
        bowerJson.dependencies['jquery'] = '~1.11.3';
      }

      if (this.includeModernizr) {
        bowerJson.dependencies['modernizr'] = '~2.8.3';
      }

      this.fs.writeJSON('bower.json', bowerJson);
      this.fs.copy(
        this.templatePath('bowerrc'),
        this.destinationPath('.bowerrc')
      );
    },

    jshint: function () {
      this.fs.copyTpl(
        this.templatePath('jshintrc'),
        this.destinationPath('.jshintrc'),
        {
          testFramework: this.options['test-framework']
        }
      );
    },

    readme: function () {
      this.copy('readme.md', 'readme.md');
    },
    editorConfig: function () {
      this.fs.copy(
        this.templatePath('editorconfig'),
        this.destinationPath('.editorconfig')
      );
    },

    scripts: function () {
      this.fs.copy(
        this.templatePath('main.js'),
        this.destinationPath('app/scripts/main.js')
      );
    },

    styles: function () {
      var ext = this.includeSass ? '.scss' : '.css';
      var prefix = this.includeSass ? '_' : '';

      this.fs.copyTpl(
        this.templatePath('main'+ext),
        this.destinationPath('app/styles/main'+ext),
        {
          includeBootstrap: this.includeBootstrap
        }
      );
      this.fs.copyTpl(
        this.templatePath('base'+ext),
        this.destinationPath('app/styles/'+prefix+'base'+ext)
      );
      this.fs.copyTpl(
        this.templatePath('social'+ext),
        this.destinationPath('app/styles/'+prefix+'social'+ext)
      );
      this.fs.copyTpl(
        this.templatePath('fontface'+ext),
        this.destinationPath('app/styles/'+prefix+'fontface'+ext)
      );
    },

    fonts: function () {
      var fontfiles = [
        'fontello.eot',
        'fontello.svg',
        'fontello.ttf',
        'fontello.woff',
        'config.json'
      ];

      fontfiles.forEach(function (file){
        // Use old-style copy method because the new one corrupts webfonts
        this.copy(file, 'app/styles/fonts/'+file);
      }.bind(this) );
    },

    html: function () {
      var bsPath;

      // path prefix for Bootstrap JS files
      if (this.includeBootstrap) {
        if (this.includeSass) {
          bsPath = '/bower_components/bootstrap-sass/assets/javascripts/bootstrap/';
        } else {
          bsPath = '/bower_components/bootstrap/js/';
        }
      }

      this.fs.copyTpl(
        this.templatePath('index.html'),
        this.destinationPath('app/index.html'),
        {
          appname: this.appname,
          title: this.title,
          desc: this.desc,
          socialTitle: this.socialTitle,
          socialDesc: this.socialDesc,
          twitter: this.twitter,
          tweet: this.tweet,
          url: this.url,
          includeSass: this.includeSass,
          includeBootstrap: this.includeBootstrap,
          includeModernizr: this.includeModernizr,
          bsPath: bsPath,
          bsPlugins: [
            'affix',
            'alert',
            'dropdown',
            'tooltip',
            'modal',
            'transition',
            'button',
            'popover',
            'carousel',
            'scrollspy',
            'collapse',
            'tab'
          ]
        }
      );
    },

    misc: function () {
      mkdirp('app/images');
      mkdirp('app/social');
    }
  },

  install: function () {
    this.installDependencies({
      skipInstall: this.options['skip-install'],
      skipMessage: this.options['skip-install-message']
    });
  },

  end: function () {
    var bowerJson = this.fs.readJSON(this.destinationPath('bower.json'));
    var howToInstall =
      '\nAfter running ' +
      chalk.yellow.bold('npm install & bower install') +
      ', inject your' +
      '\nfront end dependencies by running ' +
      chalk.yellow.bold('grunt wiredep') +
      '.';

    if (this.options['skip-install']) {
      this.log(howToInstall);
      return;
    }

    // wire Bower packages to .html
    wiredep({
      bowerJson: bowerJson,
      src: 'app/index.html',
      exclude: ['bootstrap.js'],
      ignorePath: /^(\.\.\/)*\.\./
    });

    if (this.includeSass) {
      // wire Bower packages to .scss
      wiredep({
        bowerJson: bowerJson,
        src: 'app/styles/*.scss',
        ignorePath: /^(\.\.\/)+/
      });
    }
  }
});
