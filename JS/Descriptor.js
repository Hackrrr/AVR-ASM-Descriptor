class Formatter {
	removeLineComments			= true;			// => Odstraní tento komentář:	mov R16, R1 ;Komentář s instrukcí
	removeFullLineComments		= false;		// => Odstraní tento komentář:	;Samostatný komentář

	alignAddedComments			= true;			// Padding přidaných komentářů
	commentIndent				= "\t";			// Čím spojit původní (/formátovanou) řádku a přidaný komentář?

	replaceLineIndent			= true;			// Nahradit současné odsazení? A pokud ano, tak se nahradí preferovaným odsazením
	preferedIndent				= "\t";	
	trimTrailing				= true;			// Odstranit trailing \s znaky?

	beautifyLine				= true;			// Formátuje instrukci a operátory do tvaru:	instrukce OP0, OP1

	removeEmptyLines			= false;		// Odstranit prázdné řádky? (řádka obsahující pouze mezery a taby je také prázdná)
	removeEmptyLinesFromStart	= true;			// Odstranit prázdné řádky ze začátku? (řádka obsahující pouze mezery a taby je také prázdná)
	removeEmptyLinesFromEnd		= true;			// Odstranit prázdné řádky z konce? (řádka obsahující pouze mezery a taby je také prázdná)

	separateLabels				= true;			// Přesune instkuce, které jsou na stejném řádku jako label, na nový (další) řádek

	constructor(params = {}) {
		Object.assign(this, params ?? {});
	}


	formatLine(lineData) {
		if (this.removeEmptyLines && !lineData.parsed.some((x) => x !== undefined && x !== null && x.trim() !== "")) return null;
		if (this.removeFullLineComments && lineData.isCommentedOut) return null;
		if (this.removeLineComments && !lineData.isCommentedOut) lineData.parsed.splice(7);
		if (this.separateLabels && lineData.label && lineData.instruction) {
			// Trochu zahodíme výkon opětovným parsováním, ale kdo se ptal? PogO
			return [
				new LineData(lineData.label),
				new LineData(lineData.parsed.splice(2).join("")), // = instrukce (včetně) a dál...
			];
		}
		if (this.replaceLineIndent && !lineData.isCommentedOut && lineData.parsed[0]) lineData.parsed[0] = this.preferedIndent; // => Skip comments + labels
		if (this.beautifyLine) {
			if (lineData.label) {
				lineData.parsed[0] = "";
				lineData.parsed[2] = " ";
			}
			if (lineData.operators.length > 0) {
				lineData.parsed[4] = " ";
				lineData.parsed[5] = lineData.operators.join(", ");
			}
		}

		return lineData;
	}
	buildLine(lineData) {
		return this.trimTrailing ? lineData.parsed.join("").trimEnd() : lineData.parsed.join("");
	}
	buildCode(lineDataArray) {
		// removeEmptyLinesFromEnd + removeEmptyLinesFromStart
		if (lineDataArray.length != 0) {
			if (this.removeEmptyLinesFromEnd) {
				while (lineDataArray[lineDataArray.length - 1].buildedLine.length == 0)
					lineDataArray.pop();
			}
			if (this.removeEmptyLinesFromStart) {
				while (lineDataArray[0].buildedLine.length == 0)
					lineDataArray.shift();
			}
		}

		// alignAddedComments
		if (this.alignAddedComments) {
			let maxLength = 0;
			for (let lineData of lineDataArray)
				if (lineData.generatedComment)
					maxLength = Math.max(maxLength, lineData.buildedLine.length);
			for (let lineData of lineDataArray)
				if (lineData.generatedComment)
					lineData.buildedLine = lineData.buildedLine.padEnd(maxLength);
		}
			
		return lineDataArray.map(x => {
			// Pokud nemáme komentář, necháme pouze řádku
			if (x.generatedComment == null || x.generatedComment.length == 0)
				return x.buildedLine;
			// Pokud máme jen komentář, nech jen komentář (i když tahle situace by nastat nikdy neměla)
			if (x.buildedLine.length == 0)
				return "; " + x.generatedComment;
			// Jinak posjíme řádku a komentář
			return x.buildedLine + this.commentIndent + "; " + x.generatedComment;
		}).join("\n");
	}
}
class CommentRules {
	selectedCommenters = {};
	allowNormalComments = true;
	allowInteligentComments = true;
	constructor(params = {}) {
		Object.assign(this, params ?? {});
	}
}
class LineData {
	processed = false;			// Indikuje, zda již byl vytvořen komentář (jinak řečeno - Je tato řádka "uzamčená"?)
	parsed = [];				// Parsovaná/splitnutá řádka
	#parsedOp = [];				// Parsované/splitnuté operátory (private)

	generatedComment = "";		// Vygenerovaný komentář
	buildedLine = "";			// Finální (možná) podoba řádky bez vygenerovaného komentáře

	isCommentedOut = false;		// Je tato řádka pouze komentářem?

	get label() { return this.parsed[1]; } // Vrací se i s trailing dvojtečkou
	get instruction() { return this.parsed[3]; }
	get operators() { return this.#parsedOp; }
	get comment() { return this.parsed[7]; }

	// String (unparsed line) nebo array (parsed/splittedLine)
	constructor(input) {
		if (typeof input == "string") {
			this.isCommentedOut = input.match(/^\s*;/) !== null;
			input = splitLine(input);
		} else {
			this.isCommentedOut = !input[1] && !input[3] && !input[5] && input[7];
		}
		this.parsed = input;
		this.#parsedOp = input[5] ? parseOps(splitOp(input[5])) : [];
	}
}
class IntelligentCommenter { //TODO: README.md ohledně změny struktury classy - Resp. že teď už to reálně classa je :)
	name = "";
	instructions = [];
	settings = 0;
	generateComment = () => "";

	constructor(commenter, instructions = [], name = "", settings = 0) {
		commenter = commenter.bind(this);

		let wrapper = ((lineData, ...args) => {
			if (this.instructions.length == 0 || this.instructions.includes(lineData.instruction.toLowerCase()))
				return commenter(lineData, ...args);
			else
				return false;
		});

		Object.defineProperty(wrapper, "name", {writable: true});
		wrapper.name = name;
		this.name = name;
		this.instructions = instructions;
		this.settings = settings;
		this.generateComment = wrapper;
	}
}
class RegisterCommenter { //TODO: README.md ohledně tohohle
	registers = [];
	settings = 0;

	generateFullValueComment(...args) {
		return this.#fullValueCommneter == null ? null : (this.#fullValueCommneter(...args) ?? null)
	}
	generateSingleBitComment(...args) {
		return this.#singleBitCommneter == null ? null : (this.#singleBitCommneter(...args) ?? null)
	}

	#fullValueCommneter = null;
	#singleBitCommneter = null;

	constructor(fullValueCommenter, singleBitCommneter, registers, settings = 0) {
		this.#fullValueCommneter = fullValueCommenter?.bind(this);
		this.#singleBitCommneter = singleBitCommneter?.bind(this);
		this.registers = registers;
		this.settings = settings;
	}
}
class RegisterCommenter_SingleBitOnly extends RegisterCommenter {
	constructor(singleBitCommneter, registers, settings = 0) {
		let fullValueCommenter = function(value, register) {
			let bits = getBitList(value);
			let comments = [];
			for (let bit of bits.on)
				comments.push(this.generateSingleBitComment(bit, 1, register));
			comments = [...new Set(comments.filter((value) => value !== null && value !== ""))];
			if (comments.length == 0)
				return null;
			else
				return humanJoin(comments);
		}
		super(fullValueCommenter, singleBitCommneter, registers, settings);
	}
}
class Predefined {
	constructor(name, desc = "", value = null) {
		this.name = name;
		this.desc = desc;
		this.value = value;
	}
}
class OperatorModifier {
	/*
	Vrátí array stringů, které se násldně parsují jako operátory (mimo tuhle funkci); Pokud nelze, vrátí null
	*/
	parse = (value) => null;
	/*
	Vrátí se hodnota ve správném typu (tedy ne vždy string) - Pasuje se array z funkce 'parse', ale tyto hodnoty jsou parsované; Pokud nelze, vrátí null
	*/
	resolve = (arr) => null;

	constructor(parser, resolver) {
		/*
		parser = Regex/Funkce(value)
			Regex:
				Pokud projde regexem, honota je validní
			Funkce:
				Pokud funkce(value) vrátí true, hodnota je validní
		*/
		if (parser instanceof RegExp) {
			this.parse = (value) => {
				let x = value.match(parser);
				if (x === null)
					return null;
				x = Array.from(x);
				x.shift();
				return x;
			};
		} else {
			this.parse = parser;
		}
		this.resolve = resolver;
	}
}



class Operator {
	static validator = value => false;
	originalValue = "";
	get comparableValue() {
		return null;
	}
	get value() {
		return this.comparableValue;
	}
	constructor(value) {
		this.originalValue = value;
	}
	toString() {
		return this.originalValue;
	}
}
class Operator_Unknown extends Operator {
	static validator = () => true;
	get comparableValue() {
		return Symbol();
	}
	constructor(value) {super(value);}
}

//TODO: Roztřídit všechny funkce, asi vytvořit něco jako Utils.js - Tohle je bordel, každá funkce má jiný styl, nepřehledný, naházený na sobě...
const splitLine = (x) => {
	/*
	OLD:
	//x = Array.from(x.trim().match(/^\s*(?:((?:\w|\.)+:?)(?:$|(?:\s+(.+?)\s*)))?(;.*)?$/) ?? []);
	Groupy:
		1.  instrukce
		2.  operátory
		3.  komentář
	*/


	x = Array.from(x.match(/^(?!\s*$)(\s*)(?:([a-zA-Z0-9_.]+:)(\s*))?(?:(?:(\.?\w+)(?:(?:\s*?$)|(\s+)))((?:(?:(?<!\\)"(?:(?:\\")|[^"])*?(?<!\\)")|(?:(?<!\\)'(?:(?:\\')|[^'])*?(?<!\\)')|(?:[^;]))+?)?)?(\s*)(;.*)?$/) ?? []);
	x.shift();
	return x;
	/*
	^(?!\s*$)(\s*)(?:([a-zA-Z0-9_.]+:)(\s*))?(?:(?:(\.?\w+)(?:(?:\s*?$)|(\s+)))((?:(?:(?<!\\)"(?:(?:\\")|[^"])*?(?<!\\)")|(?:(?<!\\)'(?:(?:\\')|[^'])*?(?<!\\)')|(?:[^;]))+?)?)?(\s*)(;.*)?$

	JS regex engine není tak skvělej jako PCRE, takže nemá naprříklad control verb (*ACCEPT)... Nejlepší možná varianta je tedy tato (pro PCRE; v JS nefunguje):
	^(?!\s*$)(\s*)(?:([a-zA-Z0-9_.]+:)(?:(?:\s*?$(*ACCEPT))|(\s*)))?(?:(?:(\.?\w+)(?:(?:\s*?$(*ACCEPT))|(\s+)))((?:(?:(?<!\\)"(?:(?:\\")|[^"])*?(?<!\\)")|(?:(?<!\\)'(?:(?:\\')|[^'])*?(?<!\\)')|(?:[^;]))+?)?)?(?:(?:\s*?$(*ACCEPT))|(\s*))(;.*)?$


	Groups:
		1.	indent
		2.	label
		3.	mezera label-instrukce
		4.	instrukce
		5.	mezera instrukce-operátory
		6.	operátory
		7.	mezera operátory-komentář
		8.	komentář (včetně trailing \s znaků)
	
	Pozn.: splitLine indexuje groupy od 0 (odstraňuje full match), takže splittedLine má číslo/index group "posunuté" o -1

	Příklad:
 >  $1   $2    $3  $4  $5    $6    $7     $8
 >      label:    call    R16, 0x5    ; Komentář
	*/
};
const splitOp = (x) => {
	let o = x.split(/,\s*/); //TODO: "," in strings :)
	return (o.length == 1 && o[0] == "") ? [] : Array.from(o);
}
const parseOps = (ops) => {
	let o = [];
	for (let op of ops) o.push(parseOperator(op));
	return o;
}
const parseOperator = (value) => {
	for (let operatorClass of operatorCheckOrder) {
		let validatorOutput = operatorClass.validator(value);
		if (validatorOutput !== false)
			return new operatorClass(validatorOutput === true ? value : validatorOutput);
	}
	console.warn("Unknown operator detected! (value '" + value + "')");
	return new Operator_Unknown(value);
};


function parseCode(code) {
	let parsed = [];
	for (let line of code.split("\n"))
		parsed.push(new LineData(line));
	return parsed;
}
function commentCode(code, formatter = new Formatter(), commentRules = new CommentRules()) {
	formatter = formatter ?? new Formatter();
	commentRules = commentRules ?? new CommentRules();

	let parsed = [];
	for (let lineData of parseCode(code)) {
		let stack = [lineData];
		while (stack.length > 0) {
			lineData = stack.pop();
			let formatted = formatter.formatLine(lineData);
			if (formatted == null)
				continue;
			if (!(formatted instanceof LineData)) { // => array
				stack = stack.concat(formatted.reverse());
				continue;
			}
			lineData = formatted;
			parsed.push(lineData);
		}
	}


	// Nejdříve inteligentní komentáře
	if (commentRules.allowInteligentComments) {
		const l = parsed.length;
		for (let x = 0; x < l; x++) {
			let lineData = parsed[x];
			if (lineData.processed) continue;
			// if (tryGenerateIntelligentComment(lineData, parsed, x))
			// 	lineData.processed = true;
			tryGenerateIntelligentComment(lineData, parsed, x); // "Flag" 'processed' by měl nastavit inteligentní komentátor!
		}
	}

	// Pak normální
	if (commentRules.allowNormalComments) {
		for (let lineData of parsed) {
			if (lineData.processed) continue;
			lineData.generatedComment = lineData.instruction ? generateComment(lineData, commentRules.selectedCommenters) : null;
			lineData.processed = true;
		}
	}


	// Následuje skládání řádek...
	for (let lineData of parsed)
		lineData.buildedLine = formatter.buildLine(lineData);


	// ... a pak složení celého kódu
	return formatter.buildCode(parsed);
}

function generateComment(lineData, selected) {
	if (!instructionData.hasOwnProperty(lineData.instruction.toLowerCase()))
		throw new Error(`Neznámá instrukce '${lineData.instruction}'`);
	return getCommenter(lineData.instruction, selected)(lineData.operators);
}
function getCommenter(instruction, selected) {
	instruction = instruction.toLowerCase();
	let instructionDataIndex = selected.hasOwnProperty(instruction) ? selected[instruction] ?? 0 : 0;
	return instructionData[instruction][instructionDataIndex];
}

function tryGenerateIntelligentComment(lineData, parsedCode, lineIndex) {
	if (lineData.instruction === undefined) return false;
	for (let commenter of intelligentCommenters) {
			if (commenter.generateComment(lineData, parsedCode, lineIndex))
				return true;
	}
	return false;
}

function getPreviousSureLinedata(parsedCode, currentLineIndex) {
	while (currentLineIndex--) { //Nemůže být '--currentLine', protože jinak nezkoušíme nultou řádku (nejdřív se dekrementuje => hodnota = 0 = false => exit)
		lineData = parsedCode[currentLineIndex];
		if (lineData.instruction) return lineData;
		else if (lineData.label) return null;
	}
	return null;
}

function generateCommentForRegisterFullValue(register, value) {
	if (register in registerMapping) {
		for (let registerCommenter of registerMapping[register]) {
			let output = registerCommenter.generateFullValueComment(value, register);
			if (output !== null)
				return output;
		}
	}
	return null;
}
function generateCommentForRegisterSingleBit(register, bit, value) {
	if (register in registerMapping) {
		for (let registerCommenter of registerMapping[register]) {
			let output = registerCommenter.generateSingleBitComment(bit, value, register);
			if (output !== null)
				return output;
		}
	}
	return null;
}

function firstLetterToUpperCase(str) {
	return str.length > 0 ? str[0].toUpperCase() + str.substring(1) : str;
}


function isPowerOf2(value) {
	return value && (value & value - 1);
}
function getSetBit(value) { // Indexujeme od 0
	return isPowerOf2(value) ? Math.log2(value) : null;
}
function getBitList(value, bitsize = 8) { // Indexujeme od 0
	let output = { // Pozice jsou od největšího po nejmenší
		on: [],
		off: []
	};
	let x = bitsize; // Jen tak pro radost...
	while (x--) {
		if (value & (1 << x))
			output.on.push(x);
		else
			output.off.push(x);
	}
	return output;
}
function humanJoin(arr, join = ", ", lastJoin = " a ") {
	return arr.length > 1 ? arr.slice(0, -1).join(join) + lastJoin + arr[arr.length - 1] : arr.join("");
}