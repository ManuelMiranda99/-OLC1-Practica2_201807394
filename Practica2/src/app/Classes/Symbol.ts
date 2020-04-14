export class Symbol{

    type: string;
    name: string;
    value: string;

    row: string;
    column: string;

    constructor(_name: string, _type: string, _value: string, _row: string, _column: string){
        this.name = _name;
        this.type = _type;
        this.value = _value;

        this.row = _row;
        this.column = _column;
    }
}