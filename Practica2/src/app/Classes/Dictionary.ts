import { Symbol } from './Symbol';

export class Dictionary{

    Symbols: Array<Symbol> = new Array<Symbol>();
    name: string

    constructor(_name: string){
        this.name = _name;
    }

    InsertNewSymbol(_symbol: Symbol){        
        this.Symbols.push(_symbol);
    }

    ChangeValueOfSymbol(_id: string, _newValue: string, _row: string, _column: string){
        if(this.CheckSymbol(_id)){
            this.GetSymbol(_id).value = _newValue;
        }
        else{
            // Symbol doesnt exist
            this.Symbols.push(new Symbol(_id, "var", _newValue, _row, _column));
        }
    }

    CheckSymbol(_id: string): boolean{
        for(let symbol of this.Symbols){
            if(_id === symbol.name){
                return true;
            }
        }
        return false;
    }

    GetSymbol(_id: string): Symbol{
        for(let symbol of this.Symbols){
            if(_id === symbol.name){
                return symbol;
            }
        }
        return null;
    }
}