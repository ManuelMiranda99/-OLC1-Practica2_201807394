export class ToPython{

    text: string;

    constructor(){
        this.text = "";
    }

    TraduceDecOrAssigOfVariable(_name: string, _value: string, _tabs: number){
        this.text += this.InsertTabs(_tabs) + _name + " = " + _value + "\n";
    }

    TraduceComment(_comment: string, _type: string, _tabs: number){
        let newComment = "";
        if(_type === "ONE_LINE_COMMENT"){
            for(let i = 2; i < _comment.length; i++){
                newComment += _comment[i];
            }
            this.text += this.InsertTabs(_tabs) + "#" + newComment + "\n";
        }
        else if(_type === "MULTILINE_COMMENT"){
            for(let i = 2; i < _comment.length - 2; i++){
                newComment += _comment[i];
            }
            this.text += this.InsertTabs(_tabs) + "''' \n" + newComment + "\n" + this.InsertTabs(_tabs) + "'''\n";
        }
    }

    TraducePrint(_impression: Array<string>, _tabs: number){
        this.text += this.InsertTabs(_tabs) + "print(";

        for(let i = 0; i < _impression.length;i++){
            this.text += _impression[i];
        }
        this.text += ")\n"
    }

    TraducePrint2(_tabs: number){
        this.text += this.InsertTabs(_tabs) + "print()\n";
    }

    TraduceIf(_condition: string, _tabs: number){
        this.text += this.InsertTabs(_tabs) + _condition + "\n";
    }

    TraduceSwitch(_tabs: number){
        this.text += this.InsertTabs(_tabs) + "def switch(case)";
    }

    InsertTabs(_tabs: number): string{
        let txt = "";
        for(let i =0; i < _tabs; i++){
            txt += "\t";
        }

        return txt;
    }

}