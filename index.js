var fastParser = require("fast-xml-parser");

var fs = require("fs"),
  path = require("path"),
  filePath = path.join(
    __dirname,
    "files/Android App/values/chat_reactions.xml"
  );

var mainFolder = "files/Android App";
var reactionName = "chat_reactions.xml";

fs.readdir(mainFolder, (err, files) => {
  var fileList = [];
  files.forEach((file) => {
    if (!file.startsWith("value")) {
      return;
    }

    fileList.push({
      parent: file,
      path: `${mainFolder}/${file}/${reactionName}`,
    });
  });

  processFiles(fileList);
});

function processFiles(fileList) {
  console.log(fileList);

  var result = {};

  fileList.forEach((file) => {
    var contents = fs.readFileSync(file.path, "utf8");

    var fastResult = fastParser.parse(contents, {
      parseNodeValue: false,
      parseAttributeValue: false,
      ignoreAttributes: false,
      attributeNamePrefix: "",
      textNodeName: "$t",
    });

    resources = fastResult.resources.string;

    console.log(resources);

    for (res of resources) {
      newRes = result[res.name];

      if (!newRes) {
        newRes = {};
      }

      newRes[file.parent] = res["$t"];

      result[res.name] = newRes;
    }
  });

  normalFormat = toExcel(result);
  iosFormat = toIOS(result);

  fs.writeFileSync("output.txt", `${normalFormat}\n\n\n\n\n${iosFormat}`);
}

function toExcel(result) {
  console.log(result);

  var keys = Object.keys(result);

  console.log(keys);

  var firstKey = keys[0];

  var languages = Object.keys(result[firstKey]);

  console.log(languages);

  var excel = "";

  languageRow = languages.join("\t");

  excel += "\t" + languageRow + "\n";

  for (key of keys) {
    excel += key + "\t";

    for (lang of languages) {
      text = `${result[key][lang]}`;

      excel += text + "\t";
    }

    excel += "\n";
  }

  console.log(excel);

  return excel;
}

function toIOS(result) {
  console.log(result);

  var keys = Object.keys(result);

  console.log(keys);

  var firstKey = keys[0];

  var languages = Object.keys(result[firstKey]);

  console.log(languages);

  var excel = "";

  languageRow = languages.join("\t");

  excel += languageRow + "\n";

  for (lang of languages) {
    var text = [];
    for (key of keys) {
      value = result[key][lang];

      text.push(`""${key}""=""${value.toString()}""`);
    }

    excel += `"${text.join("\r")}"` + "\t";
  }

  console.log(excel);
  //fs.writeFileSync("output.txt", excel);

  return excel;
}
