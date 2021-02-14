const OTHER_DATA = {
	"INTERRUPT_TABLE_ADDRESSES": {
		0x0000:	{name: "",			desc: "Reset"}, //TODO: This
		0x0002:	{name: "INT0addr",	desc: "External Interrupt Request 0 (pin D2)"}, //TODO: This
		0x0004:	{name: "INT1addr",	desc: "External Interrupt Request 1 (pin D3)"}, //TODO: This
		0x0006:	{name: "PCI0addr",	desc: "Pin Change Interrupt Request 0 (pins D8 to D13)"}, //TODO: This
		0x0008:	{name: "PCI1addr",	desc: "Pin Change Interrupt Request 1 (pins A0 to A5)"}, //TODO: This
		0x000A:	{name: "PCI2addr",	desc: "Pin Change Interrupt Request 2 (pins D0 to D7)"}, //TODO: This
		0x000C:	{name: "WDTaddr",	desc: "Watchdog Timeout Interrupt"}, //TODO: This
		0x000E:	{name: "OC2Aaddr",	desc: "Timer/Counter2 Compare Match A"}, //TODO: This
		0x0010:	{name: "OC2Baddr",	desc: "Timer/Counter2 Compare Match B"}, //TODO: This
		0x0012:	{name: "OVF2addr",	desc: "Přetečení časovače/čítače 2"},
		0x0014:	{name: "ICP1addr",	desc: "Timer/Counter1 Capture Event"}, //TODO: This
		0x0016:	{name: "OC1Aaddr",	desc: "Timer/Counter1 Compare Match A"}, //TODO: This
		0x0018:	{name: "OC1Baddr",	desc: "Timer/Counter1 Compare Match B"}, //TODO: This
		0x001A:	{name: "OVF1addr",	desc: "Přetečení časovače/čítače 1"},
		0x001C:	{name: "OC0Aaddr",	desc: "Timer/Counter0 Compare Match A"}, //TODO: This
		0x001E:	{name: "OC0Baddr",	desc: "Timer/Counter0 Compare Match B"}, //TODO: This
		0x0020:	{name: "OVF0addr",	desc: "Přetečení časovače/čítače 0"},
		0x0022:	{name: "SPIaddr",	desc: "SPI Serial Transfer Complete"}, //TODO: This
		0x0024:	{name: "URXCaddr",	desc: "USART, Rx Complete"}, //TODO: This
		0x0026:	{name: "UDREaddr",	desc: "USART, Data Register Empty"}, //TODO: This
		0x0028:	{name: "UTXCaddr",	desc: "USART, Tx Complete"}, //TODO: This
		0x002A:	{name: "ADCCaddr",	desc: "ADC Conversion Complete"}, //TODO: This
		0x002C:	{name: "ERDYaddr",	desc: "READY EEPROM Ready"}, //TODO: This
		0x002E:	{name: "ACIaddr",	desc: "Analog Comparator"}, //TODO: This
		0x0030:	{name: "TWIaddr",	desc: "2-wire Serial Interface (I2C)"}, //TODO: This
		0x0032:	{name: "SPMRaddr",	desc: "Store Program Memory Ready"}, //TODO: This
	}
}

const predefinedArray = [
	new Predefined("RAMEND", "Adresa na které končí paměť"),

	new Predefined("SPL"),
	new Predefined("SPH"),

	new Predefined("DDRB"),
	new Predefined("PORTB"),
	new Predefined("DDRD"),
	new Predefined("PORTD"),

	new Predefined("PINB0"),

	new Predefined("TCCR0B"),
	new Predefined("TIMSK0"),
	new Predefined("TCNT0"),



	// INTERRUPT VECTOR TABLE
	new Predefined("INT0addr",	"External Interrupt Request 0 (pin D2)", 0x0002),
	new Predefined("INT1addr",	"External Interrupt Request 1 (pin D3)", 0x0004),
	new Predefined("PCI0addr",	"Pin Change Interrupt Request 0 (pins D8 to D13)", 0x0006),
	new Predefined("PCI1addr",	"Pin Change Interrupt Request 1 (pins A0 to A5)", 0x0008),
	new Predefined("PCI2addr",	"Pin Change Interrupt Request 2 (pins D0 to D7)", 0x000A),
	new Predefined("WDTaddr",	"Watchdog Timeout Interrupt", 0x000C),
	new Predefined("OC2Aaddr",	"Timer/Counter2 Compare Match A", 0x000E),
	new Predefined("OC2Baddr",	"Timer/Counter2 Compare Match B", 0x0010),
	new Predefined("OVF2addr",	"Timer/Counter2 Overflow", 0x0012),
	new Predefined("ICP1addr",	"Timer/Counter1 Capture Event", 0x0014),
	new Predefined("OC1Aaddr",	"Timer/Counter1 Compare Match A", 0x0016),
	new Predefined("OC1Baddr",	"Timer/Counter1 Compare Match B", 0x0018),
	new Predefined("OVF1addr",	"Timer/Counter1 Overflow", 0x001A),
	new Predefined("OC0Aaddr",	"Timer/Counter0 Compare Match A", 0x001C),
	new Predefined("OC0Baddr",	"Timer/Counter0 Compare Match B", 0x001E),
	new Predefined("OVF0addr",	"Timer/Counter0 Overflow", 0x0020),
	new Predefined("SPIaddr",	"SPI Serial Transfer Complete", 0x0022),
	new Predefined("URXCaddr",	"USART, Rx Complete", 0x0024),
	new Predefined("UDREaddr",	"USART, Data Register Empty", 0x0026),
	new Predefined("UTXCaddr",	"USART, Tx Complete", 0x0028),
	new Predefined("ADCCaddr",	"ADC Conversion Complete", 0x002A),
	new Predefined("ERDYaddr",	"READY EEPROM Ready", 0x002C),
	new Predefined("ACIaddr",	"Analog Comparator", 0x002E),
	new Predefined("TWIaddr",	"2-wire Serial Interface (I2C)", 0x0030),
	new Predefined("SPMRaddr",	"Store Program Memory Ready", 0x0032),
];
let constantMapping = {};
for (let predefined of predefinedArray) constantMapping[predefined.name] = predefined;

Object.freeze(constantMapping);
let predefinedFunctionMapping = {
	"LOW": x => {
		return typeof(x) == "number" ? x & 0b11111111 : null;
	},
	"HIGH": x => {
		return typeof(x) == "number" ? x & 0b1111111100000000 : null;
	}
};
Object.freeze(predefinedFunctionMapping);

//TODO: Instrukce movw, .cseg, .db

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
			if (op[0] instanceof Operator_IndirectRegister)
				return `Přidá hodnotu ${op[1]} k hodnotě registru ${op[0]} a výsledek uloží do tohoto registru`;
			else
				return `Přidá hodnotu ${op[1]} k hodnotě páru registrů ${op[0].offsetRegister(1)}:${op[0]} a výsledek uloží do tohoto páru registrů`;
		},
		(op) => {
			if (op[0] instanceof Operator_IndirectRegister)
				return `K registru ${op[0]} se přičte hodnota ${op[1]} a výsledek bude uložen do tohoto registru`;
			else
				return `K páru registrů ${op[0].offsetRegister(1)}:${op[0]} se přičte hodnota ${op[1]} a výsledek bude uložen do tohoto páru registrů`;
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
			if (op[0] instanceof Operator_IndirectRegister)
				return `Odečte hodnotu ${op[1]} od hodnoty registru ${op[0]} a výsledek uloží do tohoto registru`;
			else
				return `Odečte hodnotu ${op[1]} od hodnoty páru registrů${op[0].offsetRegister(1)}:${op[0]} a výsledek uloží do tohoto páru registrů`;
		},
		(op) => {
			if (op[0] instanceof Operator_IndirectRegister)
				return `Od registru ${op[0]} se odečte hodnota ${op[1]} a výsledek bude uložen do tohoto registru`;
			else
				return `Od páru registrů ${op[0].offsetRegister(1)}:${op[0]} se odečte hodnota ${op[1]} a výsledek bude uložen do tohoto páru registrů`;
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
	"inc": [
		(op) => {
			return `Inkrementace registru ${op[0]} o 1`;
		},
		(op) => {
			return `K registru ${op[0]} se přičte 1`;
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
			return `Vynásobí nezáporné nedesetinné hodnoty registrů ${op[0]} a ${op[1]} a výsledek uloží do páru registrů ${haveUpperCase(op[0].register) ? "R1:R0" : "r1:r0"}`;
		},
		(op) => {
			return `Nezáporné nedesetinné hodnoty registrů ${op[0]} a ${op[1]} se spolu vynásobí a výsledek bude uložen do páru registrů ${haveUpperCase(op[0].register) ? "R1:R0" : "r1:r0"}`;
		}
	],
	"muls": [
		(op) => {
			return `Vynásobí nedesetinné hodnoty registrů ${op[0]} a ${op[1]} a výsledek uloží do páru registrů ${haveUpperCase(op[0].register) ? "R1:R0" : "r1:r0"}`;
		},
		(op) => {
			return `Nedesetinné hodnoty registrů ${op[0]} a ${op[1]} se spolu vynásobí a výsledek bude uložen do páru registrů ${haveUpperCase(op[0].register) ? "R1:R0" : "r1:r0"}`;
		}
	],
	"mulsu": [
		(op) => {
			return `Vynásobí nedesetinou hodnotu registru ${op[0]} a nedesetinou nezápornou hodnotu registru ${op[1]} a výsledek uloží do páru registrů ${haveUpperCase(op[0].register) ? "R1:R0" : "r1:r0"}`;
		},
		(op) => {
			return `Nedesetiná hodnota registru ${op[0]} a nedesetiná nezáporná hodnota registru ${op[1]} se spolu vynásobí a výsledek bude uložen do páru registrů ${haveUpperCase(op[0].register) ? "R1:R0" : "r1:r0"}`;
		}
	],
	"fmul": [
		(op) => {
			return `Vynásobí desetiné nezáporné hodnoty registrů ${op[0]} a ${op[1]} a výsledek uloží do páru registrů ${haveUpperCase(op[0].register) ? "R1:R0" : "r1:r0"}`;
		},
		(op) => {
			return `Desetiné nezáporné hodnoty registrů ${op[0]} a ${op[1]} se spolu vynásobí a výsledek bude uložen do páru registrů ${haveUpperCase(op[0].register) ? "R1:R0" : "r1:r0"}`;
		}
	],
	"fmuls": [
		(op) => {
			return `Vynásobí desetiné hodnoty registrů ${op[0]} a ${op[1]} a výsledek uloží do páru registrů ${haveUpperCase(op[0].register) ? "R1:R0" : "r1:r0"}`;
		},
		(op) => {
			return `Desetiné hodnoty registrů ${op[0]} a ${op[1]} se spolu vynásobí a výsledek bude uložen do páru registrů ${haveUpperCase(op[0].register) ? "R1:R0" : "r1:r0"}`;
		}
	],
	"fmulsu": [
		(op) => {
			return `Vynásobí desetinou hodnotu registru ${op[0]} a desetinou nezápornou hodnotu registru ${op[1]} a výsledek uloží do páru registrů ${haveUpperCase(op[0].register) ? "R1:R0" : "r1:r0"}`;
		},
		(op) => {
			return `Desetiná hodnota registru ${op[0]} a desetiná nezáporná hodnota registru ${op[1]} se spolu vynásobí a výsledek bude uložen do páru registrů ${haveUpperCase(op[0].register) ? "R1:R0" : "r1:r0"}`;
		}
	],

	// Flow/Větvení
	"rjmp": [
		(op) => {
			return op[0] instanceof Operator_Label ? `(Relativní) skok na návěstí "${op[0]}"` : `Relativní skok o ${op[0]}`;
		},
		(op) => {
			return op[0] instanceof Operator_Label ? `Skočí se na návěstí "${op[0]}"` : `Skočí se o ${op[0]}`;
		}
	],
	"rcall": [
		(op) => {
			return "Umístění hodnoty PC do zásobníku + " + (op[0] instanceof Operator_Label ? `(Relativní) skok na návěstí "${op[0]}"` : `Relativní skok o ${op[0]}`);
		},
		(op) => {
			return (op[0] instanceof Operator_Label ? `Skočí se na návěstí "${op[0]}"` : `Skočí se o ${op[0]}`) + " a současná adresa se uloží do zásobníku";
		}
	],
	"ret": [
		() => {
			return "Poslední hodnota ze zásobníku se přesune do PC";
		},
		() => {
			return "Vyndá se poslední adresa ze zásobníku, na kterou se následně skočí";
		},
		() => {
			return "Navrácení se ze subrutiny";
		}
	],
	"reti": [
		() => {
			return "Ze zásobníku se obnoví stav před přerušením";
		},
		() => {
			return "Navrácení se ze zpracování přerušení";
		}
	],
	"cpi": [
		(op) => {
			return `Hodnota registru ${op[0]} se porovná s hodnotou ${op[1]}`;
		},
		(op) => {
			return `Porovná se hodnota registru ${op[0]} a hodnota ${op[1]}`;
		}
	],
	"breq": [
		(op) => {
			return op[0] instanceof Operator_Label ? `Pokud Z (= zero flag v SREG) je roven jedničce, (relativní) skok na návěstí "${op[0]}", jinak se pokračuje dál` : `Pokud Z (= zero flag v SREG) je roven jedničce, relativní skok o "${op[0]}", jinak se pokračuje dál`;
		},
		(op) => {
			return op[0] instanceof Operator_Label ? `Skočí se na návěstí "${op[0]}" pokud je nastaveno Z` : `Skočí se o "${op[0]}" pokud je nastaveno Z`;
		}
	],
	"brne": [
		(op) => {
			return op[0] instanceof Operator_Label ? `Pokud Z (= zero flag v SREG) je rovno nule (flag není nastaven), (relativní) skok na návěstí "${op[0]}", jinak se pokračuje dál` : `Pokud Z (= zero flag v SREG) je rovno nule (flag není nastaven), relativní skok o "${op[0]}", jinak se pokračuje dál`;
		},
		(op) => {
			return op[0] instanceof Operator_Label ? `Skočí se na návěstí "${op[0]}" pokud není nastaveno Z` : `Skočí se o "${op[0]}" pokud není nastaveno Z`;
		}
	],

	// Bitwise
	"sbi": [
		(op) => {
			return `Nastaví ${op[1].value}. bit ` + (op[0] instanceof Operator_Number ? `na adrese ${op[0]}` : `v registru ${op[0]}`);
		},
		(op) => {
			return `Hodnota bitu číslo ${op[1].value} ` + (op[0] instanceof Operator_Number ? `na adrese ${op[0]}` : `v registru ${op[0]}`) + "se nastaví na 1";
		}
	],
	"cbi": [
		(op) => {
			return `Vymaže ${op[1].value}. bit ` + (op[0] instanceof Operator_Number ? `na adrese ${op[0]}` : `v registru ${op[0]}`);
		},
		(op) => {
			return `Hodnota bitu číslo ${op[1].value} ` + (op[0] instanceof Operator_Number ? `na adrese ${op[0]}` : `v registru ${op[0]}`) + "se nastaví na 0";
		}
	],
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
	"sei": [
		(op) => {
			return `Nastaví se I (= interrupt enable flag v SREG)`;
		},
		(op) => {
			return `Povolí se globální přerušení`;
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
			switch (op[1].mode) {
				case Operator_IndirectRegister.Modes.SIMPLE:
					return `Načtení/zápis hodnoty z paměti na adrese, která je uložena v registru ${op[0].register} do registru ${op[0]}`;
				case Operator_IndirectRegister.Modes.PREDEC:
					return `Dekrementace registru ${op[0].register} + Načtení/zápis hodnoty z paměti na adrese, která je uložena v registru ${op[0].register} do registru ${op[0]}`;
				case Operator_IndirectRegister.Modes.POSTINC:
					return `Načtení/zápis hodnoty z paměti na adrese, která je uložena v registru ${op[0].register} do registru ${op[0]} + Inkrementace registru ${op[0].register}`;
				default:
					throw new Error("Nečekaná hodnota u registro pro něpřímé adresování")
			}
		},
		(op) => {
			switch (op[1].mode) {
				case Operator_IndirectRegister.Modes.SIMPLE:
					return `Z paměti na adrese rovné hodnotě registru ${op[0].register} se zapíše hodnota do registru ${op[0]}`;
				case Operator_IndirectRegister.Modes.PREDEC:
					return `Od registru ${op[0].register} se odečte 1 a z paměti na adrese rovné hodnotě registru ${op[0].register} se zapíše hodnota do registru ${op[0]}`;
				case Operator_IndirectRegister.Modes.POSTINC:
					return `Z paměti na adrese rovné hodnotě registru ${op[0].register} se zapíše hodnota do registru ${op[0]} a k registru ${op[0].register} se přičte 1`;
				default:
					throw new Error("Nečekaná hodnota u registro pro něpřímé adresování")
			}
		}
	],
	"ldd": [
		(op) => {
			return `Načtení/zápis hodnoty z paměti na adrese, která je rovna hodnotě v registru ${op[1].name} + ${op[1].offset} do registru ${op[0]}`;
		},
		(op) => {
			return `Z paměti na adrese rovné hodnotě v registru ${op[1].name} + ${op[1].offset} se zapíše hodnota do registru ${op[0]}`;
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
(lineData, parsovaný kód, index řádky)
parsovaný kód	- Obsahuje "lineData" objekty, NE parsované/splitnuté řádky
index řádky		- Číslo/index řádky, kterou zrovna chceme okomentovat
				- Počítáme od nuly (takže abychom dostali celou současnou řádku, tak můžeme udělat 'parsovaný kód[index řádky]')

POZOR! Je zde změna oproti normální komentátorům:
	Normální komenátor vrací string, ve kterém je obsažen vygenerovaný komentář.
	Inteligentní komentátor by měl vrátit bool, který indikuje, zda byl komentář vygenerován.
	Tzn. že inteligentní komenátor musí jak dosadit do lineData vygenerovaný komentář, tak nastavit i 'processed' "flag".

new IntelligentCommenter(function(lineData, parsedCode, lineIndex) {
	return false;
}, [""], "")

POZOR! (ještě jednou):
	Tohle je JS. Pozor na scoping! Nelze napsat '(lineData, parsedCode, lineIndex) => { ... }', jelikož pak nelze přistupovat k vlastnostem IntelligentCompleter(u).
	Argument 'commenter' musí mít "vlastní" scope - pokud použijeme arrow funkci, scopem bude global scope (= window).
*/

const intelligentCommenters = [
	new IntelligentCommenter(function(lineData, parsedCode, lineIndex) {
		if (lineData.operators[0].comparableValue == lineData.operators[1].comparableValue) {
			lineData.generatedComment = `Hodnota registru se nemění, pouze se nastaví Z flag, pokud jsou všechny bit registru na nule`;
			lineData.generatedComment = [
				`Hodnota registru ${lineData.operators[0].register} se nemění, pouze se nastaví Z flag, pokud jsou všechny bit registru na nule`,
				`Pokud je hodnota registru ${lineData.operators[0].register} nula, nastaví se Z flag na jedna (registr zůstává stejný)`
			][this.settings];
			lineData.processed = true;
		}
		return false;
	}, ["and", "or"], "Set Z Flag", getRandom(0,1)),
	
	new IntelligentCommenter(function(lineData, parsedCode, lineIndex) {
		let previousLine = getPreviousSureInstruction(parsedCode, lineIndex);
		if (previousLine?.instruction == ".org") {
			if (previousLine.operators[0].value in OTHER_DATA.INTERRUPT_TABLE_ADDRESSES) {
				let addrInfo = OTHER_DATA.INTERRUPT_TABLE_ADDRESSES[previousLine.operators[0].value];
				previousLine.generatedComment = [
					`Jelikož se kód nachází na adrese ${previousLine.operators[0]}, tak...`,
					`Následují skok je na adrese ${previousLine.operators[0]}, tudíž...`
				][this.settings & 1];
				previousLine.processed = true;
				lineData.generatedComment = [
					`...při přerušení, kdy nastane ${addrInfo.desc.toLowerCase()}, se provede ${lineData.instruction == 'rjmp' ? '(relativní) ' : ''}skok na ${lineData.operators[0] instanceof Operator_Label ? 'návěstí "' + lineData.operators[0].value + '"' : 'adresu' + lineData.operators[0].value}`,
					`...když nastane ${addrInfo.desc.toLowerCase()}, ${lineData.instruction == 'rjmp' ? 'relativně se skočí' : 'skočí se'} na ${lineData.operators[0] instanceof Operator_Label ? 'návěstí "' + lineData.operators[0].value + '"' : 'adresu' + lineData.operators[0].value}`
				][this.settings & 2];
				lineData.processed = true;
			}
		}
		return false;
	}, ["rjmp", "jmp"], "Interupt table jump", getRandom(0,3))
];