// PURPOSE:
//  Input a search string ("CTAG") and return an array of sets that end with that string.
//  Each set should include the header info and set characters in an object.
//  Return new file with changes made.
// ASSUMPTIONS:
//  - Every set has a header directly below it.
//  - Subset of characters only
// NEW FEAURES:
//  Web interface / API with JSON return
// TODO:
//  CHANGE READ AND WRITE TO STREAMS!!
//    https://itnext.io/using-node-js-to-read-really-really-large-files-pt-1-d2057fe76b33
//
//  Check for correct characters only
//  Compare to spec for more checks
//  Add tests

const fileSystem = require("fs");
const eventStream = require("event-stream");

// const searchSequence = "";
// const replaceSequence = "";
let cachedHeader = "";
let cachedSequence = "";
let sequenceArray = [];
let sequenceString = "";
let totalSequenceCount = 0;
let totalMatchingSequenceCount = 0;

const getSearchSequence = () => {
  if (!process.argv.slice(2)[0]) {
    console.log("Error: Please provide a search sequence.");
    throw new Error();
  }
  return process.argv.slice(2)[0];
};

const getReplaceSequence = () => {
  if (!process.argv.slice(2)[1]) {
    console.log("Error: Please provide a replace sequence.");
    throw new Error();
  }
  return process.argv.slice(2)[1];
};

// Utility function
const isAtSequenceEnd = (_sequence, _search) => {
  return (
    _sequence.substring(_sequence.length - _search.length, _sequence.length) ===
    _search
  );
};

const replaceSequence = (_sequence, _search, _replace) => {
  return _sequence.substring(0, _sequence.length - _search.length) + _replace;
};

const addSequence = (_header, _sequence) => {
  sequenceArray.push({ header: _header, sequence: _sequence });
  sequenceString += _header + "\n" + _sequence + "\n";
  totalMatchingSequenceCount++;
};

const resetCaches = () => {
  cachedSequence = "";
  cachedHeader = "";
};

const processCachedSequence = () => {
  const sequence = cachedSequence.toUpperCase();
  const search = getSearchSequence().toUpperCase();
  if (isAtSequenceEnd(sequence, search)) {
    const replacedSequence = replaceSequence(
      sequence,
      search,
      getReplaceSequence()
    );
    addSequence(cachedHeader, replacedSequence);
  }
  resetCaches();
};

const createFile = content => {
  fileSystem.writeFile("changedFile.json", JSON.stringify(content), err => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("Success!!");
  });
};

const stream = fileSystem
  .createReadStream("pig.fasta")
  .pipe(eventStream.split())
  .pipe(
    eventStream
      .mapSync(function(line) {
        if (line.charAt(0) === ">") {
          processCachedSequence();
          cachedHeader = line;
          totalSequenceCount++;
          return false;
        }
        // Ignore comments
        if (line.charAt(0) === ";") {
          return false;
        }
        // Ignore blank lines
        if (line === "") {
          return false;
        }

        // TODO: Check if line only contains specified characters: ACTG - REGEX?

        // If no other conditions met, must be sequence line so add to current cached sequence.
        cachedSequence += line;
        return false;
      })
      .on("error", function(err) {
        console.log("Error while reading file.", err);
      })
      .on("end", function() {
        processCachedSequence();
        console.log(sequenceArray);
        console.log("Total sequences: ", totalSequenceCount);
        console.log("Total sequences matching: ", totalMatchingSequenceCount);
        createFile(sequenceArray);
      })
  );
