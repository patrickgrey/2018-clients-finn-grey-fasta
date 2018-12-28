var fs = require("fs");
var es = require("event-stream");
// var now = require("performance-now");

var totalLines = 0;
var newSetCount = 0;
var stringArray = [];
var hitArray = [];
// var currentString;
var addNewString = false;

var sequence = process.argv.slice(2);

// var names = [];
// var firstNames = [];
// var dupeNames = {};
// var dateDonationCount = [];
// var dateDonations = {};
// var t0;
// var t1;
// var t2;
// var t3;
// var t4;
// var t5;
// var t6;
// var t7;

// TODO: Check for comments (;) and return header as well as sequence.

var s = fs
  // .createReadStream('test.txt')
  .createReadStream("pig.txt")
  // .createReadStream('/Users/pxn5096/Downloads/indiv18/itcont.txt')
  .pipe(es.split())
  .pipe(
    es
      .mapSync(function(line) {
        // Blank line, ignore
        if (/^\s*$/.test(line)) {
          return false;
        }
        // Check for header and whether on first line.

        if (line.charAt(0) === ">" && totalLines != 0) {
          addNewString = true;
          totalLines++;
          return false;
        }

        totalLines++;

        if (addNewString) {
          // currentString = stringArray[newSetCount];
          var currentSet = stringArray[newSetCount];

          if (currentSet.indexOf(sequence) > -1) {
            // ATCAGCAGCAACCTGGAGTAA
            console.log(currentSet);
            console.log("hit", currentSet.indexOf(sequence));
            console.log(currentSet.length - sequence[0].length); // checks that is at end
          }

          newSetCount++;
          stringArray[newSetCount] = "";
          addNewString = false;
          return false;
        }
        // console.time("line count");
        // t0 = now();
        // console.log(line);
        stringArray[newSetCount] += line;

        // Header line, start new string.
        // console.log(line.charAt(0));

        // // get all names
        // console.time("names");
        // t2 = now();
        // var name = line.split("|")[7];
        // if (totalLines === 433 || totalLines === 43244) {
        //   names.push(name);
        // }

        // // get all first halves of names
        // console.time("most common first name");
        // t4 = now();
        // var firstHalfOfName = name.split(", ")[1];

        // if (firstHalfOfName !== undefined) {
        //   firstHalfOfName.trim();

        //   // filter out middle initials
        //   if (firstHalfOfName.includes(" ") && firstHalfOfName !== " ") {
        //     firstName = firstHalfOfName.split(" ")[0];
        //     firstName.trim();
        //     firstNames.push(firstName);
        //   } else {
        //     firstNames.push(firstHalfOfName);
        //   }
        // }

        // // year and month
        // console.time("total donations for each month");
        // t6 = now();
        // var timestamp = line.split("|")[4].slice(0, 6);
        // var formattedTimestamp =
        //   timestamp.slice(0, 4) + "-" + timestamp.slice(4, 6);
        // dateDonationCount.push(formattedTimestamp);
      })
      .on("error", function(err) {
        console.log("Error while reading file.", err);
      })
      .on("end", function() {
        console.log("Read entire file.");
        // console.log(stringArray);
        console.log(sequence);
        // t1 = now();
        // console.log("totalLines", totalLines);
        // console.timeEnd("line count");
        // console.log(
        //   `Performance now line count timing: ` + (t1 - t0).toFixed(3) + `ms`
        // );

        // console.log(names[432]);
        // console.log(names);
        // t3 = now();
        // console.timeEnd("names");
        // console.log(
        //   `Performance now names timing: ` + (t3 - t2).toFixed(3) + `ms`
        // );

        // most common first name
        // firstNames.forEach(x => {
        //   dupeNames[x] = (dupeNames[x] || 0) + 1;
        // });
        // var sortedDupeNames = [];
        // sortedDupeNames = Object.entries(dupeNames);

        // sortedDupeNames.sort((a, b) => {
        //   return b[1] - a[1];
        // });
        // console.log(sortedDupeNames[0]);
        // t5 = now();
        // console.timeEnd("most common first name");
        // console.log(
        //   `Performance now first name timing: ` + (t5 - t4).toFixed(3) + `ms`
        // );

        // number of donations per month
        // dateDonationCount.forEach(x => {
        //   dateDonations[x] = (dateDonations[x] || 0) + 1;
        // });
        // logDateElements = (key, value, map) => {
        //   console.log(
        //     `Donations per month and year: ${value} and donation count ${key}`
        //   );
        // };
        // new Map(Object.entries(dateDonations)).forEach(logDateElements);
        // t7 = now();
        // console.timeEnd("total donations for each month");
        // console.log(
        //   `Performance now donations per month timing: ` +
        //     (t7 - t6).toFixed(3) +
        //     `ms`
        // );
      })
  );
