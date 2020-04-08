import { Token } from './Token'

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
                
        _text += "#";

        this.state = 0;
        this.row = this.col = this.colF = 1;

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
                    else if(char === "\n"){ this.row++; this.col = 1; }
                    else if(char === " " || char === "\t") {  }
                    else{
                        if(char === "#"){
                            console.log("Analisis finalizado con exito");
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
                    if(char === "/n"){
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
                        this.state = 8;
                        this.col++;
                    }
                    else if(char === "\n"){
                        this.txtAux += char;
                        this.row++;
                        this.col = 1;
                    }
                    else{
                        this.txtAux == char;
                        this.col++;
                    }
                    break;
                case 8:
                    if(char === "/"){
                        this.txtAux += char;
                        this.col++;
                        this.addToken("MULTILINE_COMMENT");
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
                        if(char == "/n"){
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
                        if(char == "/n"){
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
                default:
                    console.log("Pero que leches");
                    break;
            }
        }

        return this.tokenList;
    }

    addToken(_tokenType: string){
        this.tokenList.push(new Token(_tokenType, this.txtAux, this.row.toString(), this.col.toString()));
        this.txtAux = "";
        this.state = 0;
    }

    IsDigit(_char: string):boolean{
        return _char.match(/[0-9]/i) === null;
    }

    IsLetter(_char: string):boolean{
        _char = _char.toLowerCase();
        return _char.match(/[a-z]/i) === null;
    }

    GenerateErrorsReport(){

    }

    GenerateHTMLFile(){

    }

    GenerateJSONFile(){
        
    }

}
