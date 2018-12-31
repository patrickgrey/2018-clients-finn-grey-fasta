// PURPOSE:
//  Input a search string ("CTAG") and return an array of sets that end with that string.
//  Each set should include the header info and set characters in an object.
// ASSUMPTIONS:
//  - Every set has a header directly below it.
//  - Subset of characters only
// NEW FEAURES:
//  Allow string replacement
//  Web interface / API with JSON return

const fileSystem = require("fs");
const eventStream = require("event-stream");

const searchString = process.argv.slice(2)[0];
let cachedHeader = "";
let cachedSequence = "";
let sequenceArray = [];
let totalSequenceCount = 0;
let totalMatchingSequenceCount = 0;

// Utility function
const isAtEnd = (_text, _search) => {
  const textUpper = _text.toUpperCase();
  const searchUpper = _search.toUpperCase();
  return (
    textUpper.indexOf(searchUpper) > -1 &&
    textUpper.substring(
      textUpper.length - searchUpper.length,
      textUpper.length
    ) === searchUpper
  );
};

// Check search text is at end of current cached sequence and add to result if is.
const searchCachedSequence = () => {
  if (isAtEnd(cachedSequence, searchString)) {
    // ATCAGCAGCAACCTGGAGTAA
    sequenceArray.push({ header: cachedHeader, set: cachedSequence });
    totalMatchingSequenceCount++;
  }
  cachedSequence = "";
  cachedHeader = "";
};

const stream = fileSystem
  .createReadStream("pig.fasta")
  .pipe(eventStream.split())
  .pipe(
    eventStream
      .mapSync(function(line) {
        // New set found so check the cached set and add to array if passes.
        if (line.charAt(0) === ">") {
          searchCachedSequence();
          cachedHeader = line;
          totalSequenceCount++;
          return false;
        }
        // Blank line, ignore
        if (/^\s*$/.test(line)) {
          return false;
        }
        // Ignore comments
        if (line.charAt(0) === ";") {
          return false;
        }

        // TODO: Check if line only contains specified characters: ACTG

        // If no other conditions met, must be sequence line so add to current cached sequence.
        cachedSequence += line;
        return false;
      })
      .on("error", function(err) {
        console.log("Error while reading file.", err);
      })
      .on("end", function() {
        console.log("Read entire file.");
        console.log(sequenceArray);
        console.log("Total sequences: ", totalSequenceCount);
        console.log("Total sequences matching: ", totalMatchingSequenceCount);
      })
  );
