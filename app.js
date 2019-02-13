// PURPOSE:
//  Input a search string ("CTAG") and return an array of sets that end with that string.
//  Each set should include the header info and set characters in an object.
//  Return new file with changes made.
// USE:
//   node app
// ASSUMPTIONS:
//  - Every set has a header directly below it.
// NEW FEAURES:
//  Web interface / API with JSON return
// TODO:
//  CHANGE READ AND WRITE TO STREAMS!!
//    https://itnext.io/using-node-js-to-read-really-really-large-files-pt-1-d2057fe76b33
//  Compare to spec for more checks
//  Add tests

const fileSystem = require("fs");
const eventStream = require("event-stream");

const fileName = "pig-short.fasta";
let cachedHeader = "";
let cachedSequence = "";
let sequenceString = "";
let sequenceArray = [];
let totalSequenceCount = 0;
let totalMatchingSequenceCount = 0;
const allowedCharacters = "ACTG";

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

const getAllowedCharacters = () => {
  return allowedCharacters;
};

const isAtSequenceEnd = (_sequence, _search) => {
  return (
    _sequence.substring(_sequence.length - _search.length, _sequence.length) ===
    _search
  );
};

const isClean = (_sequence, _regexString) => {
  const regex = new RegExp("[^" + _regexString + "]", "g");
  const result = regex.test(_sequence);
  // const result = /[^ACGT]/g.test(_sequence);
  return !result;
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
  if (
    isAtSequenceEnd(sequence, search) &&
    isClean(sequence, getAllowedCharacters())
  ) {
    const replacedSequence = replaceSequence(
      sequence,
      search,
      getReplaceSequence()
    );
    addSequence(cachedHeader, replacedSequence);
  }
  resetCaches();
};

const isNotContent = line => {
  return line.charAt(0) === ";" || line === "";
};

const isHeader = line => {
  return line.charAt(0) === ">";
};

const processLine = line => {
  if (isNotContent(line)) {
    return line;
  }

  if (isHeader(line)) {
    processCachedSequence();
    cachedHeader = line;
    totalSequenceCount++;
    return line;
  }

  cachedSequence += line;
  return line;
};
// https://thlorenz.com/blog/the-power-of-nodejs-streams-and-the-event-stream-module/
const stream = fileSystem
  .createReadStream(fileName)
  .pipe(eventStream.split())
  .pipe(
    eventStream
      .mapSync(line => {
        processLine(line);
      })
      .on("error", err => {
        console.log("Error while reading file.", err);
      })
      .on("end", () => {
        processCachedSequence();
        // console.log(sequenceArray);
        console.log("Total sequences: ", totalSequenceCount);
        console.log("Total sequences matching: ", totalMatchingSequenceCount);
        createFile(sequenceArray);
      })
  );

const createFile = content => {
  fileSystem.writeFile("changedFile.json", JSON.stringify(content), err => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("Success!!");
  });
};
