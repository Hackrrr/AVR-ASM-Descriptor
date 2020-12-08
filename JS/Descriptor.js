const splitLine = (x, filter = true, groupsOnly = true) => {
	/*
	OLD:
	//x = Array.from(x.trim().match(/^\s*(?:((?:\w|\.)+:?)(?:$|(?:\s+(.+?)\s*)))?(;.*)?$/) ?? []);
    Groupy:
		1.  instrukce
		2.  operátory
		3.  komentář
    */


	x = Array.from(x.match(/^(?!\s*$)(\s*)(?:([a-zA-Z0-9_.]+:)(\s*))?(?:(?:(\.?\w+)(?:(?:\s*?$)|(\s+)))((?:(?:(?<!\\)"(?:(?:\\")|[^"])*?(?<!\\)")|(?:(?<!\\)'(?:(?:\\')|[^'])*?(?<!\\)')|(?:[^;]))+?)?)?(\s*)(;.*)?$/) ?? []);
    if (groupsOnly) x.shift();
	return filter ? x.filter((x) => x != undefined && x != null) : x;
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

	Příklad:
 >  $1   $2    $3  $4  $5    $6    $7     $8
 >      label:    call    R16, 0x5    ; Komentář
	*/
};
const splitOp = (x) => {
    return x.split(/,\s*/);
}
const offsetR = (x, offset = 1) => {
    return x.substr(0,1) + (Number(x.substr(1)) + offset);
}
const isLabelString = (x) => {
    return x.match(/^[a-zA-Z]\w*/) !== null;
};
const isCommentLine = (line) => typeof line == "string" ? line.match(/\s*;.*/) !== null : !line[1] && !line[3] && !line[5] && line[7];

/*
splittedLine[0] &&
splittedLine[1] &&
splittedLine[2] &&
splittedLine[3] &&
splittedLine[4] &&
splittedLine[5] &&
splittedLine[6] &&
splittedLine[7];
*/



// (op array, splittedLine, code) => comment
const instructionData = {
    // Pseudo/Meta instrukce
    ".org": [
        (op) => {
            return `Kód se od teď zapisuje od adresy/na adresu '${op[0]}'`;
		},
		(op) => {
            return `Kód se od teď zapisuje do paměti na adresu '${op[0]}'`;
        }
    ],

    // Aritmetika, Logika
	"add": [
		(op) => {
			return `Sečte registry ${op[0]} a ${op[1]} a výsledek uloží do registru ${op[0]}`;
		}
	],
	"adc": [
		(op) => {
			return `Sečte registry ${op[0]} a ${op[1]}, přičte hodnotu C (= carry flag v SREG) a výsledek uloží do registru ${op[0]}`;
		}
	],
	"adiw": [
		(op) => {
			if (op[0].match(/^[x-z]$/i))
                return `Přidá hodnotu ${op[1]} k hodnotě registru ${op[0]} a výsledek uloží do tohoto registru`;
            else
                return `Přidá hodnotu ${op[1]} k hodnotě páru registrů ${offsetR(op[0])}:${op[0]} a výsledek uloží do tohoto páru registrů`;
		}
	],
	"sub": [
		(op) => {
			return `Odečte hodnotu registru ${op[1]} od hotnoty v registru ${op[0]} a výsledek uloží do registru ${op[0]}`;
		}
	],
	"subi": [
		(op) => {
			return `Odečte hodnotu ${op[1]} od hotnoty v registru ${op[0]} a výsledek uloží do registru ${op[0]}`;
		}
	],
	"sbc": [
		(op) => {
			return `Odečte hodnotu registru ${op[1]} od hotnoty v registru ${op[0]}, odečte od výsledku hodnotu C (= carry flag v SREG) a následný výsledek uloží do registru ${op[0]}`;
		}
	],
	"sbiw": [
		(op) => {
			if (op[0].match(/^[x-z]$/i))
                return `Odečte hodnotu ${op[1]} od hodnoty registru ${op[0]} a výsledek uloží do tohoto registru`;
            else
                return `Odečte hodnotu ${op[1]} od hodnoty páru registrů ${offsetR(op[0])}:${op[0]} a výsledek uloží do tohoto páru registrů`;
		}
	],
	"and": [
        (op) => {
            return `Provede logickou operaci AND s registry ${op[0]} a ${op[1]} a výsledek uloží do registru ${op[0]}`;
        }
	],
	"andi": [
        (op) => {
            return `Provede logickou operaci AND s registrem ${op[0]} a hodnoutou '${op[1]}' a výsledek uloží do registru ${op[0]}`;
        }
	],
	"or": [
        (op) => {
            return `Provede logickou operaci OR s registry ${op[0]} a ${op[1]} a výsledek uloží do registru ${op[0]}`;
        }
	],
	"ori": [
        (op) => {
            return `Provede logickou operaci OR s registrem ${op[0]} a hodnoutou '${op[1]}' a výsledek uloží do registru ${op[0]}`;
        }
    ],
	"eor": [
        (op) => {
            return `Provede logickou operaci XOR (Exkluzivní OR) s registry ${op[0]} a ${op[1]} a výsledek uloží do registru ${op[0]}`;
        }
	],
	"sbr": [
        (op) => {
            return `Nastaví ${op[1]}. bit v registru ${op[0]} na 1`;
        }
	],
	"cbr": [
        (op) => {
            return `Nastaví ${op[1]}. bit v registru ${op[0]} na 0`;
        }
    ],
	"dec": [
		(op) => {
			return `Dekrementace registru ${op[0]} o 1`;
		}
	],
	"clr": [
        (op) => {
            return `Nastaví všechny bity registru ${op[0]} na 0`;
        }
	],
	"ser": [
        (op) => {
            return `Nastaví všechny bity registru ${op[0]} na 1`;
        }
	],
	"mul": [
		(op) => {
			return `Vynásobí nedesetiné hodnoty registrů ${op[0]} a ${op[1]} a výsledek uloží do páru registrů ${haveUpperCase(op[0])?"R1:R0":"r1:r0"}`;
		}
	],
	"muls": [
		(op) => {
			return `Vynásobí desetiné hodnoty registrů ${op[0]} a ${op[1]} a výsledek uloží do páru registrů${haveUpperCase(op[0])?"R1:R0":"r1:r0"}`;
		}
	],
	"mulsu": [
		(op) => {
			return `Vynásobí desetinou hodnotu registru ${op[0]} a nedesetinou hodnotu registru ${op[1]} a výsledek uloží do páru registrů ${haveUpperCase(op[0])?"R1:R0":"r1:r0"}`;
		}
	],
	"fmul": [
		(op) => {
			return `Vynásobí nedesetiné zlomkové hodnoty registrů ${op[0]} a ${op[1]} a výsledek uloží do páru registrů ${haveUpperCase(op[0])?"R1:R0":"r1:r0"}`;
		}
	],
	"fmuls": [
		(op) => {
			return `Vynásobí desetiné zlomkové hodnoty registrů ${op[0]} a ${op[1]} a výsledek uloží do páru registrů ${haveUpperCase(op[0])?"R1:R0":"r1:r0"}`;
		}
	],
	"fmulsu": [
		(op) => {
			return `Vynásobí desetinou zlomkovou hodnotu registru ${op[0]} a nedesetinou zlomkovou hodnotu registru ${op[1]} a výsledek uloží do páru registrů ${haveUpperCase(op[0])?"R1:R0":"r1:r0"}`;
		}
    ],

    // Flow/Větvení
	"rjmp": [
		(op) => {
			return isLabelString(op[0]) ? `(Relativní) skok na návěstí "${op[0]}"` : `Relativní skok o ${op[0]}`;
		}
	],
	"brne": [
		(op) => {
			return isLabelString(op[0]) ? `Pokud Z (= zero flag v SREG) je rovno nule, (relativní) skok na návěstí "${op[0]}", jinak se pokračuje dál` : `Pokud Z (= zero flag v SREG) je rovno nule, relativní skok o "${op[0]}", jinak se pokračuje dál`;
		}
	],
	
	// Bitwise
	"lsl": [
        (op) => {
            return `Posune bity v registru ${op[0]} doleva (původní MSB bude ztracen)`;
        }
	],
	"lsr": [
        (op) => {
            return `Posune bity v registru ${op[0]} doprava (původní LSB bude ztracen)`;
        }
	],
	"rol": [
        (op) => {
            return `Posune bity v registru ${op[0]} doleva přes Carry (půsodní MSB se stane současním LSB)`;
        }
	],
	"ror": [
        (op) => {
            return `Posune bity v registru ${op[0]} doprava přes Carry (půsodní LSB se stane současním MSB)`;
        }
	],
	"swap": [
        (op) => {
            return `V registru ${op[0]} prohodí nibbly/půlbajty`;
        }
	],
    
    // Přesun
	"mov": [
		(op) => {
			return `Přestunutí hodnoty registru '${op[1]}' do registru ${op[0]}`;
		}
	],
	"ldi": [
		(op) => {
			return `Načtení/zápis hodnoty '${op[1]}' do registru ${op[0]}`;
		}
	],
	"ld": [
		(op) => {
			let r = op[1].match(/\w/)[0];
            if (op[1].length == 2) {
                if (op[1][0] == "-") return `Dekrementace registru ${r} + Načtení/zápis hodnoty z paměti na adrese, která je uložena v registru ${r} do registru ${op[0]}`;
                else return `Načtení/zápis hodnoty z paměti na adrese, která je uložena v registru ${r} do registru ${op[0]} + Inkrementace registru ${r}`;
            } else {
                return `Načtení/zápis hodnoty z paměti na adrese, která je uložena v registru ${r} do registru ${op[0]}`;    
            }
		}
	],
	"ldd": [
		(op) => {
			let r = op[1][0];
            let z = op[1][1];
            let v = op[1].substr(2);
            return `Načtení/zápis hodnoty z paměti na adrese, která je rovna hodnotě v registru ${r} ${z} ${v} do registru ${op[0]}`;
		}
	],
	"lds": [
		(op) => {
			return `Načtení/zápis hodnoty z paměti na adrese '${op[1]}' do registru ${op[0]}`;
		}
	],
	"sts": [
		(op) => {
			return `Načtení/zápis hotnoty registru '${op[1]}' do paměti na adrese ${op[0]}`;
		}
	],
	"in": [
        (op) => {
            return `Načtení hodnoty z portu ${op[1]} do registru ${op[0]}`;
        }
	],
	"out": [
        (op) => {
            return `Načtení hodnoty z registru ${op[1]} na port ${op[0]}`;
        }
    ],
    
    // Ostatní
	"nop": [
		(op) => {
			return `"Nulová instrukce" - Nic se nevykoná`;
		}
    ],



    /*
    "": [
        (op, splittedLine) => {
            return ``;
        }
    ],
    */
};



const selected = {}; //Tak je to const, ale netuším, jestli to náhodou nemá (v tomto případě) nějakej drawback...
//TODO: Cookie serialization/deserialization
for (let instruction of Object.keys(instructionData)) { 
    selected[instruction] = getRandom(0, instructionData[instruction].length - 1);
}


class Formater {
	removeLineComments			= true;			// => Odstraní tento komentář:	mov R16, R1 ;Komentář s instrukcí
	removeCommentLines			= false;		// => Odstraní tento komentář:	;Samostatný komentář

	alignAddedComments			= true;			// Padding přidaných komentářů
	commentIdent				= "\t";			// Čím spojit původní (/formátovanou) řádku a přidaný komentář?

	replaceLineIdent			= true;			// Nahradit současné odsazení? A pokud ano, tak ...
	identReplacement			= "\t";			// ... čím nahradit současné odsazení?
	trimTrailing				= true;			// Odstranit trailing \s znaky?

	beautifyLine				= true;			// Formátuje instrukci a operátory do tvaru:	instrukce OP0, OP1

	removeEmptyLines			= false;		// Odstranit prázdné řádky? (řádka obsahující pouze mezery a taby je také prázdná)
	removeEmptyLinesFromStart	= true;			// Odstranit prázdné řádky ze začátku? (řádka obsahující pouze mezery a taby je také prázdná)
	removeEmptyLinesFromEnd		= true;			// Odstranit prázdné řádky t konce? (řádka obsahující pouze mezery a taby je také prázdná)

	// Systém zatím nemá kapatibilitu toto provést
	//separateLabels				= true;			// Přesune instkuce, které jsou na stejném řádku jako label, na nový (další) řádek

	constructor(params = {}) {
		Object.assign(this, params ?? {});
	}

	preFormatCode(code) {
		return code;
	}
	formatLine(splittedLine, code) {
		if (this.removeEmptyLines && !splittedLine.some((x) => x !== undefined && x !== null && x.trim() !== "")) return null;
		if (this.removeCommentLines && isCommentLine(splittedLine)) return null;
		if (this.removeLineComments && !isCommentLine(splittedLine)) splittedLine.splice(7);
		if (this.replaceLineIdent && !isCommentLine(splittedLine) && splittedLine[0]) splittedLine[0] = this.identReplacement; // => Skip comments + labels
		if (this.beautifyLine) {
			if (splittedLine[1]) {
				splittedLine[0] = "";
				splittedLine[2] = " ";
			}
			if (splittedLine[5]) {
				splittedLine[4] = " ";
				splittedLine[5] = splitOp(splittedLine[5]).join(", ");
			}
		}
		return this.trimTrailing ? splittedLine.join("").trimEnd() : splittedLine.join("");
	}
	// lines = [ ... , [line, comment], ... ]
	joinLines(lines) {
		// Jo, jasně... Tohle loopování se může optimalizovat... Ale kdo se ptal? PogO
		// No... Možná se někdy k tomu někdo dostane... :)
		lines = lines.map((x) => {
			return x.filter((x) => {
				return x !== undefined && x !== null && x !== "";
			});
		});
		while (this.removeEmptyLinesFromEnd && lines.length != 0 && lines[lines.length - 1].length == 0)
		lines.pop();
		while (this.removeEmptyLinesFromStart && lines.length != 0 && lines[0].length == 0)
		lines.shift();
		
		if (this.alignAddedComments) {
			let maxLength = 0;
			lines.forEach(x => maxLength = x[1] ? Math.max(maxLength, x[0]?.length ?? 0) : maxLength);
			lines = lines.map(x => {
				if (x[1]) x[0] = x[0].padEnd(maxLength);
				return x;
			});
		}

		return lines.map((x) => x.join(this.commentIdent + "; ")).join("\n");
	}
	postFormatCode(code) {
		return code;
	}
}





function addComments(code, formater = new Formater()) {
	// output = [ ... [řádka, komentář] ... ]
	formater = formater ?? new Formater();
    let output = [];
	code = formater.preFormatCode(code);

    for (let line of code.split("\n")) {
		let splitted = splitLine(line, false);
		line = formater.formatLine(splitted, code);
		if (line == null) continue;
		// splitted = splitLine(line, false); ??? Jakože pro generateComment() by to nemělo vadit, ale člověk nikdy neví :)
		let comment = splitted[3] ? generateComment(splitted) : "";
		output.push([line, comment]);
	}
	
    return formater.postFormatCode(formater.joinLines(output));
}

function generateComment(splittedLine) {
    let instruction = splittedLine[3], op = splittedLine[5] ? splitOp(splittedLine[5]) : "";
    if (!instructionData.hasOwnProperty(instruction))
        throw new Error("Neznámá instrukce '" + instruction + "'");
    return getCommenter(instruction)(op, splittedLine);
}

function getCommenter(instruction) {
	//TODO: .toLowerCase()?
    return instructionData[instruction][selected[instruction]];
}