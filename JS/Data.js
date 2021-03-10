class Operator_GeneralRegister extends Operator {
	static validator = value => value.match(/^(?:r\d\d?)$/i) !== null;
	register = "";
	registerNumber = 0;
	get comparableValue() {
		return this.register.toLocaleLowerCase() + this.registerNumber;
	}
	constructor(value) {
		super(value);
		this.register = value;
		this.registerNumber = Number(value.slice(1));
	}
	offsetRegister(offset) {
		return "r" + (this.registerNumber + offset);
	}
}
class Operator_RegisterRange extends Operator {
	static validator = value => value.match(/^(?:r\d\d?):(?:r\d\d?)$/i) !== null;
	registers = [];
	registerNumbers = [];
	get comparableValue() {
		return this.registers.join(":").toLocaleLowerCase();
	}
	constructor(value) {
		super(value);
		this.registers = value.split(":");
		this.registerNumbers = value.split(":").map(x => Number(x.slice(1)));
	}
	offsetRegisters(offset) {
		let offseted = [];
		for (let x of this.registerNumbers) offseted.push(x + offset);
		return "r" + offset.join(":r");
	}
}
class Operator_IndirectRegister extends Operator {
	static validator = value => value.match(/^(?:(?:[XYZ])|(?:-\s*[XYZ])|(?:[XYZ]\s*\+)|(?:[YZ]\s*\+\s*\d+))$/i) !== null;

	static #modes = Object.freeze({SIMPLE:0,PREDEC:1,POSTINC:2,OFFSET:3});
	static get Modes() {
		return this.#modes;
	}
	// Proč? Viz Operator_Number.

	mode = 0;
	register = "";
	offset = 0;
	get comparableValue() {
		switch (this.mode) {
			case Operator_IndirectRegister.Modes.SIMPLE:
				return this.register.toUpperCase();
			case Operator_IndirectRegister.Modes.PREDEC:
				return "-" + this.register.toUpperCase();
			case Operator_IndirectRegister.Modes.POSTINC:
				return this.register.toUpperCase() + "+";
			case Operator_IndirectRegister.Modes.OFFSET:
				return this.register.toUpperCase() + "+" + this.offset;
		}
	}
	constructor(value) {
		super(value);
		if (value.length == 1) {
			this.mode = Operator_IndirectRegister.Modes.SIMPLE;
			this.register = value;
		} else {
			let match = value.match(/^(?:-\s*([XYZ]))$/);
			if (match == null) {
				let match = value.match(/^(?:([XYZ])\s*\+)$/);
				if (match == null) {
					let match = value.match(/^(?:([YZ])\s*\+\s*(\d+))$/);
					this.mode = Operator_IndirectRegister.Modes.OFFSET;
					this.register = match[1];
					this.offset = Number(match[2]);
				} else {
					this.mode = Operator_IndirectRegister.Modes.POSTINC;
					this.register = match[1];
				}
			} else {
				this.mode = Operator_IndirectRegister.Modes.PREDEC;
				this.register = match[1];
			}
		}
	}
}
class Operator_Number extends Operator {
	static validator = value => value.match(/^(?:(?:0b[01]+)|(?:(?:0x|\$)[0-9A-Fa-f]+)|(?:\d+))$/i) !== null;

	static #radixes = Object.freeze({BIN:2,OCT:8,DEC:10,HEX:16});
	static get Radixes() {
		return this.#radixes;
	}
	/*
	Takže... JS zatím nepodporuje enumy. ("zatím", protože zde máme "enum" keyword, který je zatím jen rezervovaný - IDK kdy enumy budou, jsem línej hledat TC39 proposal)
	Co s tím? Uděláme objekt, který freezneme.
	"Ok, ale proč tu máme tuhle věc s privatním statickým fieldem a getterem?"
	Protože JS nepodporuje konstantní (static) fieldy (a já to chci mít encapsulovaný v classe). Takže si uděláme privátní statický field, kam dáme ten freeznutý objekt.
	*/

	radix;
	value = 0;
	get comparableValue() {
		return this.value;
	}
	constructor(value) {
		super(value);
		if (value.startsWith("0")) {
			switch (value[1]) {
				case "x":
					this.radix = Operator_Number.Radixes.HEX;
					this.value = Number(value);
					break;
				case "b":
					this.radix = Operator_Number.Radixes.BIN;
					this.value = Number(value);
					break;
				default:
					this.radix = Operator_Number.Radixes.OCT;
					this.value = Number("0o" + value); //Tu jednu nulu zleva (v originální hodnotě) můžeme ignorovat...
					break;
			}
		} else if (value.startsWith("$")) {
			this.radix = Operator_Number.Radixes.HEX;
			this.value = Number("0x" + value.slice(1));
		} else {
			this.radix = Operator_Number.Radixes.DEC;
			this.value = Number(value);
		}
	}
}
class Operator_String extends Operator {
	static validator = value => value.match(/^(?:(?:'\\'')|(?:'[^']')|(?:(?<!\\)"(?:(?:\\")|[^"])*?(?<!\\)"))$/) !== null;
	value = "";
	get comparableValue() {
		return this.value;
	}
	constructor(value) {
		super(value);
		this.value = value.slice(1,-1);
	}
}
class Operator_Predefined extends Operator {
	static validator = value => value.toUpperCase() in predefinedMapping;
	name = "";
	get comparableValue() {
		return this.name.toUpperCase();
	}
	get value() {
		return this.getPredefined()?.value ?? null;
	}
	constructor(value) {
		super(value);
		this.name = value;
	}
	getPredefined() {
		return predefinedMapping[this.name.toUpperCase()] ?? null;
	}
}
class Operator_Modified extends Operator {
	static validator = function(value) {
		for (let modifier of modifiers) {
			let parserOutput = modifier.parse(value);
			if (parserOutput !== null)
				return {
					value: value,
					modifier: modifier,
					parsed: parserOutput
				};
		}
		return false;
	};

	modifier = null;
	childs = [];
	value = null;
	
	get comparableValue() {
		return this.value ?? this.originalValue;
	}

	constructor(validatorOutput) {
		super(validatorOutput.value);
		this.modifier = validatorOutput.modifier;
		this.childs = parseOps(validatorOutput.parsed);
		this.value = this.modifier.resolve(this.childs);
	}
}
class Operator_Label extends Operator {
	static validator = value => value.match(/^[a-zA-Z]\w*/) !== null;
	value = "";
	get comparableValue() {
		return this.value;
	}
	constructor(value) {
		super(value);
		this.value = value;
	}
}
let operatorCheckOrder = [Operator_GeneralRegister, Operator_Number, Operator_IndirectRegister, Operator_Predefined, Operator_String, Operator_RegisterRange, Operator_Modified, Operator_Label];


const OTHER_DATA = {
	"INTERRUPT_TABLE_ADDRESSES": {
		0x0000:	{name: "",			desc: "reset"},
		0x0002:	{name: "INT0addr",	desc: "External Interrupt Request 0 (pin D2)"}, //TODO: This
		0x0004:	{name: "INT1addr",	desc: "External Interrupt Request 1 (pin D3)"}, //TODO: This
		0x0006:	{name: "PCI0addr",	desc: "Pin Change Interrupt Request 0 (pins D8 to D13)"}, //TODO: This
		0x0008:	{name: "PCI1addr",	desc: "Pin Change Interrupt Request 1 (pins A0 to A5)"}, //TODO: This
		0x000A:	{name: "PCI2addr",	desc: "Pin Change Interrupt Request 2 (pins D0 to D7)"}, //TODO: This
		0x000C:	{name: "WDTaddr",	desc: "Watchdog Timeout Interrupt"}, //TODO: This
		0x000E:	{name: "OC2Aaddr",	desc: "Timer/Counter2 Compare Match A"}, //TODO: This
		0x0010:	{name: "OC2Baddr",	desc: "Timer/Counter2 Compare Match B"}, //TODO: This
		0x0012:	{name: "OVF2addr",	desc: "přetečení časovače/čítače 2"},
		0x0014:	{name: "ICP1addr",	desc: "Timer/Counter1 Capture Event"}, //TODO: This
		0x0016:	{name: "OC1Aaddr",	desc: "Timer/Counter1 Compare Match A"}, //TODO: This
		0x0018:	{name: "OC1Baddr",	desc: "Timer/Counter1 Compare Match B"}, //TODO: This
		0x001A:	{name: "OVF1addr",	desc: "přetečení časovače/čítače 1"},
		0x001C:	{name: "OC0Aaddr",	desc: "Timer/Counter0 Compare Match A"}, //TODO: This
		0x001E:	{name: "OC0Baddr",	desc: "Timer/Counter0 Compare Match B"}, //TODO: This
		0x0020:	{name: "OVF0addr",	desc: "přetečení časovače/čítače 0"},
		0x0022:	{name: "SPIaddr",	desc: "SPI Serial Transfer Complete"}, //TODO: This
		0x0024:	{name: "URXCaddr",	desc: "USART, Rx Complete"}, //TODO: This
		0x0026:	{name: "UDREaddr",	desc: "USART, Data Register Empty"}, //TODO: This
		0x0028:	{name: "UTXCaddr",	desc: "USART, Tx Complete"}, //TODO: This
		0x002A:	{name: "ADCCaddr",	desc: "dokončen převod ADC převodníku"},
		0x002C:	{name: "ERDYaddr",	desc: "READY EEPROM Ready"}, //TODO: This
		0x002E:	{name: "ACIaddr",	desc: "změna stavu analogového komparátoru"},
		0x0030:	{name: "TWIaddr",	desc: "2-wire Serial Interface (I2C)"}, //TODO: This
		0x0032:	{name: "SPMRaddr",	desc: "Store Program Memory Ready"}, //TODO: This
	}
}


const predefinedArray = [
	new Predefined("RAMEND", "adresa na které končí paměť"),

	new Predefined("SPL"),
	new Predefined("SPH"),

	new Predefined("DDRA"),
	new Predefined("DDRB"),
	new Predefined("DDRC"),
	new Predefined("DDRD"),
	new Predefined("PORTA"),
	new Predefined("PORTB"),
	new Predefined("PORTC"),
	new Predefined("PORTD"),

	// Časovače/Čítače
	new Predefined("TCCR0A", "Timer/Counter 0 Control Register A"),
	new Predefined("WGM00", "Wave Generation Mode 0", 0),
	new Predefined("WGM01", "Wave Generation Mode 0", 1),
	new Predefined("COM0B0", "Compare Match Output B Mode 0", 4),
	new Predefined("COM0B1", "Compare Match Output B Mode 1", 5),
	new Predefined("COM0A0", "Compare Match Output A Mode 0", 6),
	new Predefined("COM0A1", "Compare Match Output A Mode 1", 7),

	new Predefined("TCCR0B", "Timer/Counter 0 Control Register B"),
	new Predefined("CS00", "Clock Select 0", 0),
	new Predefined("CS01", "Clock Select 1", 1),
	new Predefined("CS02", "Clock Select 2", 2),
	new Predefined("WGM02", "Wave Generation Mode 2", 3),
	new Predefined("FOC0B", "", 6),
	new Predefined("FOC0A", "", 7),

	new Predefined("TIMSK0"),
	new Predefined("TCNT0"),


	// AD + ADC
	new Predefined("ADMUX"),
	new Predefined("MUX0", "", 0),
	new Predefined("MUX1", "", 1),
	new Predefined("MUX2", "", 2),
	new Predefined("MUX3", "", 3),
	new Predefined("ADLAR", "ADC Left Adjust Result", 5),
	new Predefined("REFS0", "(Voltage) Reference Selection 0", 6),
	new Predefined("REFS1", "(Voltage) Reference Selection 1", 7),

	new Predefined("ADCSRA", "AD Control Status Register A"),
	new Predefined("ADPS0", "ADC Prescaler Select 0", 0),
	new Predefined("ADPS1", "ADC Prescaler Select 1", 1),
	new Predefined("ADPS2", "ADC Prescaler Select 2", 2),
	new Predefined("ADIE", "ADCC Interrupt Enable", 3),
	new Predefined("ADIF", "ADC Interrupt Flag", 4),
	new Predefined("ADATE", "ADC Auto Trigger Enable", 5),
	new Predefined("ADSC", "ADC Start Conversion", 6),
	new Predefined("ADEN", "ADC Enable", 7),

	new Predefined("ADCSRB", "ADC Control Status Register B"),
	new Predefined("ADTS0", "AD Trigger Select", 0),
	new Predefined("ADTS1", "AD Trigger Select", 1),
	new Predefined("ADTS2", "AD Trigger Select", 2),
	new Predefined("ACME", "AC Multiplexer Enable", 6),

	new Predefined("ADCH"),
	new Predefined("ADCL"),


	new Predefined("ACSR", "AC Control Status Register"),
	new Predefined("ACIS0", "AC Interrupt Select 0", 0),
	new Predefined("ACIS1", "AC Interrupt Select 1", 1),
	new Predefined("ACIC", "", 2),
	new Predefined("ACIE", "AC Interrupt Enable", 3),
	new Predefined("ACI", "AC Interrupt", 4),
	new Predefined("ACO", "AC Output", 5),
	new Predefined("ACBG", "", 6),
	new Predefined("ACD", "", 7),

	new Predefined("DIDR1"),
	new Predefined("AIN0D", "", 0),
	new Predefined("AIN1D", "", 1),


	// PWM (Puls Width Modulation)
	new Predefined("OCR0A"),




	// INTERRUPT VECTOR TABLE
	new Predefined("INT0addr",	"External Interrupt Request 0 (pin D2)", 0x0002), //TODO: This
	new Predefined("INT1addr",	"External Interrupt Request 1 (pin D3)", 0x0004), //TODO: This
	new Predefined("PCI0addr",	"Pin Change Interrupt Request 0 (pins D8 to D13)", 0x0006), //TODO: This
	new Predefined("PCI1addr",	"Pin Change Interrupt Request 1 (pins A0 to A5)", 0x0008), //TODO: This
	new Predefined("PCI2addr",	"Pin Change Interrupt Request 2 (pins D0 to D7)", 0x000A), //TODO: This
	new Predefined("WDTaddr",	"Watchdog Timeout Interrupt", 0x000C), //TODO: This
	new Predefined("OC2Aaddr",	"Timer/Counter2 Compare Match A", 0x000E), //TODO: This
	new Predefined("OC2Baddr",	"Timer/Counter2 Compare Match B", 0x0010), //TODO: This
	new Predefined("OVF2addr",	"adresa obsluhy přerušení při přetečení časovače/čítače 2", 0x0012),
	new Predefined("ICP1addr",	"Timer/Counter1 Capture Event", 0x0014), //TODO: This
	new Predefined("OC1Aaddr",	"Timer/Counter1 Compare Match A", 0x0016), //TODO: This
	new Predefined("OC1Baddr",	"Timer/Counter1 Compare Match B", 0x0018), //TODO: This
	new Predefined("OVF1addr",	"adresa obsluhy přerušení při přetečení časovače/čítače 1", 0x001A),
	new Predefined("OC0Aaddr",	"Timer/Counter0 Compare Match A", 0x001C), //TODO: This
	new Predefined("OC0Baddr",	"Timer/Counter0 Compare Match B", 0x001E), //TODO: This
	new Predefined("OVF0addr",	"adresa obsluhy přerušení při přetečení časovače/čítače 0", 0x0020),
	new Predefined("SPIaddr",	"SPI Serial Transfer Complete", 0x0022), //TODO: This
	new Predefined("URXCaddr",	"USART, Rx Complete", 0x0024), //TODO: This
	new Predefined("UDREaddr",	"USART, Data Register Empty", 0x0026), //TODO: This
	new Predefined("UTXCaddr",	"USART, Tx Complete", 0x0028), //TODO: This
	new Predefined("ADCCaddr",	"ADC Conversion Complete", 0x002A), //TODO: This
	new Predefined("ERDYaddr",	"READY EEPROM Ready", 0x002C), //TODO: This
	new Predefined("ACIaddr",	"adresa obsluhy přerušení při změně stavu analogového komparátoru", 0x002E),
	new Predefined("TWIaddr",	"2-wire Serial Interface (I2C)", 0x0030), //TODO: This
	new Predefined("SPMRaddr",	"Store Program Memory Ready", 0x0032), //TODO: This
];
let predefinedMapping = {}; //TODO: Move all mappings to Descriptor.js
for (let predefined of predefinedArray) predefinedMapping[predefined.name.toUpperCase()] = predefined;

let modifiers = [
	new OperatorModifier( // LOW
		/^low\((.+)\)$/i,
		(arr) => arr[0].value & 0b11111111 ?? null
	),
	new OperatorModifier( // HIGH
		/^high\(.+\)$/i,
		(arr) => arr[0].value & 0b11111111_00000000 ?? null
	),
	new OperatorModifier( // "x | y"
		(value) => {
			let x = value.split(/\s*\|\s*/);
			if (x.length == 1)
				return null;
			return x;
		},
		(arr) => {
			let x = 0;
			for (let value of arr) {
				if (typeof value.value != "number")
					return null;
				x |= value.value;
			}
			return x;
		}
	),
	new OperatorModifier( // x << y
		/^(.+?)\s*<<(.+)$/,
		(arr) => {
			if (typeof arr[0].value != "number" || typeof arr[1].value != "number")
					return null;
			return arr[0].value << arr[1].value;
		}
	),
];


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
			return `Provede logickou operaci AND s registrem ${op[0]} a hodnotou '${op[1]}' a výsledek uloží do registru ${op[0]}`;
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
			return `Provede logickou operaci OR s registrem ${op[0]} a hodnotou '${op[1]}' a výsledek uloží do registru ${op[0]}`;
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
	"call": [
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
	"sbrc": [
		(op) => {
			return `Pokud není nastaven ` + (op[1] instanceof Operator_Number ? `${op[1].value}.` : op[1]) + ` bit v registru ${op[0]}, následující instrukce se přeskočí`;
		},
		(op) => {
			return `Další instrukce se přeskočí, pokud je bit ${op[1]} v registru ${op[0]} roven nule`;
		}
	],
	"sbrs": [
		(op) => {
			return `Pokud je nastaven ` + (op[1] instanceof Operator_Number ? `${op[1].value}.` : op[1]) + ` bit v registru ${op[0]}, následující instrukce se přeskočí`;
		},
		(op) => {
			return `Další instrukce se přeskočí, pokud je bit ${op[1]} v registru ${op[0]} roven jedničce`;
		}
	],
	"sbic": [
		(op) => {
			return `Pokud není nastaven ` + (op[1] instanceof Operator_Number ? `${op[1].value}.` : op[1]) + ` bit v registru ${op[0]}, následující instrukce se přeskočí`;
		},
		(op) => {
			return `Další instrukce se přeskočí, pokud je bit ${op[1]} v registru ${op[0]} roven nule`;
		}
	],
	"sbis": [
		(op) => {
			return `Pokud je nastaven ` + (op[1] instanceof Operator_Number ? `${op[1].value}.` : op[1]) + ` bit v registru ${op[0]}, následující instrukce se přeskočí`;
		},
		(op) => {
			return `Další instrukce se přeskočí, pokud je bit ${op[1]} v registru ${op[0]} roven jedničce`;
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
			return "Nastaví se " + (op[1] instanceof Operator_Number ? `${op[1].value}.` : op[1]) + " bit " + (op[0] instanceof Operator_Number ? `na adrese ${op[0]}` : `v registru ${op[0]}`);
		},
		(op) => {
			return `Hodnota bitu ${op[1] instanceof Operator_Number ? op[1].value : op[1]} ` + (op[0] instanceof Operator_Number ? `na adrese ${op[0]}` : `v registru ${op[0]}`) + " se nastaví na 1";
		}
	],
	"cbi": [
		(op) => {
			return "Vymaže se " + (op[1] instanceof Operator_Number ? `${op[1].value}.` : op[1]) + " bit " + (op[0] instanceof Operator_Number ? `na adrese ${op[0]}` : `v registru ${op[0]}`);
		},
		(op) => {
			return `Hodnota bitu ${op[1] instanceof Operator_Number ? op[1].value : op[1]} ` + (op[0] instanceof Operator_Number ? `na adrese ${op[0]}` : `v registru ${op[0]}`) + " se nastaví na 0";
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
	"cli": [
		(op) => {
			return `Vymaže se I (= interrupt enable flag v SREG)`;
		},
		(op) => {
			return `Zakáže se globální přerušení`;
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
			return `Načtení/zápis hodnoty ${(op[1] instanceof Operator_Number ? `z paměti na adrese ${op[1]}` : `z registru ${op[1]}`)} do registru ${op[0]}`;
		},
		(op) => {
			return `${(op[1] instanceof Operator_Number ? `Z paměti na adrese ${op[1]}` : `Z registru ${op[1]}`)} se zapíše hodnota do registru ${op[0]}`;
		}
	],
	"sts": [
		(op) => {
			return `Načtení/zápis hodnoty registru '${op[1]}' do paměti na adrese ${op[0]}`;
		},
		(op) => {
			return `Z registru '${op[1]}' se zapíše hodnota do paměti na adrese ${op[0]}`;
		}
	],
	"in": [
		(op) => {
			return `Načtení hodnoty ze vstupního registru ${op[1]} do registru ${op[0]}`;
		},
		(op) => {
			return `Ze vstupního registru ${op[0]} se zapíše hodnota do registru ${op[1]}`;
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
	Tohle je JS. Pozor na scoping! Nelze napsat '(lineData, parsedCode, lineIndex) => { ... }', jelikož pak nelze přistupovat k vlastnostem IntelligentCompleteru.
	Argument 'commenter' musí mít "vlastní" scope - pokud použijeme arrow funkci, scopem bude global scope (= window).
*/
const intelligentCommenters = [
	new IntelligentCommenter(function(lineData, parsedCode, lineIndex) {
		if (lineData.operators[0].comparableValue == lineData.operators[1].comparableValue) {
			lineData.generatedComment = [
				`Hodnota registru ${lineData.operators[0].register} se nemění, pouze se nastaví Z flag, pokud jsou všechny bit registru na nule`,
				`Pokud je hodnota registru ${lineData.operators[0].register} nula, nastaví se Z flag na jedna (registr zůstává stejný)`
			][this.settings];
			lineData.processed = true;
			return true;
		}
		return false;
	}, ["and", "or"], "Set Z Flag", getRandom(0,1)),
	
	new IntelligentCommenter(function(lineData, parsedCode, lineIndex) {
		let previousLine = getPreviousSureLinedata(parsedCode, lineIndex);
		if (previousLine?.instruction == ".org") {
			if (previousLine.operators[0].value in OTHER_DATA.INTERRUPT_TABLE_ADDRESSES) {
				let addrInfo = OTHER_DATA.INTERRUPT_TABLE_ADDRESSES[previousLine.operators[0].value];
				previousLine.generatedComment = [
					`Jelikož se kód nachází na adrese ${previousLine.operators[0]}, tak...`,
					`Následují skok je na adrese ${previousLine.operators[0]}, tudíž...`
				][this.settings & 1];
				previousLine.processed = true;
				lineData.generatedComment = [
					`...při přerušení, kdy nastane ${addrInfo.desc}, se provede ${lineData.instruction == 'rjmp' ? '(relativní) ' : ''}skok na ${lineData.operators[0] instanceof Operator_Label ? 'návěstí "' + lineData.operators[0].value + '"' : 'adresu' + lineData.operators[0].value}`,
					`...když nastane ${addrInfo.desc}, ${lineData.instruction == 'rjmp' ? 'relativně se skočí' : 'skočí se'} na ${lineData.operators[0] instanceof Operator_Label ? 'návěstí "' + lineData.operators[0].value + '"' : 'adresu' + lineData.operators[0].value}`
				][(this.settings & 2) >> 1];
				lineData.processed = true;
				return true;
			}
		}
		return false;
	}, ["rjmp", "jmp"], "Interupt table jump", getRandom(0,3)),

	/*
	Pozn.:
		Tento komntátor není 100 % přesný...
		A ne - Nelze ho udělat 100 % (alespoň pokud nechci z tohoto projektu udělat statický anylyzátor kódu)
		Proč? Protože tento komentátor hledá dosazovanou hodnotu:
			1. Jez z přechozí řádky (kde se nachází instrukce (tzn. přeskakuje prázdné řádky nebo řádky, kde je jen komentář))
			2. Bere v potaz jen návěstí (tzn. pokud je mezi předchozí instrukcí a touto instrukcí návěstí, tak komentář negeneruje)
		Ani jedno z těchto věcí není důvod, proč se může plést - Oba radši NEvygenerují komentář, než aby vygenerovali špatně
		Problém je, že tu chybí ještě jedna věc - A to, že můžeme skákat i bez návěstí. Př:

			ldi r16, 0b10000111
			nejake_navesti:
				sts ADCSRA, r16
			jmp nejake_navesti
		
		Zde nastane bod 2 - Tedy komentátor zjistí, že se mezi instrukcemi sts a ldi nachází návestí, tudíž je předpoklad toho, že se bude skákat na toto návestí a proto nelze jistě zjistit hodnotu
		Ale instrukce jmp může brát i číslo/adresu, na kterou se má skočit - A komentátor nedokáže poznat, zda se někde v kódu nachází takovýto skok a pokud zde návestí nebude, tak hodnotu u ldi instrukce bude brát jako jistou a vygeneruje (potenciálně) chybný komentář
		(nehledě na to, že by se musela dopočítat skutečná adresa všech instrukcí)
	*/
	new IntelligentCommenter(function(lineData, parsedCode, lineIndex) {
		// Jedná se o přiřatení do registru?
		if (!(lineData.operators[0] instanceof Operator_GeneralRegister || lineData.operators[0] instanceof Operator_Predefined))
			return false;
		
		let register = lineData.operators[0] instanceof Operator_GeneralRegister ? lineData.operators[0].register : lineData.operators[0].name;
		if (!(register in registerMapping))
			return false;

		
		// Dokážeme zjistit, kterou hodnotu dosazujeme? (+ ji případně odvodit)
		let prev;
		let value = 0;
		let originalValue = "";
		if (lineData.operators[1] instanceof Operator_GeneralRegister) {
			prev = getPreviousSureLinedata(parsedCode, lineIndex);
			if (prev.instruction == "ldi" && prev.operators[1] instanceof Operator_Number) {
				value = prev.operators[1].value;
			} else if (prev.operators[1] instanceof Operator_Predefined || prev.operators[1] instanceof Operator_Modified) {
				value = prev.operators[1].value;
				if (value === null)
					return false;
			}
			originalValue = prev.operators[1].originalValue;	
		} else if (lineData.operators[1] instanceof Operator_Number) {
			value = lineData.operators[1].value;
			originalValue = prev.operators[1].originalValue;	
		} else if (lineData.operators[1] instanceof Operator_Predefined || lineData.operators[1] instanceof Operator_Modified) {
			value = lineData.operators[1].value;
			if (value === null)
				return false;
			originalValue = prev.operators[1].originalValue;
		} else {
			return false;
		}


		// Generace komentáře
		let comment = generateCommentForRegisterFullValue(register, value);
		if (comment === null)
			return false;
		

		// Případné odstranění komenátře na předchozí řádce
		if ((this.settings & 2) == 0 && lineData.operators[1] instanceof Operator_GeneralRegister) {
			prev.generatedComment = "";
			prev.processed = true;
		}

		// Dosazení komentářů
		lineData.processed = true;
		if (value === 0)
			lineData.generatedComment = [
				`Registr ${register} se vynuluje, tudíž ${comment}`,
				`${firstLetterToUpperCase(comment)}, protože se všechny bity registru ${register} nastaví na 0`
			][(this.settings & 4) >> 2];
		else
			lineData.generatedComment = [
				`Do registru ${register} se uloží hodnota '${originalValue}', tudíž ${comment}`,
				`${firstLetterToUpperCase(comment)}, protože se hodnota '${originalValue}' zapíše do registru ${register}`
			][this.settings & 1];

		return true;
	}, ["ldi", "sts", "out"], "Register Commenters Full Value", getRandom(0,7)),


	new IntelligentCommenter(function(lineData, parsedCode, lineIndex) {
		if (lineData.operators[0] instanceof Operator_Number)
			return;
		let register = lineData.operators[0] instanceof Operator_GeneralRegister ? lineData.operators[0].register : lineData.operators[0].name;
		let bit = lineData.operators[1].value;
		let value = ["sbi", "sbr"].includes(lineData.instruction);

		let comment = generateCommentForRegisterSingleBit(register, bit, value);
		if (comment === null)
			return null;
	
		lineData.processed = true;
		if (value)
			lineData.generatedComment = [
				`Nastaví se ${bit}. v registru ${register}, tudíž ${comment}`,
				`${firstLetterToUpperCase(comment)}, protože se hodnota bitu ${bit} v registru ${register} nastaví na 1`
			][(this.settings & 2) >> 1];
		else
			lineData.generatedComment = [
				`Vymaže se ${bit}. v registru ${register}, tudíž ${comment}`,
				`${firstLetterToUpperCase(comment)}, protože se hodnota bitu ${bit} v registru ${register} nastaví na 0`
			][this.settings & 1];

		return true;
	}, ["sbi", "sbr", "cbi", "cbr"], "Register Commenters Single Bit", getRandom(0,3)),
];


/*
Full value register komentátor (1.):
(value, register) => ""
value			- Hodnota, která se umístí do registru
register		- Registr, pro který je požadován komentář
				(protože pokud je daný komentáror pro více registrů, tak nelze poznat, o jaký se zrovna jedná)

Single bit register komentátor (2.):
(bit, value, register) => ""
bit				- Číslo bitu, který se mění (indexujeme od 0)
value			- True/False - Určuje, zda se bit nastaví na 1 (= true) nebo na 0 (= false)
register		- Registr, pro který je požadován komentář
				(protože pokud je daný komentáror pro více registrů, tak nelze poznat, o jaký se zrovna jedná)

Oba vrací vygenerovaný komentář jako string, případně null pokud vygenerovat nelze.
Komentář by neměl mít velké písmeno na začátku, pokud se nejedná např. o zkratku:
	Správně:	záporný stav komparátoru bude brán z multiplexoru
	Špatně:		Záporný stav komparátoru bude brán z multiplexoru


new RegisterCommenter(
	function(value, register) {
		return null;
	},
	function(bit, value, register) {
		switch (bit) {
			case 0:
				break;
			case 1:
				break;
			case 2:
				break;
			case 3:
				break;
			case 4:
				break;
			case 5:
				break;
			case 6:
				break;
			case 7:
				break;
		}
		return null;
	},
	[""],
	{
		fullValue: getRandom(0,1),
		singleBit: getRandom(0,1)
	}
),

Nastavení nemusí být object, ale pro oddělení nastavení je to lepší udělat takto...

POZOR! Nelze použít arrow funkce:
	Tohle je JS. Pozor na scoping! Nelze napsat '(lineData, parsedCode, lineIndex) => { ... }', jelikož pak nelze přistupovat k vlastnostem IntelligentCompleteru.
	Argument 'commenter' musí mít "vlastní" scope - pokud použijeme arrow funkci, scopem bude global scope (= window).
*/
const registerCommenters = [
	new RegisterCommenter_SingleBitOnly(
		/*
		ADCSRA - AD Control and Status register A
		Bity:
			0 - ADPS0; ADC Prescaler Select 0
			1 - ADPS1; ADC Prescaler Select 1
			2 - ADPS2; ADC Prescaler Select 2
			3 - ADIE; ADCC Interrupt Enable
			4 - ADIF; ADC Interrupt Flag
			5 - ADATE; ADC Auto Trigger Enable
			6 - ADSC; ADC Start Conversion
			7 - ADEN; ADC Enable
		*/

		function(bit, value, register) {
			switch (bit) {
				case 0:
				case 1:
				case 2:
					return [
						"přizpůsobí předdělič A/D převodníku",
						"předdělič A/D převodníku se příslušně upraví"
					][(this.settings.singleBit & 32) >> 5];
				case 3:
					return (value ? [
						"povolí se přerušení z A/D převodníku",
						"přerušení se povolí"
					] : [
						"zabrání se přerušením z A/D převodníku",
						"přerušení se zakáží"
					])[(this.settings.singleBit & 16) >> 4];
				case 4:
					return (value ? [
						"nastaví se příznak přerušení",
						"příznak přerušení se nastaví"
					] : [
						"zruší se příznak přerušení",
						"příznak přerušení se vynuluje"
					])[(this.settings.singleBit & 8) >> 3];
				case 5:
					return (value ? [
						"povolí se automatické zahájení převodu",
						"automatický převod se povolí"
					] : [
						"zakáže se automatické zahájení převodu",
						"automatický převod se zakáže"
					])[(this.settings.singleBit & 4) >> 2];
				case 6:
					return (value ? [
						"zahájí se převod",
						"A/D převodník začne převod"
					] : [
						"ukončení převodu", // IDK jestli to funguje takhle... Pravděpodobně tohle stejně nikdy nenastane... (single bit dosazení nuly)
						"A/D převodník zruší převod"
					])[(this.settings.singleBit & 2) >> 1];
				case 7:
					return (value ? [
						"A/D převodník se zapne",
						"zapne se A/D převodník"
					] : [
						"A/D převodník se vypne",
						"vypne se A/D převodník"
					])[this.settings.singleBit & 1];
			}
			return null;
		},
		["ADCSRA"],
		{
			//fullValue: getRandom(0,1),
			singleBit: getRandom(0,63)
		}
	),

	new RegisterCommenter(
		/*
		ADCSRB - ADC Control and Status register B
		Bity:
			0 - ADTS0; AD Trigger Select
			1 - ADTS1; AD Trigger Select
			2 - ADTS2; AD Trigger Select
			6 - ACME; AC Multiplexer Enable
		*/
		function(value, register) {

			
			if (value & 0b0100_0000) { // Bit 6
				return [
					"záporný stav komparátoru bude brán z multiplexoru",
					"multiplexor bude brán jako záporný stav komparátoru"
				][this.settings.fullValue];
			} else {
				return [
					"záporný stav komparátoru bude brán z pinu AIN1",
					"pin AIN1 bude brán jako záporný stav komparátoru"
				][this.settings.fullValue];
			}

			//return null;
		},
		function(bit, value, register) {
			switch (bit) {
				case 6:
					return (value ? [
							"záporný stav komparátoru bude brán z multiplexoru",
							"multiplexor bude brán jako záporný stav komparátoru"
						] : [
							"záporný stav komparátoru bude brán z pinu AIN1",
							"pin AIN1 bude brán jako záporný stav komparátoru"
						])[this.settings.singleBit];
			}
			return null;
		},
		["ADCSRB"],
		{
			fullValue: getRandom(0,1),
			singleBit: getRandom(0,1)
		}
	),

	new RegisterCommenter_SingleBitOnly(
		/*
		ACSR - AC Control Status Register
		Bity:
			0 - ACIS0; AC Interrupt Select 0
			1 - ACIS1; AC Interrupt Select 1
			2 - ACIC
			3 - ACIE; AC Interrupt Enable
			4 - ACI; AC Interrupt
			5 - ACO; AC Output
			6 - ACBG
			7 - ACD
		*/
		function(bit, value, register) {
			switch (bit) {
				case 0:
				case 1:
					return [
						"přizpůsobí se výběr přerušení AC",
						"výběr přerušení u AC se příslušně upraví"
					][this.settings.singleBit & 1];
				case 2:
					break;
				case 3:
					return (value ? [
						"přerušení z komparátoru jsou povolena",
						"povolí se přerušení z komparátoru"
					] : [
						"přerušení z komparátoru jsou zakázána",
						"zakáží se přerušení z komparátoru"
					])[(this.settings.singleBit & 2) >> 1];
				case 4:
					return (value ? [
						"nastaví se příznak přerušení",
						"příznak přerušení se nastaví"
					] : [
						"zruší se příznak přerušení",
						"příznak přerušení se vynuluje"
					])[(this.settings.singleBit & 4) >> 2];
				case 6:
					break;
				case 7:
					break;
			}
			return null;
		},
		["ACSR"],
		{
			fullValue: getRandom(0,1),
			singleBit: getRandom(0,7)
		}
	),

	new RegisterCommenter_SingleBitOnly(
		/*
		ADMUX - ADC Multiplexer Selection Register
		Bity:
			0 - MUX0
			1 - MUX1
			2 - MUX2
			3 - MUX3
			5 - ADLAR;  ADC Left Adjust Result
			6 - REFS0; (Voltage) Reference Selection 0
			7 - REFS1; (Voltage) Reference Selection 1
		*/
		function(bit, value, register) {
			switch (bit) {
				case 0:
				case 1:
				case 2:
				case 3:
					break;
				case 5:
					return (value ? [
						`výsledek převodu bude v registrech ADCH a ADCL zarovnán doleva`,
						`v registrech se výsledek zarovná vlevo`
					] : [
						`výsledek převodu bude v registrech ADCH a ADCL zarovnán doprava`,
						`v registrech se výsledek zarovná vpravo`
					])[this.settings.singleBit];
				case 6:
				case 7:
					return [
						"přizpůsobí zdroj referenčního napětí ADC",
						"zdroj referenčního napětí ADC se příslušně upraví"
					][this.settings.singleBit];
			}
			return null;
		},
		["ADMUX"],
		{
			fullValue: getRandom(0,1),
			singleBit: getRandom(0,1)
		}
	),

	new RegisterCommenter(
		function(value, register) {
			/*
			DIDR1 - Digital Input Disable Register 1
			Bity:
				0 - AIN0D
				1 - AIN1D
			*/
			switch (value & 0b11) {
				case 0b00:
					return [
						"zcela se povolí digitální vstup",
						"digitální vstup se povolí"
					][this.settings.fullValue];
				case 0b01:
					return [ //TODO: This
						"",
						""
					][this.settings.fullValue];
				case 0b10:
					return [ //TODO: This
						"",
						""
					][this.settings.fullValue];
				case 0b11:
					return [
						"zcela se zakáže digitální vstup",
						"digitální vstup se zakáže"
					][this.settings.fullValue];
			}
		},
		function(bit, value, register) {
			switch (bit) {
				case 0:
				case 1:
				case 2:
				case 3:
					return [
						"přizpůsobí zapnutí/vypnutí digitálního vstupu",
						"zapnutí/vypnutí digitálního vstupu se příslušně upraví"
					][this.settings.singleBit];
			}
			return null;
		},
		["DIDR1"],
		{
			fullValue: getRandom(0,1),
			singleBit: getRandom(0,1)
		}
	),

	new RegisterCommenter(
		function(value, register) {
			let bits = getBitList(value);
			let port = "PORT" + register.substr(-1);

			if (bits.on.length == 1 || bits.off.length == 1) {
				return (bits.on.length == 1 ? [
					`port ${port} bude mít ${bits.on[0]}. bit nastaven jako výstupní`,
					`bit ${bits.on[0]} bude na portu ${port} výstupní`
				] : [
					`port ${port} bude mít ${bits.off[0]}. bit nastaven jako vstupní`,
					`bit ${bits.off[0]} bude na portu ${port} vstupní`
				])[this.settings.fullValue & 1];
			}

			if (value === 0) {
				return [
					`port ${port} bude mít všechny bity jako vstupní`,
					`všechny bity portu ${port} budou vstupní`
				][(this.settings.fullValue & 2) >> 1];
			} else if (value === 0xFF) {
				return [
					`port ${port} bude mít všechny bity jako výstupní`,
					`všechny bity portu ${port} budou výstupní`
				][(this.settings.fullValue & 4) >> 2];
			} else {
				return [
					`port ${port} bude mít ${humanJoin(bits.on, "., ", ". a ")}. bit nastaven jako výstupní a ${humanJoin(bits.off, "., ", ". a ")} bit jako vstupní`,
					`bity ${humanJoin(bits.on)} portu ${port} budou výstupní a bity ${humanJoin(bits.off)} jako vstupní`
				][(this.settings.fullValue & 8) >> 3];
			}
		},
		function(bit, value, register) {
			let port = "PORT" + register.substr(-1);
			return (value ? [
				`port ${port} bude mít ${bit}. bit nastaven jako výstupní`,
				`bit ${bit} bude na portu ${port} výstupní`
			] : [
				`port ${port} bude mít ${bit}. bit nastaven jako vstupní`,
				`bit ${bit} bude na portu ${port} vstupní`
			])[this.settings.fullValue & 1];
		},
		["DDRA", "DDRB", "DDRC", "DDRD"],
		{
			fullValue: getRandom(0,15),
			singleBit: getRandom(0,1)
		}
	),

	new RegisterCommenter_SingleBitOnly(
		/*
		TCCR0A - Timer/Counter 0 Control Register A
		Bity:
			0 - WGM00; Wave Generation Mode 0
			1 - WGM01; Wave Generation Mode 0
			4 - COM0B0; Compare Match Output B Mode 0
			5 - COM0B1; Compare Match Output B Mode 1
			6 - COM0A0; Compare Match Output A Mode 0
			7 - COM0A1; Compare Match Output A Mode 1
		*/
		function(bit, value, register) {
			switch (bit) {
				case 0:
				case 1:
					return [
						"změní se operační mód PWM",
						"mód PWM se příslušně upraví"
					][this.settings.singleBit & 1];
				case 4:
				case 5:
					// return [
					// 	"",
					// 	""
					// ][this.settings.singleBit & 1];
					break;
				case 6:
				case 7:
					// return [
					// 	"",
					// 	""
					// ][this.settings.singleBit & 1];
					break;
			}
			return null;
		},
		["TCCR0A"],
		{
			fullValue: getRandom(0,1),
			singleBit: getRandom(0,1)
		}
	),

	new RegisterCommenter_SingleBitOnly(
		/*
		TCCR0B - Timer/Counter 0 Control Register B
		Bity:
			0 - CS00; Clock Select 0
			1 - CS01; Clock Select 1
			2 - CS02; Clock Select 2
			3 - WGM02; Wave Generation Mode 2
			6 - FOC0B
			7 - FOC0A
		*/
		function(bit, value, register) {
			switch (bit) {
				case 0:
				case 1:
				case 2:
					return [
						"přizpůsobí se rychlost/zdroj časovače/čítače",
						"rychlost (nebo zdroj) časovače/čítače se příslušně upraví"
					][this.settings.singleBit & 1];
				case 3:
					return "";
				case 6:
				case 7:
					return "";
			}
			return null;
		},
		["TCCR0B"],
		{
			fullValue: getRandom(0,1),
			singleBit: getRandom(0,1)
		}
	),
]

//TODO: Move all mappings to Descriptor.js
let registerMapping = {};
for (let registerCommenter of registerCommenters) {
	for (let register of registerCommenter.registers) {
		if (register in registerMapping)
			registerMapping[register].push(registerCommenter);
		else
			registerMapping[register] = [registerCommenter];
	}
}