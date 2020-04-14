export class Errors{
    
    type: string;
    id: number;
    description: string;
    row: string;
    column: string;
    
    constructor(_type: string, _id: number, _description: string, _row: string, _column: string){
        this.type = _type;
        this.id = _id;
        this.description = _description;
        this.row = _row;
        this.column = _column;
    }
}