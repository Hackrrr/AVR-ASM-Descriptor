# AVR AMS Descriptor/Komentátor

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

## Jak to funguje?
Zajímá tě, jak to funguje? Nebo si zjistil, že jsem línej a neudělal implementaci pro instrukci, kterou potřebuješ okomentovat? A nebo nemáš co dělat (i když víš, že máš) a chceš si jen něco pročíst? Ať je důvod jakkýkoli, tak se klidně začti, proto to tu je...

### Obecné shrnutí 
Ve většině případů bude ale potřeba jen pozměnit data v souboru `JS/InstructionData.js`. V tomto souboru jsou 2 konstanty - objekt (nebo dictionary chcete-li) `instructionData` a array `intelligentCommenters`. Zajímat tě bude hlavně konstanta `instructionData`, jejíž struktura vypadá nějak takto:
```js
const instructionData = {
    ...

    "NĚJAKÁ_INSTRUKCE": [
        (operators) => { // <= Komentátor (= funkce)
            return `Komentář pro instrukci "NĚJAKÁ_INSTRUKCE" a operátor na tomto řádku má hodnotu ${operators[0]}`; // <= Komentář (= to co komentátor vygeneruje)
        },
        (operatory) => {
            return `Alternativní varianta komentáře pro instrukci "NĚJAKÁ_INSTRUKCE"`;
        }
    ],
    
    ...
}
```
Doufám, že tento úsek kódu dostatečně vysvětluje, jak pozměnit "generaci komentářů" (resp. jak změnit generované komentáře) či si přidat podporu vlastních instrukcí.

Pokud chceš modifikovat inteligentní komentáře, tak máš **zatím** smůlu :) Počkej tak 3 dny a budeš moc i to...

### Jak to reálně funguje...
Jdeme trochu víc do hloubky. Vše se pustí voláním funkce `commentCode()`, která bere 3 argumenty - `code`, což je daný ASM kód ve stringu, dále `formatter` a `commentRules`. Poslední 2 argumenty jsou instance stejnojmenných class `Formatter` (specifikuje formátování/stylistiku finálního kódu) a `CommentRules` (upřesňuje generaci komentářů). Teď samotný průběh funkce `commentCode()` - nejdříve parsuje celý kód řádka po řádce a vznikne nám z toho array instancí classy `LineData`, kde je uložena rozdělená řádka (pomocí šíleného regexu, který netuším, jak jsem udělal) (na instrukci, návěstí, odsazení, operátory, ...), nějaké "zkratky" k parsovaným datům a nějaké metadata/mezi výslekdy (př. vygenerovaný komentář). Nasledně se všechny tyto parsováné řádky proženou instancí classy `Formatter`, která každou řádku zformátuje. Pak se už začnou generovat komentáře - Kód se iteruje 2x - jednou pro inteligentní komentáře, podruhé pro "normální". (Pro řádky, pro které byl vygenerovaný inteligentní komentář, se normální komentář negeneruje.) No a nyní zbývá už je celý kód zase poskládat - to se opět nechává na `Formatter` instanci. V "1. iteraci" (`Formatter.buildLine()`) se všechny řádky pospojují (bez vygenerovaného komentáře) a v "2. iteraci" (`Formatter.buildCode()`) se spojí s vygenerovaným komentářem a i mezi sebou a finální výsledek se vrátí z funkce `commentCode()`.


Ještě možná něco k samotné generaci komentářů -  Vzhledem k tomu, že byl přepoklad toho, že bude užívat tuto aplikaci více lidí pro jeden kód/úkol, tak byl vytvořen systém, aby se zamezilo identickým řešením, tak se udělala podpora alternativních komentářů, proto každá instukce může (a má) více variant. Na druhou stranu by bylo divné kdyby se jednou pro instrukci vygeneroval jeden komentář a podruhé jiný (teď bez ohledu na operátory), a proto je v instanci `CommentRules` vlastnost `selected`, což je objekt/dictionary, který specifikuje pro každou instrukci index komentátoru, který se má použít (jestli to, co jsem napsal není pochopitelné, tak jinak - "prostě se zaručí, že pro každou instrukci bude použit vždy stejný komentář/komentátor").

## Credits
Přestože jsem celý codebase psal sám, tak bych rád něco uvedl:
- [mnpj22](https://github.com/mnpj22) - Udělání (prvotního) designu a HTML
- [Eli Grey](https://github.com/eligrey) - [FileSaver.js](https://github.com/eligrey/FileSaver.js/) - Protože se mi nechtělo studovat další webové API :)