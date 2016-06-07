//********************
// Dependencies
//********************
const Promise = require('bluebird');
const _ = require('lodash');
const deasync = require('deasync');
const exec = require('child_process').exec;
const execSync = deasync(require('child_process').exec);
const fs = Promise.promisifyAll(require('fs'));
const argv = require('minimist')(process.argv.slice(2), {
  alias: {
    wordlist: 'w',
    volume: 'v',
    letter: ['l', 'mount', 'm'],
    path: 'p'
  },
  default: {
    path: '"D:\\Program Files\\VeraCrypt\\VeraCrypt.exe"'
  }
});

const veracryptRunningAsync = Promise.promisify(veracryptRunning);
const veracryptRunningSync = deasync(veracryptRunning);
const diskMountedSync = deasync(diskMounted);

//********************
// Main
//********************

var hasError = false;
var wordlist;
var ready; //is the program ready to try a new password?

//Check arguments
if(!argv.wordlist) {
  console.error('Missing wordlist argument');
  hasError = true;
}
if(!argv.volume) {
  console.error('Missing volume argument');
  hasError = true;
}
if(!argv.letter) {
  console.error('Missing drive letter argument');
  hasError = true;
}
if(hasError) process.exit(2);

veracryptRunningAsync().then(running => {
  if(running) {
    exitWithMessage('Please close VeraCrypt before running this program.', 3);
  }
  return Promise.fromCallback(cb => diskMounted(argv.letter, cb));
}).then(mounted => {
  if(mounted) {
    exitWithMessage('Drive letter ('+argv.letter+') has already been mounted. '+
      'Please unmount or choose a different drive letter', 4);
  }
  return fs.readFileAsync(argv.wordlist, 'utf8');
}).then(wordlistStr => {
  wordlist = wordlistStr.split(/\r?\n/);
  for(var i = 0; i < wordlist.length; i++) {
    if(testPassword(wordlist[i], argv)) {
      console.log('Found password:', wordlist[i]);
      process.exit(0);
    }
  }
  console.log('Password not found.');
  process.exit(0);
}).catch(err => {
  console.error('An error occurred:', err.stack);
  process.exit(5);
});

//********************
// Functions
//********************

function testPassword(password, args) {
  console.log('Trying:', password);
  const query = 'START "" '+args.path+' /v "'+args.volume+'" /q /p "'+password+'" /s /l '+args.letter;
  // console.log('Query:', query);
  execSync(query);
  deasync.loopWhile(() => veracryptRunningSync());
  console.log(args.letter, 'mounted?:', diskMountedSync(args.letter));
  if(diskMountedSync(args.letter))
    return true;
  else return false;
}

function exitWithMessage(msg, code) {
  console.error(msg);
  process.exit(code);
}

function veracryptRunning(cb) {
  console.log('Querying process...');
  exec('query process VeraCrypt.exe', (err, stdout, stderr) => {
    //Check for errors, but only if the error code is not 1
    //since the default error code for the command is 1
    if(err && err.code !== 1) return cb(err);
    cb(null, (stderr.indexOf('No Process exists') === -1));
  });
}

function diskMounted(letter, cb) {

  exec('wmic logicaldisk get caption', (err, stdout, stderr) => {
    if(err && err.code !== 1) return cb(err);
    const lines = stdout.split(/\r?\n/).map(line => line.trim());
    return cb(null, _.includes(lines, letter+':'));
  });
}