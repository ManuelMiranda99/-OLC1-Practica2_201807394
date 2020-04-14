import { Token } from './Token'
import { saveAs } from './FileSaver.js'

export class LexicalAnalyzer{

    tokenList: Array<Token>;
    row: number;
    col: number;
    colF: number;
    state: number;
    txtAux: string;

    constructor(){
        this.row = this.col = this.colF = 1;
    }

    scanText(_text:string): Array<Token> {
                
        //console.log("Entro a escanear");

        this.tokenList = new Array<Token>();

        _text += "#";

        this.state = 0;
        this.row = this.col = this.colF = 1;
        this.txtAux = "";

        let char;

        for(let i=0; i  < _text.length; i++){

            char = _text[i];            

            switch(this.state){
                case 0:
                    /* ----------- ID ----------- */
                    if(this.IsLetter(char)){
                        this.state = 4;
                        this.txtAux += char;
                        this.colF = this.col;
                        this.col++;
                    }
                    /* ----------- DI ----------- */
                    else if(this.IsDigit(char)){
                        this.state = 1;
                        this.txtAux += char;
                        this.colF = this.col;
                        this.col++;
                    }
                    /* ----------- ST ----------- */
                        /* For the HTML */
                    else if(char === "'"){
                        this.state = 12;
                        this.txtAux += char;
                        this.colF = this.col;
                        this.col++;                        
                    }
                        /* Normal Strings */
                    else if(char === '"'){
                        this.state = 10;
                        this.txtAux += char;
                        this.colF = this.col;
                        this.col++;
                    }
                    /* Comment */
                    else if(char === "/"){
                        this.state = 5;
                        this.txtAux += char;
                        this.colF = this.col;
                        this.col++;
                    }
                    /* Symbols */
                    else if(char === "="){
                        this.state = 14;
                        this.txtAux += char;
                        this.colF = this.col;
                        this.col++;
                    }
                    else if(char === "+"){
                        this.state = 16;
                        this.txtAux += char;
                        this.colF = this.col;
                        this.col++;
                    }
                    else if(char === "-"){
                        this.state = 18;
                        this.txtAux += char;
                        this.colF = this.col;
                        this.col++;
                    }
                    else if(char === ">"){
                        this.state = 20;
                        this.txtAux += char;
                        this.colF = this.col;
                        this.col++;
                    }
                    else if(char === "<"){
                        this.state = 22;
                        this.txtAux += char;
                        this.colF = this.col;
                        this.col++;
                    }
                    else if(char === "!"){
                        this.state = 24;
                        this.txtAux += char;
                        this.colF = this.col;
                        this.col++;
                    }
                    else if(char === "{"){
                        this.txtAux += char;
                        this.colF = this.col;
                        this.addToken("S_OPEN_KEY");
                        this.col++;
                    }
                    else if(char === "}"){
                        this.txtAux += char;
                        this.colF = this.col;
                        this.addToken("S_CLOSE_KEY");
                        this.col++;
                    }
                    else if(char === "("){
                        this.txtAux += char;
                        this.colF = this.col;
                        this.addToken("S_OPEN_PARENTHESIS");
                        this.col++;
                    }
                    else if(char === ")"){
                        this.txtAux += char;
                        this.colF = this.col;
                        this.addToken("S_CLOSE_PARENTHESIS");
                        this.col++;
                    }
                    else if(char === ","){
                        this.txtAux += char;
                        this.colF = this.col;
                        this.addToken("S_COMMA");
                        this.col++;
                    }
                    else if(char === ";"){
                        this.txtAux += char;
                        this.colF = this.col;
                        this.addToken("S_SEMICOLON");
                        this.col++;
                    }
                    else if(char === "."){
                        this.txtAux += char;
                        this.colF = this.col;
                        this.addToken("S_POINT");
                        this.col++;
                    }
                    else if(char === "*"){
                        this.txtAux += char;
                        this.colF = this.col;
                        this.addToken("S_PRODUCT");
                        this.col++;
                    }
                    else if(char === ":"){
                        this.txtAux += char;
                        this.colF = this.col;
                        this.addToken("S_TWO_POINTS");
                        this.col++;
                    }
                    else if(char === "|"){
                        this.txtAux += char;
                        this.colF = this.col;
                        this.col++;
                        this.state = 25;
                    }
                    else if(char === "&"){
                        this.txtAux += char;
                        this.colF = this.col;
                        this.col++;
                        this.state = 26;
                    }
                    else if(char === "\n"){ this.row++; this.col = 1; }
                    else if(char === " " || char === "\t" || char === "\r") {  }
                    else{
                        if(char === "#"){
                            //console.log("Analisis finalizado con exito");
                        }
                        else{
                            this.txtAux += char;
                            this.colF = this.col;
                            this.addToken("UNKNOWN");
                            this.col++;
                        }
                    }
                    break;
                /* ---------- NUMBERS ---------- */
                case 1:
                    if(this.IsDigit(char)){
                        this.txtAux += char;
                        this.col++;
                    }
                    else if(char === "."){
                        this.state = 2;
                        this.txtAux+= char;
                        this.col++;
                    }
                    else{
                        this.addToken("INTEGER");
                        i--;
                    }
                    break;
                case 2:
                    if(this.IsDigit(char)){
                        this.state = 3;
                        this.txtAux += char;
                        this.col++;
                    }
                    else{
                        this.addToken("UNKNOWN");
                        i--;
                    }
                    break;
                case 3:
                    if(this.IsDigit(char)){
                        this.txtAux += char;
                        this.col++;
                    }
                    else{
                        this.addToken("DECIMAL");
                        i--;
                    }
                    break;
                /* ---------- ID ---------- */
                case 4:
                    if(this.IsLetter(char) || this.IsDigit(char) || char === "_"){
                        this.txtAux += char;
                        this.col++;
                    }
                    else{
                        this.addToken("ID");
                        i--;
                    }
                    break;
                /* ---------- COMMENT AND DIVISION ---------- */
                case 5:
                    if(char === "/"){
                        this.state = 6;
                        this.txtAux += char;
                        this.col++;
                    }
                    else if(char === "*"){
                        this.state = 7;
                        this.txtAux += char;
                        this.col++;
                    }
                    else{
                        this.addToken("S_DIVISION");
                        i--;
                    }
                    break;
                case 6:
                    if(char === "\n"){
                        this.row++;
                        this.col = 1;
                        this.addToken("ONE_LINE_COMMENT");
                    }
                    else{
                        this.txtAux += char;
                        this.col++;
                    }
                    break;
                case 7:
                    if(char === "*"){
                        this.txtAux += char;
                        this.state = 8;
                        this.col++;
                    }
                    else if(char === "\n"){
                        this.txtAux += char;
                        this.row++;
                        this.col = 1;
                    }
                    else{
                        this.txtAux += char;
                        this.col++;
                    }
                    break;
                case 8:
                    if(char === "/"){
                        this.txtAux += char;
                        this.col++;
                        this.addToken("MULTILINE_COMMENT");
                    }
                    else if(char === "*"){
                        this.txtAux += char;
                        this.col++;
                    }
                    else{
                        this.txtAux += char;
                        this.col++;
                        this.state = 7;
                    }
                    break;
                /* STRING */
                case 10:
                    if(char === '"'){
                        this.txtAux += char;
                        this.col++;
                        this.addToken("NORMAL_STRING");
                    }
                    else{
                        this.col++;
                        if(char == "\n"){
                            this.row++;
                            this.col = 1;
                        }
                        this.txtAux += char;                        
                    }
                    break;
                case 12:
                    if(char === "'"){
                        this.txtAux += char;
                        this.col++;
                        this.addToken("HTML_STRING");                        
                    }
                    else{
                        this.col++;
                        if(char === "\n"){
                            this.row++;
                            this.col = 1;
                        }
                        this.txtAux += char;
                    }
                    break;
                case 14:
                    if(char === "="){
                        this.txtAux += char;
                        this.col++;
                        this.addToken("S_EQUALS_EQUALS");
                    }
                    else{
                        this.addToken("S_EQUALS");
                        i--;
                    }
                    break;
                case 16:
                    if(char === "+"){
                        this.txtAux += char;
                        this.col++;
                        this.addToken("S_INCREMENT");
                    }
                    else{
                        this.addToken("S_PLUS");
                        i--;
                    }
                    break;
                case 18:
                    if(char === "-"){
                        this.txtAux += char;
                        this.col++;
                        this.addToken("S_DECREMENT");
                    }
                    else{
                        this.addToken("S_MINUS");
                        i--;
                    }
                    break;
                case 20:
                    if(char === "="){
                        this.txtAux += char;
                        this.col++;
                        this.addToken("S_MAJOR_EQUALS");                        
                    }
                    else{
                        this.addToken("S_MAJOR");
                        i--;
                    }
                    break;
                case 22:
                    if(char === "="){
                        this.txtAux += char;
                        this.col++;
                        this.addToken("S_LESS_EQUALS");
                    }
                    else{
                        this.addToken("S_LESS");
                        i--;
                    }
                    break;
                case 24:
                    if(char === "="){
                        this.txtAux += char;
                        this.col++;
                        this.addToken("S_DIFFERENT");
                    }
                    else{
                        this.addToken("S_NOT");
                        i--;
                    }
                    break;
                case 25:
                    if(char === "|"){
                        this.txtAux += char;
                        this.col++;
                        this.addToken("S_OR");
                    }
                    else{
                        this.addToken("UNKNOWN");
                        i--;
                    }
                    break;
                case 26:
                    if(char === "&"){
                        this.txtAux += char;
                        this.col++;
                        this.addToken("S_AND");
                    }
                    else{
                        this.addToken("UNKNOWN");
                        i--;
                    }
                    break;
                default:
                    console.log("Pero que leches");
                    break;
            }
        }

        return this.tokenList;
    }

    addToken(_tokenType: string){
        //console.log("Agregando " + _tokenType);
        this.tokenList.push(new Token(_tokenType, this.txtAux, this.row.toString(), this.col.toString()));
        this.txtAux = "";
        this.state = 0;
    }

    IsDigit(_char: string){
        return _char.length === 1 && _char.match(/[0-9]/i);
    }

    IsLetter(_char: string){
        _char = _char.toLowerCase();
        return _char.length === 1 && _char.match(/[a-z]/i);
    }
    
    htmlTokens: Array<Token> = [];
    txtAuxH: string = "";
    Hstate: number = 0;
    scanHTML(_text: string): Array<Token>{
        this.htmlTokens = [];        

        this.Hstate = 0;

        let c = "";
        this.txtAuxH = "";
        _text = _text.replace("'", "");
        for(let i = 0; i < _text.length; i++){
            c = _text[i];

            switch(this.Hstate){
                case 0:
                    if(c === "<"){
                        this.Hstate = 1;
                        this.txtAuxH += c;
                    } 
                    else{
                        this.Hstate = 2;
                        this.txtAuxH += c;
                    }
                    break;
                // TAGs
                case 1:
                    if(c !== ">"){
                        this.txtAuxH += c;                        
                    }
                    else{
                        this.txtAuxH += c;
                        this.addHTMLTAG("TAG");
                    }
                    break;
                // Text
                case 2:
                    if(c !== "<"){
                        this.txtAuxH += c;
                    }
                    else{
                        // Add Text
                        this.addHTMLTAG("HTML_TEXT");
                        i--;
                    }
                    break;
            }
        }
        return this.htmlTokens;
    }

    addHTMLTAG(_htmlToken: string){
        if(_htmlToken === "TAG"){
            let flagBT = false;
            // regex = '(^</?)([-_a-zA-Z0-9:. "=]+)/?>'
            if(this.txtAuxH.match('(^</?)([-_a-zA-Z0-9:. "=]+)>')){
                let tag = "";
                if(this.txtAuxH.includes("body")){
                    // Analize body
                    flagBT = this.checkStyle(this.txtAuxH);
                    tag = "BODY_TAG";
                }
                else if(this.txtAuxH.includes("div")){
                    flagBT = this.checkStyle(this.txtAuxH);
                    tag = "DIV_TAG";
                }
                else{
                    if(this.txtAuxH.includes("html")){
                        tag = "HTML_TAG";
                    }
                    else if(this.txtAuxH.includes("head")){
                        tag = "HEAD_TAG";
                    }
                    else if(this.txtAuxH.includes("title")){
                        tag = "TITLE_TAG";
                    }
                    else if(this.txtAuxH.includes("br")){
                        tag = "BR_TAG";
                    }
                    else if(this.txtAuxH.includes("p")){
                        tag = "P_TAG";
                    }
                    else if(this.txtAuxH.match(/(h[1-4])/)){
                        tag = "H_TAG";
                    }
                    else if(this.txtAuxH.includes("button")){
                        tag = "BUTTON_TAG";
                    }
                    else if(this.txtAuxH.includes("label")){
                        tag = "LABEL_TAG";
                    }
                    else if(this.txtAuxH.includes("input")){
                        tag = "INPUT_TAG"
                    }
                    else{
                        tag = "BAD_TAG";
                    }
                }

                if(flagBT){
                    this.htmlTokens.push(new Token("BAD_TAG", this.txtAuxH, "html", "html"));
                }
                else{
                    if(this.txtAuxH.includes("/")){
                        tag += "_CLOSE";
                    }
                    this.htmlTokens.push(new Token(tag, this.txtAuxH, "html", "html"));
                }
            }
            else{
                this.htmlTokens.push(new Token("BAD_TAG", this.txtAuxH, "html", "html"));
            }
        }
        else{
            this.htmlTokens.push(new Token(_htmlToken, this.txtAuxH, "html", "html"));
        }
        this.txtAuxH = "";
        this.Hstate = 0;
    }

    checkStyle(_tag: string): boolean{
        let text = "";
        if(_tag.includes("body")){
            // Scan body
            _tag = _tag.replace(" ", "").replace("<", "").replace(">", "").replace("/", "").replace("\"", "");
            for(let i = 0; i < _tag.length; i++){
                text += _tag[i];
                if(text === "body"){
                    text = "";
                }
                else if(text === "style"){
                    text = "";
                }
                else if(text === "="){
                    text = "";
                }
                else if(text === "background"){
                    text = "";
                }
                else if(text === ":"){
                    text = "";
                }
                else if(text.match(/^(yellow|green|blue|red|white|skyblue)$/)){
                    text = "";
                }
                else if(text === " "){
                    text = "";
                }
                else if(text === "\""){
                    text = "";
                }
            }
            if(text.length > 0){
                return true;
            }
        }
        else{
            // Scan div
            _tag = _tag.replace(" ", "").replace("<", "").replace(">", "").replace("/", "");
            for(let i = 0; i < _tag.length; i++){
                text += _tag[i];
                if(text === "div"){
                    text = "";
                }
                else if(text === "style"){
                    text = "";
                }
                else if(text === "="){
                    text = "";
                }
                else if(text === "background"){
                    text = "";
                }
                else if(text === ":"){
                    text = "";
                }
                else if(text.match(/^(yellow|green|blue|red|white|skyblue)$/)){
                    text = "";
                }
            }
            if(text.length > 0){
                return true;
            }
        }

        return false;
    }
    
    htmlText: string = "";
    GenerateHTMLFile(){
        
    }

    jsonText: string = "";
    GenerateJSONFile(){

    }

}
