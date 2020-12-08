# AVR AMS Descriptor/Komentátor

## Co tohle je?
Tento repozitář je takový "menší" projekt (který jsem jako vždy brutálně přehnal).
Primárně slouží k "automazizaci" plnění domácích úkolů, kdy bylo cílem okomentovat assemblerový program pro ATMega328 (ale mělo by fungovat pro jakýkoli AVR procesor). Takže pokud máš za úkol něco podobného (či dokonce stejného) či si potřebuješ okomentovat to co si napsal, tak můžeš použít tento projekt.<br>
Celý projekt je navíc psán s myšlenkou/cílem, aby to byl "jen" JS (`Descriptor.js`) - To znamená, že pokud se ti nelíbí současné UI/design nebo chceš zakomponovat tuhle věcičku do své aplikace, nemělo by to být (až tak) těžký - a pokud se tomu tak stane, tak budu rád :). 

## Jak tohle zprovozním?
Projekt je webová aplikace, taže jen naklonuj/stáhni repo a otenři `index.html`.

## Co vše to umí?
Jak jsem psal, tak jsem klasicky tento projekt přehnal - Původně to byl pouze a jenom jeden JS snippet, který běžel v "sandboxu" ve Chromu. Pak ale se to trochu rozrostlo a po několika přepisech se z toho stalo toto - a to nejhlavnější je to, že to má UI. Takže ... Co to umí?
- CTRL + Enter      - Automatické zahájení okomentování
- CTRL + Mezerník   - Zkopírování výsledku do schránky¨
- CTRL + V          - Jasně... Klasická featura... Ale při pokusu o vložení data přes "CTRL + V" nemusíte být ve fokusu na input
- CTRL + S          - Uložení výsledku
- Drag and Drop     - Lze přetáhnout `.asm` soubor (actually jakkýkoli soubor) na stránku a soubor se automaticky zpracuje

## Jak to funguje?
Zajímá tě, jak to funguje? Nebo si zjistil, že jsem línej a neudělal implementaci pro instrukci, kterou potřebuješ okomentovat? A nebo nemáš co dělat (i když víš, že máš) a chceš si jen něco pročíst? Ať je důvod jakkýkoli, tak se klidně začti, proto to tu je...<br>
Ve většině případů bude ale potřeba jen pozměnit data konstanty `insctrucionData`, kde je dictionary/objekt, který má jako property string, který je název instrukce a hodnotu arraye, kde jsou možné funkce pro generaci komentáře pro danou instrukci.<br>
Přeskočíme interacki s uživatelem... Jak jsem zmiňoval na začátku, tohle je především o JS. A vezmemem to od začátku - Máme asm kód. Ten passujeme do fukce `addComments()` a zobrzíme výsledek. To je vše.<br>
Ano, dělám si srandu - Jdeme trochu víc do hloubky. Ještě ale než se teda pustíme dál, tak bych zmíňil, že se kód bude i formátovat za pomoci classy `Formater`, jejíž instance se passuje do funkce `addComments()`. A tato classa se stará o nějaké to zpravocání vstupu a výstupu (na základě konfigurace (= vlastnosti/properties instance; popis toho, co co dělá je vždy napsán u property deklarace)). A teď k funkci `addComments()` - když tedy tato funkce dostane kód, tak ho nejdřív předá `Formater` instanci, aby ho případně předupravila (současně se ale nic neděje). Následně si kód rozdělí po řádcích a loopuje skrz tyto řádky. V každém cyklu si daný řádek dále rozdělí pomocí šílené magie zvané RegEx, která je zabalená ve ("konstantní") funkci `splitLine` - to tu ale rozhodně popivat nehodlám; schválně se podívejte na první řádek (kódu) této funkce. Řádka se tímto rozdělí na odsazení, mezery, label, instrukci, operátory a komentář. Takto rozdělá řádka se pak opět předá Formateru a passuje se do funkce `generateComment()`, která vrátí vygenerováný komentář (k tomu se ještě vrátím). Tento komentář se spolu s originální (případně formátovanou) řádkou uloží do arraye jako tuple (v JS je to tedy array s velikostí 2). A jakmile se projdou všechny řádky, tak se array těchto tuplů předá opět Formateru. Ten to vše spojí zase do jednoho textu/kódu. Následně se Formateru předá ještě i tento spojený text (prostě mi přišlo vhodné udělat takhle víc metod - třeba se to někdy využije) a to je vše - současný výsledek se vrací z `addComments()`.<br>
Ještě tady rozeberu generaci komentářů o kterou se stará již zmiňovaná fuknce `generateComment()`. Ta bere rozdělenou řádku, ze které si vezme instrukci a operátory (které ještě následně rozdělí). Nyní se musí vybrat funkce, která vygeneruje daní komentář - Ta se volí přes `getCommenter()`. Vzhledem k tomu, že byl přepoklad toho, že bude užívat tuto aplikaci více lidí pro jeden úkol, tak byl vytvořen systém, aby se zamezilo identickým řešením (který zatím ale není vyžit, protože stejně má každá instrukce zatím jen jednu funkci (viz dále)). Při spouštění/načítání JS se vybere nádhodný index arraye pro každou instrukci (pro pochopení viz druhý odstavec v této sekci) => náhodně byla pro každou instrukci vybrána funkce, která bude generovat komentář. A samotná funkce `getCommenter()` nedělá nic jiného, než že vezme instrukci a index, který byl vybrán pro tuto instrukci a vrátí `instructionData[INSTRUKCE][INDEX]`. Nyní krok výš - funkce `generateComment()` vezme vrácenou funkci na generaci komentáře a předájí instrukci, operátory (které předtím vytáhla z rozdělené řádky) a i celou rozdělenou řádku (kdyby náhodou byla potřeba tuto řádku zanalyzovat nějak speciálně). A nyní se pouze vrací výsledek této funkce.

## Credits
Přestože jsem celý codebase psal sám, tak bych rád něco uvedl:
- [Martin Petrovaj](https://github.com/mnpj22) - Udělání (prvotního) designu a HTML
- [Eli Grey](https://github.com/eligrey) - [FileSaver.js](https://github.com/eligrey/FileSaver.js/) - Protože se mi nechtělo studovat další webové API :)