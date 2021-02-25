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
class IntelligentCommenter extends Function {
	// Bude to fungovat? Výbuch... Základ vzat z https://stackoverflow.com/a/36871498

	name = "";
	instructions = [];
	settings = 0;

	constructor(commenter, instructions = [], name = "", settings = 0) {
		super();

		//commenter.name = name;
		/*
		Takovej problém... Funkce už mají property 'name', která je read-only...
		Jako - Mohl bych přejmenovat tu property 'name' (tady u IntelligentCommenter classy), ale to je meh.
		Radši jdu zdeformovat tu funkci ještě víc. LULW
		*/

		/*
		A další problém - Proč myslíte, že voláme super()? No... Z nějakého důvodu 'this' ve wrapper funkci hlásí, že nejdříve máme volat 'super()'... No tak ho volám :)
		Ale vážně - Nemám tušení, proč musím volat super - přeci to má být nová closure, když je to code block, ne?
		A i kdyby se to nebralo jako další closure, tak se to nikdy nevolá v tomto scopu, takže stejně 'this' by mělo být něco jiného, než je tento znetvořený ctor LULW
		Ke všemu ale funguje to, když odkazuju na 'this' v metodě (viz zakomentovaná 'shouldTry'), tak to funguje...
		... ale to bych musel udělat ještě extení wrapper mimo classu a to je zase meh :)
		
		No tak to je důvod, proč zase ztrácíme výkon tím, že voláme super() jen pro to, aby jsme zase ukázali, že JS je nejlepší jazyk :)
		BTW ten bind() call byl doplněn až poté, takže ten mě v tu chvíli netrápil (teda trápil - nefunguval a tak jsem ho odstranil (takže mě nakonec netrápil :) ))
		*/

		commenter = commenter.bind(this);

		let wrapper = ((lineData, ...args) => {
			if (this.instructions.length == 0 || this.instructions.includes(lineData.instruction))
				return commenter(lineData, ...args);
			else
				return false;
		});

		Object.defineProperty(wrapper, "name", {writable: true});
		wrapper.name = name;
		this.name = name;
		this.instructions = instructions;
		this.settings = settings;
		return Object.setPrototypeOf(wrapper, IntelligentCommenter.prototype);
		/*
		Máte ještě nějaké otázky? Třeba "Proč tady je to Object.setPrototypeOf(...)"?
		No tak máte smůlu, protože já už mám debugování téhle classy dost :) (prostě JS eShrug)
		*/
	}
}
class Predefined {
	constructor(name, desc = "", value = null) {
		this.name = name;
		this.desc = desc;
		this.value = value;
	}
}



class Operator {
	static validator = value => false;
	originalValue = "";
	comparableValue;
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
		if (operatorClass.validator(value))
			return new operatorClass(value);
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
	for (let commenter of intelligentCommenters) {
			if (commenter(lineData, parsedCode, lineIndex))
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