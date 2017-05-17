const router = require("cmdrouter");
const browserify = require("browserify");
const path = require("path");
const fs = require("fs-extra-plus");
const exorcist = require("exorcist");
const postcss = require("postcss");
const hbsPrecompile = require("hbsp").precompile; // promise style

const processors = [
	require("postcss-import"),
	require("postcss-mixins"),
	require("postcss-simple-vars"),
	require("postcss-nested"),
	require("postcss-cssnext")({ browsers: ["last 2 versions"] })
];

// Define the constant for this project (needs to be before the router...route())
const baseDir = path.resolve(__dirname, "../");
const srcDir = path.join(baseDir, "src/");
const webDir = path.join(baseDir, "web/");

const jsDistDir = path.resolve(webDir, "js/");
const cssDistDir = path.resolve(webDir, "css/");

const jsSrcDirs = ["src/js-app/","src/view/","src/elem/"];
const pcssSrcDirs = ["src/pcss/","src/view/","src/elem/"];
const tmplSrcDirs = ["src/view/"];

// we route the command to the appropriate function
router({_default, js, css, tmpl, watch}).route();


// --------- Command Functions --------- //
async function _default(){
	await js();
	await css();
	await tmpl();
}

async function js(mode){
	ensureDist();

	if (!mode || mode === "lib"){
		await browserifyFiles(await fs.listFiles("src/js-lib/", ".js"), 
													path.join(webDir, "js/lib-bundle.js"));
	}

	if (!mode || mode === "app"){
		await browserifyFiles(await fs.listFiles(jsSrcDirs, ".js"), 
													path.join(webDir, "js/app-bundle.js"));
	}
}

async function css(){
	ensureDist();

	await pcssFiles(await fs.listFiles(pcssSrcDirs, ".pcss"), 
									path.join(cssDistDir, "all-bundle.css"));

}

async function tmpl(){
	ensureDist();

	var distFile = path.join(webDir, "js/templates.js");
	await fs.unlinkFiles([distFile]);

	console.log("template - " + distFile);

	var files = await fs.listFiles(tmplSrcDirs, ".tmpl");

	var templateContent = [];

	for (let file of files){

		let htmlTemplate = await fs.readFile(file, "utf8");
		let template = await hbsPrecompile(file, htmlTemplate);
		templateContent.push(template);
	}

	await fs.writeFile(distFile,templateContent.join("\n"),"utf8");
}


async function watch(){
	// first we build all
	await _default();

	// NOTE: here we do not need to do await (even if we could) as it is fine to not do them sequentially. 
	
	fs.watchDirs(["src/js-lib/"], ".js", (action, name) => {
		js("lib");
	});

	fs.watchDirs(jsSrcDirs, ".js", (action, name) => {
		js("app");
	});	

	fs.watchDirs(pcssSrcDirs, ".pcss", (action, name) => {
		css();
	});	

	fs.watchDirs(tmplSrcDirs, ".tmpl", (action, name) => {
		tmpl();
	});
}
// --------- /Command Functions --------- //


// --------- Utils --------- //

// make sure the dist folder exists
function ensureDist(){
	fs.ensureDirSync(jsDistDir);
	fs.ensureDirSync(cssDistDir);
}

async function pcssFiles(entries, distFile){
	console.log("postcss - " + distFile);

	var mapFile = distFile + ".map";	
	await fs.unlinkFiles([distFile, mapFile]);

	var processor = postcss(processors);
	var pcssNodes = [];

	// we parse all of the .pcss files
	for (let srcFile of entries){
		// read the file
		let pcss = await fs.readFile(srcFile, "utf8");

		var pcssNode = postcss.parse(pcss, {
			from: srcFile
		});
		pcssNodes.push(pcssNode);
	}

	// build build the combined rootNode and its result
	var rootNode = null;
	for (let pcssNode of pcssNodes){
		rootNode = (rootNode)?rootNode.append(pcssNode):pcssNode;
	}
	var rootNodeResult = rootNode.toResult();

	// we process the rootNodeResult
	var pcssResult = await processor.process(rootNodeResult,{
		to: distFile,
		map: { inline: false}});

	// we write the .css and .map files
	await fs.writeFile(distFile, pcssResult.css, "utf8");
	await fs.writeFile(mapFile, pcssResult.map, "utf8");
}

async function browserifyFiles(entries, distFile){
	console.log("browserify - " + distFile);

	var mapFile = distFile + ".map";	
	await fs.unlinkFiles([distFile, mapFile]);

	var b = browserify({ 
		entries,
		entry: true, 
		debug: true  
	});
	
	// wrap the async browserify bundle into a promise to make it "async" friendlier
	return new Promise(function(resolve, fail){
		b.bundle()
			.on("error", function (err) { fail(err); })
			.on("end", function(){ resolve(); })
			.pipe(exorcist(mapFile))
			.pipe(fs.createWriteStream(distFile));
	});	
}
// --------- /Utils --------- //
