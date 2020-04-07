import { Token } from './Token'
import { stringify } from 'querystring';

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
                
        this.state = 0;

        for(let char of _text){
            switch(this.state){
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
            }
        }

        return this.tokenList;
    }

    addToken(_tokenType: string){

    }
}
