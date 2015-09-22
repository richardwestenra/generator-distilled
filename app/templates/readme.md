# Build Brief


## Documents


## Fonts 


## Colours


## Functionality notes


## Dev setup/installation:

1. Install node, npm, bower etc. if you haven’t already. 
2. Clone the git repo. 
3. Run `npm install && bower install`. 
4. Project files are in `/app`, bower packages are in `/bower_components`, and node packages are in `/node_modules`. 
5. Use the following grunt commands: 
    - `grunt serve` runs the server for local dev work
    - `grunt` creates a production build in `/dist/`
    - `grunt deploy` makes a build and deploys it to the test server with Git
    - `grunt zip` makes a build and creates a zipped deliverable file in `/zips`

#### Note:

- Social/embed images go in the `/app/social` directory, NOT the `/app/images` directory, in order to prevent their filenames being revved.
