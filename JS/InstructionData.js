/*
Normální komentátor:
(operátory, splittedLine) => comment

(op) => {

}
*/
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
		},
		(op) => {
			return `K registru ${op[0]} se přičte registr ${op[1]} a výsledek bude uložen do registru ${op[0]}`;
		}
	],
	"adc": [
		(op) => {
			return `Sečte registry ${op[0]} a ${op[1]}, přičte hodnotu C (= carry flag v SREG) a výsledek uloží do registru ${op[0]}`;
		},
		(op) => {
			return `K registru ${op[0]} se přičte registr ${op[1]} a C a následný výsledek bude uložen do registru ${op[0]}`;
		}
	],
	"adiw": [
		(op) => {
			if (op[0].match(/^[x-z]$/i))
				return `Přidá hodnotu ${op[1]} k hodnotě registru ${op[0]} a výsledek uloží do tohoto registru`;

			else
				return `Přidá hodnotu ${op[1]} k hodnotě páru registrů ${offsetR(op[0])}:${op[0]} a výsledek uloží do tohoto páru registrů`;
		},
		(op) => {
			if (op[0].match(/^[x-z]$/i))
				return `K registru ${op[0]} se přičte hodnota ${op[1]} a výsledek bude uložen do tohoto registru`;

			else
				return `K páru registrů ${offsetR(op[0])}:${op[0]} se přičte hodnota ${op[1]} a výsledek bude uložen do tohoto páru registrů`;
		}
	],
	"sub": [
		(op) => {
			return `Odečte hodnotu registru ${op[1]} od hodnoty v registru ${op[0]} a výsledek uloží do registru ${op[0]}`;
		},
		(op) => {
			return `Od registru ${op[0]} se odečte registr ${op[1]} a výsledek bude uložen do registru ${op[0]}`;
		}
	],
	"subi": [
		(op) => {
			return `Odečte hodnotu ${op[1]} od hodnoty v registru ${op[0]} a výsledek uloží do registru ${op[0]}`;
		},
		(op) => {
			return `Od registru ${op[0]} se odečte ${op[1]} a výsledek bude uložen do registru ${op[0]}`;
		}
	],
	"sbc": [
		(op) => {
			return `Odečte hodnotu registru ${op[1]} od hodnoty v registru ${op[0]}, odečte od výsledku hodnotu C (= carry flag v SREG) a následný výsledek uloží do registru ${op[0]}`;
		},
		(op) => {
			return `Od registru ${op[0]} se odečte registr ${op[1]} a C a následný výsledek bude uložen do registru ${op[0]}`;
		}
	],
	"sbiw": [
		(op) => {
			if (op[0].match(/^[x-z]$/i))
				return `Odečte hodnotu ${op[1]} od hodnoty registru ${op[0]} a výsledek uloží do tohoto registru`;

			else
				return `Odečte hodnotu ${op[1]} od hodnoty páru registrů ${offsetR(op[0])}:${op[0]} a výsledek uloží do tohoto páru registrů`;
		},
		(op) => {
			if (op[0].match(/^[x-z]$/i))
				return `Od registru ${op[0]} se odečte hodnota ${op[1]} a výsledek bude uložen do tohoto registru`;

			else
				return `Od páru registrů ${offsetR(op[0])}:${op[0]} se odečte hodnota ${op[1]} a výsledek bude uložen do tohoto páru registrů`;
		}
	],
	"and": [
		(op) => {
			return `Provede logickou operaci AND s registry ${op[0]} a ${op[1]} a výsledek uloží do registru ${op[0]}`;
		},
		(op) => {
			return `Hodnoty registrů ${op[0]} a ${op[1]} spolu provedou AND a výsledek bude uložen do registru ${op[0]}`;
		}
	],
	"andi": [
		(op) => {
			return `Provede logickou operaci AND s registrem ${op[0]} a hodnoutou '${op[1]}' a výsledek uloží do registru ${op[0]}`;
		},
		(op) => {
			return `Hodnota registru ${op[0]} a hodnota '${op[1]}' spolu provedou AND a výsledek bude uložen do registru ${op[0]}`;
		}
	],
	"or": [
		(op) => {
			return `Provede logickou operaci OR s registry ${op[0]} a ${op[1]} a výsledek uloží do registru ${op[0]}`;
		},
		(op) => {
			return `Hodnoty registrů ${op[0]} a ${op[1]} spolu provedou OR a výsledek bude uložen do registru ${op[0]}`;
		}
	],
	"ori": [
		(op) => {
			return `Provede logickou operaci OR s registrem ${op[0]} a hodnoutou '${op[1]}' a výsledek uloží do registru ${op[0]}`;
		},
		(op) => {
			return `Hodnota registru ${op[0]} a hodnota '${op[1]}' spolu provedou OR a výsledek bude uložen do registru ${op[0]}`;
		}
	],
	"eor": [
		(op) => {
			return `Provede logickou operaci XOR (Exkluzivní OR) s registry ${op[0]} a ${op[1]} a výsledek uloží do registru ${op[0]}`;
		},
		(op) => {
			return `Hodnoty registrů ${op[0]} a ${op[1]} spolu provedou XOR a výsledek bude uložen do registru ${op[0]}`;
		}
	],
	"sbr": [
		(op) => {
			return `Nastaví ${op[1]}. bit v registru ${op[0]} na 1`;
		},
		(op) => {
			return `Registr ${op[0]} nastaví ${op[1]}. bit na 1`;
		}
	],
	"cbr": [
		(op) => {
			return `Nastaví ${op[1]}. bit v registru ${op[0]} na 0`;
		},
		(op) => {
			return `Registr ${op[0]} nastaví ${op[1]}. bit na 0`;
		}
	],
	"dec": [
		(op) => {
			return `Dekrementace registru ${op[0]} o 1`;
		},
		(op) => {
			return `Od registru ${op[0]} se odečte 1`;
		}
	],
	"clr": [
		(op) => {
			return `Nastaví všechny bity registru ${op[0]} na 0`;
		},
		(op) => {
			return `Registr ${op[0]} se vynuluje`;
		}
	],
	"ser": [
		(op) => {
			return `Nastaví všechny bity registru ${op[0]} na 1`;
		},
		(op) => {
			return `Registr ${op[0]} se nastaví na maxiální hodnotu`;
		}
	],
	"mul": [
		(op) => {
			return `Vynásobí nezáporné nedesetinné hodnoty registrů ${op[0]} a ${op[1]} a výsledek uloží do páru registrů ${haveUpperCase(op[0]) ? "R1:R0" : "r1:r0"}`;
		},
		(op) => {
			return `Nezáporné nedesetinné hodnoty registrů ${op[0]} a ${op[1]} se spolu vynásobí a výsledek bude uložen do páru registrů ${haveUpperCase(op[0]) ? "R1:R0" : "r1:r0"}`;
		}
	],
	"muls": [
		(op) => {
			return `Vynásobí nedesetinné hodnoty registrů ${op[0]} a ${op[1]} a výsledek uloží do páru registrů ${haveUpperCase(op[0]) ? "R1:R0" : "r1:r0"}`;
		},
		(op) => {
			return `Nedesetinné hodnoty registrů ${op[0]} a ${op[1]} se spolu vynásobí a výsledek bude uložen do páru registrů ${haveUpperCase(op[0]) ? "R1:R0" : "r1:r0"}`;
		}
	],
	"mulsu": [
		(op) => {
			return `Vynásobí nedesetinou hodnotu registru ${op[0]} a nedesetinou nezápornou hodnotu registru ${op[1]} a výsledek uloží do páru registrů ${haveUpperCase(op[0]) ? "R1:R0" : "r1:r0"}`;
		},
		(op) => {
			return `Nedesetiná hodnota registru ${op[0]} a nedesetiná nezáporná hodnota registru ${op[1]} se spolu vynásobí a výsledek bude uložen do páru registrů ${haveUpperCase(op[0]) ? "R1:R0" : "r1:r0"}`;
		}
	],
	"fmul": [
		(op) => {
			return `Vynásobí desetiné nezáporné hodnoty registrů ${op[0]} a ${op[1]} a výsledek uloží do páru registrů ${haveUpperCase(op[0]) ? "R1:R0" : "r1:r0"}`;
		},
		(op) => {
			return `Desetiné nezáporné hodnoty registrů ${op[0]} a ${op[1]} se spolu vynásobí a výsledek bude uložen do páru registrů ${haveUpperCase(op[0]) ? "R1:R0" : "r1:r0"}`;
		}
	],
	"fmuls": [
		(op) => {
			return `Vynásobí desetiné hodnoty registrů ${op[0]} a ${op[1]} a výsledek uloží do páru registrů ${haveUpperCase(op[0]) ? "R1:R0" : "r1:r0"}`;
		},
		(op) => {
			return `Desetiné hodnoty registrů ${op[0]} a ${op[1]} se spolu vynásobí a výsledek bude uložen do páru registrů ${haveUpperCase(op[0]) ? "R1:R0" : "r1:r0"}`;
		}
	],
	"fmulsu": [
		(op) => {
			return `Vynásobí desetinou hodnotu registru ${op[0]} a desetinou nezápornou hodnotu registru ${op[1]} a výsledek uloží do páru registrů ${haveUpperCase(op[0]) ? "R1:R0" : "r1:r0"}`;
		},
		(op) => {
			return `Desetiná hodnota registru ${op[0]} a desetiná nezáporná hodnota registru ${op[1]} se spolu vynásobí a výsledek bude uložen do páru registrů ${haveUpperCase(op[0]) ? "R1:R0" : "r1:r0"}`;
		}
	],

	// Flow/Větvení
	"rjmp": [
		(op) => {
			return isLabelString(op[0]) ? `(Relativní) skok na návěstí "${op[0]}"` : `Relativní skok o ${op[0]}`;
		},
		(op) => {
			return isLabelString(op[0]) ? `Skočí se na návěstí "${op[0]}"` : `Skočí se o ${op[0]}`;
		}
	],
	"rcall": [
		(op) => {
			return "Umístění hodnoty PC do zásobníku + " + (isLabelString(op[0]) ? `(Relativní) skok na návěstí "${op[0]}"` : `Relativní skok o ${op[0]}`);
		},
		(op) => {
			return (isLabelString(op[0]) ? `Skočí se na návěstí "${op[0]}"` : `Skočí se o ${op[0]}`) + " a současná adresa se uloží do zásobníku";
		}
	],
	"ret": [
		() => {
			return "Poslední hodnota ze zásobníku se přesune do PC";
		},
		() => {
			return "Vyndá se poslední adresa ze zásobníku, na kterou se následně skočí";
		}
	],
	"breq": [
		(op) => {
			return isLabelString(op[0]) ? `Pokud Z (= zero flag v SREG) je roven jedničce, (relativní) skok na návěstí "${op[0]}", jinak se pokračuje dál` : `Pokud Z (= zero flag v SREG) je roven jedničce, relativní skok o "${op[0]}", jinak se pokračuje dál`;
		},
		(op) => {
			return isLabelString(op[0]) ? `Skočí se na návěstí "${op[0]}" pokud je nastaveno Z` : `Skočí se o "${op[0]}" pokud je nastaveno Z`;
		}
	],
	"brne": [
		(op) => {
			return isLabelString(op[0]) ? `Pokud Z (= zero flag v SREG) je rovno nule, (relativní) skok na návěstí "${op[0]}", jinak se pokračuje dál` : `Pokud Z (= zero flag v SREG) je rovno nule, relativní skok o "${op[0]}", jinak se pokračuje dál`;
		},
		(op) => {
			return isLabelString(op[0]) ? `Skočí se na návěstí "${op[0]}" pokud není nastaveno Z` : `Skočí se o "${op[0]}" pokud není nastaveno Z`;
		}
	],

	// Bitwise
	"lsl": [
		(op) => {
			return `Posune bity v registru ${op[0]} doleva (původní MSB bude ztracen)`;
		},
		(op) => {
			return `V registru ${op[0]} se posunou bity doleva`;
		}
	],
	"lsr": [
		(op) => {
			return `Posune bity v registru ${op[0]} doprava (původní LSB bude ztracen)`;
		},
		(op) => {
			return `V registru ${op[0]} se posunou bity doprava`;
		}
	],
	"rol": [
		(op) => {
			return `Posune bity v registru ${op[0]} doleva přes Carry (půsodní MSB se stane současním LSB)`;
		},
		(op) => {
			return `V registru ${op[0]} se posunou bity doleva přes Carry`;
		}
	],
	"ror": [
		(op) => {
			return `Posune bity v registru ${op[0]} doprava přes Carry (půsodní LSB se stane současním MSB)`;
		},
		(op) => {
			return `V registru ${op[0]} se posunou bity doprava přes Carry`;
		}
	],
	"swap": [
		(op) => {
			return `V registru ${op[0]} prohodí nibbly/půlbajty`;
		},
		(op) => {
			return `Prohození nibblů/půlbajtů v registru ${op[0]}`;
		}
	],

	// Přesun
	"mov": [
		(op) => {
			return `Přesunutí/Zkopírování hodnoty registru '${op[1]}' do registru ${op[0]}`;
		},
		(op) => {
			return `Hodnota registru '${op[1]}' se zkopíruje do registru ${op[0]}`;
		}
	],
	"ldi": [
		(op) => {
			return `Načtení/zápis hodnoty '${op[1]}' do registru ${op[0]}`;
		},
		(op) => {
			return `Hodnota '${op[1]}' se zapíše do registru ${op[0]}`;
		}
	],
	"ld": [
		(op) => {
			let r = op[1].match(/\w/)[0];
			if (op[1].length == 2) {
				if (op[1][0] == "-")
					return `Dekrementace registru ${r} + Načtení/zápis hodnoty z paměti na adrese, která je uložena v registru ${r} do registru ${op[0]}`;
				else
					return `Načtení/zápis hodnoty z paměti na adrese, která je uložena v registru ${r} do registru ${op[0]} + Inkrementace registru ${r}`;
			} else {
				return `Načtení/zápis hodnoty z paměti na adrese, která je uložena v registru ${r} do registru ${op[0]}`;
			}
		},
		(op) => {
			let r = op[1].match(/\w/)[0];
			if (op[1].length == 2) {
				if (op[1][0] == "-")
					return `Od registru ${r} se odečte 1 a z paměti na adrese rovné hodnotě registru ${r} se zapíše hodnota do registru ${op[0]}`;
				else
					return `Z paměti na adrese rovné hodnotě registru ${r} se zapíše hodnota do registru ${op[0]} a k registru ${r} se přičte 1`;
			} else {
				return `Z paměti na adrese rovné hodnotě registru ${r} se zapíše hodnota do registru ${op[0]}`;
			}
		}
	],
	"ldd": [
		(op) => {
			let r = op[1][0];
			let z = op[1][1];
			let v = op[1].substr(2);
			return `Načtení/zápis hodnoty z paměti na adrese, která je rovna hodnotě v registru ${r} ${z} ${v} do registru ${op[0]}`;
		},
		(op) => {
			let r = op[1][0];
			let z = op[1][1];
			let v = op[1].substr(2);
			return `Z paměti na adrese rovné hodnotě v registru ${r} ${z} ${v} se zapíše hodnota do registru ${op[0]}`;
		}
	],
	"lds": [
		(op) => {
			return `Načtení/zápis hodnoty z paměti na adrese '${op[1]}' do registru ${op[0]}`;
		},
		(op) => {
			return `Z paměti na adrese '${op[1]}' se zapíše hodnota do registru ${op[0]}`;
		}
	],
	"sts": [
		(op) => {
			return `Načtení/zápis hotnoty registru '${op[1]}' do paměti na adrese ${op[0]}`;
		},
		(op) => {
			return `Z registru '${op[1]}' se zapíše hodnota do paměti na adrese ${op[0]}`;
		}
	],
	"in": [
		(op) => {
			return `Načtení hodnoty z portu ${op[1]} do registru ${op[0]}`;
		},
		(op) => {
			return `Ze vstupního portu ${op[0]} se zapíše hodnota do registru ${op[1]}`;
		}
	],
	"out": [
		(op) => {
			return `Načtení hodnoty z registru ${op[1]} na port ${op[0]}`;
		},
		(op) => {
			return `Z registru ${op[1]} se zapíše hodnota na výstupní port ${op[0]}`;
		}
	],
	"push": [
		(op) => {
			return `Umístění hodnoty v registru ${op[0]} do zásobníku`;
		},
		(op) => {
			return `Hodnota, která je v registru ${op[0]} se uloží do zásobníku`;
		}
	],
	"pop": [
		(op) => {
			return `Umístění hodnoty ze zásobníku do registru ${op[0]}`;
		},
		(op) => {
			return `Hodnota, která je v zásobníku se uloží do registru ${op[0]}`;
		}
	],

	// Ostatní
	"nop": [
		() => {
			return `"Nulová instrukce" - Nic se nevykoná`;
		},
		() => {
			return `Prázdná instrukce - Nic se neprovede`;
		}
	],
};
/*
Inteligentní komentátor:
(operátory, parsovaný kód, index řádky)
parsovaný kód	- Obsahuje "lineData" objekty, NE parsované řádky
index řádky		- Číslo/index řádky, kterou zrovna chceme okomentovat
				- Počítáme od nuly (takže abychom dostali celou současnou řádku, tak můžeme udělat 'parsovaný kód[index řádky]')

(op, parsedCode, lineIndex) => {

}
*/
const intelligentCommenters = [];
