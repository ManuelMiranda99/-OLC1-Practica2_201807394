import { Token } from './Token';

export class SyntacticAnalyzer{

    tokenList: Array<Token> = new Array<Token>();
    errorsList: Array<string> = new Array<string>();
    index: number = 0;
    tabs: number = 0;
    sintacticError: boolean = false;
    errorF: boolean = false;

    constructor(){
        
    }
}
