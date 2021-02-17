# AVR ASM Descriptor/Komentátor

## Co tohle je?
Tento repozitář je takový "menší" projekt (který jsem jako vždy brutálně přehnal).
Primárně slouží k "automazizaci" plnění domácích úkolů, kdy bylo cílem okomentovat assemblerový program pro ATMega328 (ale mělo by fungovat pro jakýkoli AVR procesor). Takže pokud máš za úkol něco podobného (či dokonce stejného) či si potřebuješ okomentovat to co si napsal, tak můžeš použít tento projekt.<br>
Celý projekt je navíc psán s myšlenkou/cílem, aby to byl "jen" JS (`Descriptor.js`) - To znamená, že pokud se ti nelíbí současné UI/design nebo chceš zakomponovat tuhle věcičku do své aplikace, nemělo by to být (až tak) těžký - a pokud se tomu tak stane, tak budu rád :). 

## Jak tohle zprovozním?
~~Projekt je webová aplikace, taže jen naklonuj/stáhni repo a otevři `index.html`.~~

Toto repo má zprovozněné Github pages! Pog To znamená, že nejnovější verze je vždy dostupná online na adrese https://hackrrr.github.io/AVR-ASM-Descriptor/.

(A nebo si to může stáhnot lokálně a třeba si něco pozměnit... :) )

## Co vše to umí?
Jak jsem psal, tak jsem klasicky tento projekt přehnal - Původně to byl pouze a jenom jeden JS snippet, který běžel v "sandboxu" ve Chromu. Pak ale se to trochu rozrostlo a po několika přepisech se z toho stalo toto - a to nejhlavnější je to, že to má UI. Takže ... Co to umí?
- CTRL + Enter      - Automatické zahájení okomentování
- CTRL + Mezerník   - Zkopírování výsledku do schránky
- CTRL + V          - Jasně... Klasická featura... Ale při pokusu o vložení data přes "CTRL + V" nemusíte být ve fokusu na input
- CTRL + S          - Uložení výsledku
- Drag and Drop     - Lze přetáhnout `.asm` soubor (actually jakkýkoli soubor) na stránku a soubor se automaticky zpracuje

## Jak to funguje? A jak to můžu upravit?
Zajímá tě, jak to funguje? Nebo si zjistil, že jsem línej a neudělal implementaci pro instrukci, kterou potřebuješ okomentovat? A nebo nemáš co dělat (i když víš, že máš) a chceš si jen něco pročíst? Ať je důvod jakkýkoli, tak se klidně začti, proto to tu je...

### Data.js + Normální komentátor
Ve většině případů bude ale potřeba jen pozměnit data v souboru `JS/Data.js`. V tomto souboru je několik věcí, ale hlavně to je objekt (resp. "dictionary") `instructionData` a array `intelligentCommenters`. Zajímat tě bude především konstanta `instructionData` - ta obsahuje "normální" komentátory (komentátor = to co generuje komentář):
```js
const instructionData = {
    ...

    "NĚJAKÁ_INSTRUKCE": [
        (operators) => { // <= Komentátor (= funkce)
            return `Komentář pro instrukci "NĚJAKÁ_INSTRUKCE" a první operátor na tomto řádku má hodnotu ${operators[0]}`; // <= Komentář (= to co komentátor vygeneruje)
        },
        (operatory) => {
            return `Alternativní varianta komentáře pro instrukci "NĚJAKÁ_INSTRUKCE"`;
        }
    ],
    
    ...
}
```
Doufám, že tento úsek kódu dostatečně vysvětluje, jak pozměnit "generaci komentářů" (resp. jak změnit generované komentáře) či si přidat podporu vlastních instrukcí.

### Inteligentní komentátor
Inteligentní komentátory jsou takovej menší overkill ("inteligentní" proto, protože mají možnost reagovat na okolní kód). Byl jsem trochu smutný už jen z psaný base classy pro inteleligentní komentátory, protože jsem si zase jendou hrál s JS jako s prototype-based jazykem (a taky jsem byl trošilinku smutný ze scopingu, dědičnosti a tak vůbec ze všeho). Proč jsem tohle dělal? Protože jsem to klasicky přehnal a chtěl jsem, aby se instance classy dala volat (=> derivace od `Function` classy), abych automaticky ověřoval instrukce (resp. aby komentátor "selhal" pokud se pokuší komentovat instrukci, kterou komentovat neumí) "uvnitř" classy/instance (=> nutnost enkapsulace samotné funkce na generaci komentářů) a aby funkce, která se stará o tu samotnou generaci komntáře, měla "this" nabindovaný na instanci této classy. No... Nějak to dopadlo a nechtějte po mě, abych to někdy dělal znova, protože tak naročný debugging jsem snad ještě nedělal :).

Takže jak udělat vlastní "inteligentní" komentátor? Jak ti možná už došlo, tak inteligentní komentátor vznikne přes "new" keyword a je jím "instance" classy (actually to není "pravá" instance classy, ale funkce, která se tváří jako instance classy, ale to je v JS (skoro) jedno a to samé). A pokud se tato instance nachází v `intelligentCommenters` arrayi, tak se pro každou řádku vyzkouší tento komentátor. Tvorba takovéhoto komentátoru může vypadat následovně:
```js
// new IntelligentCommenter(funkce, arrayInstrukcí, název, nastavení);
new IntelligentCommenter(
    function(lineData, parsedCode, lineIndex) {
        if (lineData.operators[0].comparableValue == lineData.operators[1].comparableValue) {
            lineData.generatedComment = [
                `Hodnota registru ${lineData.operators[0].register} se nemění, pouze se nastaví Z flag, pokud jsou všechny bit registru na nule`,
                `Pokud je hodnota registru ${lineData.operators[0].register} nula, nastaví se Z flag na jedna (registr zůstává stejný)`
            ][this.settings];
            lineData.processed = true;
        }
        return false;
    },
    ["and", "or"],
    "Set Z Flag",
    getRandom(0,1)
)
```
První parametr je funkce, která generuje komentáře. Bere 3 argumenty - lineData (pro současnou řádku), parsovaný kód a index současné řádky. Vrací true/false (ale je to JS, takže může vrátit cokoli, co se příslušně převede na true/false) - tzn. že **musí** sama dosadit kometnář do `lineData.generatedComment` a nastavit `lineData.processed`! Také pozor na to, že pokud se bude použíat `this`, tak musí mít vlastní scope (tedy to nesmí být arrow funkce). Dalším parametrem je array instrukcí, pro které by tento komentátor měl umět generovat funkce - pro jiné instukce, než jsou v arrayi, se funkce nespustí. Může být také prázdná - v tom případě se funkce spustí na každé řádce (i když zde nebude žádná instrukce). Třetí argument je jméno - to se nesmí shodovat s jiným inteligentní komentátorem, jinak se může špatně "načíst". Jak je možné, že kvůli jménu se špatně "načte" instance? Protože je zde i čtvrý argument a tím je (většinou náhodné) nastavení komentátoru, aby bylo opět možné mít více variací komentářů. Může to být cokoliv - číslo, true/false, string, jiný objekt - ale číslo je asi nejvhodnější. A podle právě podle jména se nastavují komentátory z uložené konfigurace.

### Jak to reálně funguje...
Jdeme trochu víc do hloubky. Vše se pustí voláním funkce `commentCode()`, která bere 3 argumenty - `code`, což je daný ASM kód ve stringu, dále `formatter` a `commentRules`. Poslední 2 argumenty jsou instance stejnojmenných class `Formatter` (specifikuje formátování/stylistiku finálního kódu) a `CommentRules` (upřesňuje generaci komentářů). Teď samotný průběh funkce `commentCode()` - nejdříve parsuje celý kód řádka po řádce a vznikne nám z toho array instancí classy `LineData`, kde je uložena rozdělená řádka (pomocí šíleného regexu, který netuším, jak jsem udělal) (na instrukci, návěstí, odsazení, operátory (které jsou ještě následné parsovány na "druhy" operátorů), ...), nějaké "zkratky" ( = properties) k parsovaným datům a nějaké metadata/mezivýsledky (př. vygenerovaný komentář). Nasledně se všechny tyto parsováné řádky proženou instancí classy `Formatter`, která každou řádku zformátuje. Pak se už začnou generovat komentáře - Kód se iteruje 2x - jednou pro inteligentní komentáře, podruhé pro "normální". (Pro řádky, pro které byl vygenerovaný inteligentní komentář, se normální komentář negeneruje.) No a nyní zbývá už je celý kód zase poskládat - to se opět nechává na `Formatter` instanci. V "1. iteraci" (`Formatter.buildLine()`) se všechny řádky pospojují (bez vygenerovaného komentáře) a v "2. iteraci" (`Formatter.buildCode()`) se spojí s vygenerovaným komentářem a i mezi sebou a finální výsledek se vrátí z funkce `commentCode()`.


Ještě možná něco k samotné generaci komentářů -  Vzhledem k tomu, že byl přepoklad toho, že bude užívat tuto aplikaci více lidí pro jeden kód/úkol, tak byl vytvořen systém, aby se zamezilo identickým řešením, tak se udělala podpora alternativních komentářů, proto každá instukce může (a má) více variant. Na druhou stranu by bylo divné kdyby se jednou pro instrukci vygeneroval jeden komentář a podruhé jiný (teď bez ohledu na operátory), a proto je v instanci `CommentRules` vlastnost `selected`, což je objekt/dictionary, který specifikuje pro každou instrukci index komentátoru, který se má použít (jestli to, co jsem napsal není pochopitelné, tak jinak - "prostě se zaručí, že pro každou instrukci bude použit vždy stejný komentář/komentátor").

## Credits
Přestože jsem celý codebase psal sám, tak bych rád něco uvedl:
- [mnpj22](https://github.com/mnpj22) - Udělání (prvotního) designu a HTML
- [Eli Grey](https://github.com/eligrey) - [FileSaver.js](https://github.com/eligrey/FileSaver.js/) - Protože se mi nechtělo studovat další webové API :)