import { Token } from './Token';
import { ToPython } from './ToPython';

export class SyntacticAnalyzer{

    tokenList: Array<Token> = new Array<Token>();
    errorsList: Array<string> = new Array<string>();
    index: number = 0;
    tabs: number = 0;
    preanalisis: Token;
    sintacticError: boolean = false;
    errorF: boolean = false;
    traductor: ToPython = new ToPython();

    constructor(){
        
    }

    Parea(_tokenType: string){
        if(this.sintacticError){
            this.index++;
            this.preanalisis = this.tokenList[this.index];
            if(this.preanalisis.type === "S_SEMICOLON" || this.preanalisis.type === "S_TWO_POINTS" || this.preanalisis.type === "S_OPEN_KEY"){
                this.sintacticError = false;
            }
        }
        else{
            if(this.preanalisis.type != _tokenType && this.preanalisis.type != "ONE_LINE_COMMENT" && this.preanalisis.type != "MULTILINE_COMMENT"){
                // Sintactic Error
                console.log("Error sintactico");
                this.errorsList.push("Se esperaba [" + _tokenType + "] en lugar de: [" + this.preanalisis.type + "]");
                this.sintacticError = true;
                this.errorF = true;
            }
            if(this.preanalisis.type != "ULTIMO"){
                this.index++;
                this.preanalisis = this.tokenList[this.index];
                do{
                    if(this.preanalisis.type == "ONE_LINE_COMMENT" || this.preanalisis.type == "MULTILINE_COMMENT"){
                        // traductor.TraduceComment();
                        this.index++;
                        this.preanalisis = this.tokenList[this.index];
                    }
                }while(this.preanalisis.type == "ONE_LINE_COMMENT" || this.preanalisis.type == "MULTILINE_COMMENT");
            }

        }
    }
}
