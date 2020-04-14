import { Dictionary } from './Dictionary';

export class Tab{
    
    id: string;
    name: string;
    text: string;
    pythonText: string;
    htmlText: string;
    jsonText: string;
    dictionary: Dictionary;
    
    constructor(_id: string, _name: string, _text: string){
        this.id = _id;
        this.name = _name;
        this.text = _text;
        this.pythonText = "";
        this.htmlText = "";
        this.jsonText = "";
        this.dictionary = new Dictionary(_name);
    }

}