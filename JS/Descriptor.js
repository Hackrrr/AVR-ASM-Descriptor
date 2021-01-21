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
			this.isCommentedOut = !!input.match(/^\s*;.*$/);
			input = splitLine(input);
		} else {
			this.isCommentedOut = !input[1] && !input[3] && !input[5] && input[7];
		}
		this.parsed = input;
		this.#parsedOp = input[5] ? splitOp(input[5]) : [];
	}
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
	return (o.length == 1 && o[0] == "") ? [] : o;
}
const offsetR = (x, offset = 1) => {
	return x.substr(0,1) + (Number(x.substr(1)) + offset);
}
const isLabelString = (x) => {
	return x.match(/^[a-zA-Z]\w*/) !== null;
};
//const isFullLineComment = (line) => typeof line == "string" ? line.match(/\s*;.*/) !== null : !line[1] && !line[3] && !line[5] && line[7];
//TODO: Remove this ↑↑↑

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
			if (parsed[x].processed) continue;
			
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
	if (!instructionData.hasOwnProperty(lineData.instruction))
		throw new Error(`Neznámá instrukce '${lineData.instruction}'`);
	return getCommenter(lineData.instruction, selected)(lineData.operators);
}
function getCommenter(instruction, selected) {
	instruction = instruction.toLowerCase();
	return instructionData[instruction][selected[instruction] ?? 0];
}




function tryGenerateIntelligentComment(splittedLine, parsedCode, line) {
	let instruction = splittedLine[3], op = splittedLine[5] ? splitOp(splittedLine[5]) : "";
	if (!instructionData_inteligent.hasOwnProperty(instruction))
		return null;
	for (let commenter of instructionData_inteligent[instruction]) {
			
	}
}