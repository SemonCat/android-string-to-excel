window.onload = function () {
  new ClipboardJS(".btn");

  resultText = document.getElementById("result");
  resultText.value = `your reuslt will be here`;

  document.getElementById("xmlfile").addEventListener("change", function (evt) {
    var notyfWarning = new Notyf({
      duration: 3000,
      types: [
        {
          type: "warning",
          background: "orange",
        },
      ],
    });
    notyfWarning.open({
      type: "warning",
      message: "processing...",
    });
    var files = evt.target.files;
    for (var i = 0; i < files.length; i++) {
      handleFile(files[i]);
    }
  });
};

function handleFile(f) {
  JSZip.loadAsync(f) // 1) read the Blob
    .then(
      function (zip) {
        var dirs = [];

        zip.forEach(function (relativePath, zipEntry) {
          if (zipEntry.dir) {
            dirs.push(relativePath);
          }
        });

        console.log(dirs);
        var fileList = [];
        dirs.forEach(function (dir) {
          if (!dir.startsWith("values")) {
            return;
          }

          zip.folder(dir).forEach(function (relativePath, file) {
            console.log("iterating over", file.name);

            fileList.push({
              parent: dir.replace("/", ""),
              path: file.name,
            });
          });
        });

        if (fileList.length == 0) {
          alert("unspoort zip format. please upload zip with valuse folder.");
          return;
        }

        processFiles(zip, fileList);
      },
      function (e) {}
    );
}

async function processFiles(zip, fileList) {
  console.log(fileList);

  var result = {};

  for (file of fileList) {
    var contents = await zip.file(file.path).async("string");

    var fastResult = parser.parse(contents, {
      parseNodeValue: false,
      parseAttributeValue: false,
      ignoreAttributes: false,
      attributeNamePrefix: "",
      textNodeName: "$t",
    });

    console.log("fastResult");
    console.log(fastResult);

    resources = fastResult.resources.string;

    console.log(resources);


    if (!Array.isArray(resources)) {
      tmpRes = resources
      resources = [tmpRes]
    }
    
    for (res of resources) {
      newRes = result[res.name];

      if (!newRes) {
        newRes = {};
      }

      newRes[file.parent] = res["$t"];

      result[res.name] = newRes;
    }
  }

  console.log(result);

  normalFormat = toExcel(result);
  iosFormat = toIOS(result);

  console.log(`${normalFormat}\n\n\n\n\n${iosFormat}`);

  resultText = document.getElementById("result");
  resultText.value = `${normalFormat}\n\n\n\n\n${iosFormat}`;

  resultText.select();

  var notyf = new Notyf({
    duration: 5000,
  });
  notyf.success("cover done. click Cut to clipboard to save your result.");

  document.getElementById("xmlfile").value = "";

  //navigator.clipboard.writeText(`${normalFormat}\n\n\n\n\n${iosFormat}`);

  // fs.writeFileSync("output.txt", `${normalFormat}\n\n\n\n\n${iosFormat}`);
}

function toExcel(result) {
  console.log(JSON.stringify(result));

  var keys = Object.keys(result);

  console.log("keys");
  console.log(keys);

  var firstKey = keys[0];

  var languages = Object.keys(result[firstKey]);

  console.log(languages);

  var excel = "";

  languageRow = languages.join("\t");

  excel += "string name\t" + languageRow + "\n";

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

  excel += "\t" + languageRow + "\nios format\t";

  for (lang of languages) {
    var text = [];
    for (key of keys) {
      value = result[key][lang];

      // ios use en as key
      iosKey = result[key]["values"];
      text.push(`""${iosKey}""=""${value.toString()}"";`);
    }

    excel += `"${text.join("\r")}"` + "\t";
  }

  console.log(excel);
  //fs.writeFileSync("output.txt", excel);

  return excel;
}
