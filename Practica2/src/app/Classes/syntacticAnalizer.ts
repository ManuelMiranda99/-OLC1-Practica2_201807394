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

    Start(_tokenList: Array<Token>): Array<string>{

        this.index = 0;
        this.tokenList = _tokenList;

        this.preanalisis = this.tokenList[this.index];

        this.tabs = -1;
        this.Parea("WR_CLASS");
        this.Parea("ID");
        this.Parea("S_OPEN_KEY");
        
        this.FunctionList();

        this.Parea("WR_VOID");
        this.Parea("WR_MAIN");
        this.Parea("S_OPEN_PARENTHESIS");
        this.Parea("S_CLOSE_PARENTHESIS");
        this.Parea("S_OPEN_KEY");
        this.SentencesList();
        this.Parea("S_CLOSE_KEY");
        
        this.FunctionList();

        this.Parea("S_CLOSE_KEY");

        return this.errorsList;
    }

    FunctionList(){
        if(this.preanalisis.type === "WR_INT" || this.preanalisis.type === "WR_DOUBLE"|| this.preanalisis.type === "WR_CHAR" ||
        this.preanalisis.type === "WR_STRING" || this.preanalisis.type === "WR_BOOL" || this.preanalisis.type === "WR_VOID"){
            this.Type();

            this.Parea("ID");

            this.Parea("S_OPEN_PARENTHESIS");
            this.Parameter();
            this.Parea("S_CLOSE_PARENTHESIS");
            this.Parea("S_OPEN_KEY");
            this.SentencesList();
            this.ReturnOrNot();
            this.Parea("S_CLOSE_KEY");

            this.FunctionList();
        }
        else{
            // Epsilon
        }        
    }

    ReturnOrNot(){
        if(this.preanalisis.type === "WR_RETURN"){
            this.Parea("WR_RETURN");
            this.Expression();
            this.Parea("S_SEMICOLON");
        }
        else{
            // Epsilon
        }
    }

    Type(){
        if(this.preanalisis.type === "WR_INT"){
            this.Parea("WR_INT");
        }
        else if(this.preanalisis.type === "WR_DOUBLE"){
            this.Parea("WR_DOUBLE");
        }
        else if(this.preanalisis.type === "WR_CHAR"){
            this.Parea("WR_CHAR");
        }
        else if(this.preanalisis.type === "WR_STRING"){
            this.Parea("WR_STRING");
        }
        else if(this.preanalisis.type === "WR_BOOL"){
            this.Parea("WR_BOOL");
        }
        else if(this.preanalisis.type === "WR_VOID"){
            this.Parea("WR_VOID");
        }
    }

    Parameter(){
        if(this.preanalisis.type === "WR_INT" || this.preanalisis.type === "WR_DOUBLE"|| this.preanalisis.type === "WR_CHAR" ||
        this.preanalisis.type === "WR_STRING" || this.preanalisis.type === "WR_BOOL" || this.preanalisis.type === "WR_VOID"){
            this.ParameterDeclaration();
        }
        else{
            // Epsilon
        }
    }

    ParameterDeclaration(){
        this.Type();
        this.Parea("ID");
        this.ParameterList();
    }

    ParameterList(){
        if(this.preanalisis.type === "S_COMMA"){
            this.Parea("S_COMMA");
            this.ParameterDeclaration();
        }
        else{
            // Epsilon
        }
    }

    SentencesList(){
        if(this.preanalisis.type === "WR_INT" || this.preanalisis.type === "WR_DOUBLE"|| this.preanalisis.type === "WR_CHAR" ||
        this.preanalisis.type === "WR_STRING" || this.preanalisis.type === "WR_BOOL" || this.preanalisis.type === "WR_VOID"){
            this.DeclarationSentence();
            this.SentencesList();
        }
        else if(this.preanalisis.type === "ID"){
            this.AssignmentOrCallSentence();
            this.SentencesList();
        }
        else if(this.preanalisis.type === "WR_CONSOLE"){
            this.PrintSentence();
            this.SentencesList();
        }
        else if(this.preanalisis.type === "WR_IF"){
            this.IfElseSentence();
            this.SentencesList();
        }
        else if(this.preanalisis.type === "WR_SWITCH"){
            this.SwitchSentence();
            this.SentencesList();
        }
        else if(this.preanalisis.type === "WR_FOR"){
            this.ForSentence();
            this.SentencesList();
        }
        else if(this.preanalisis.type === "WR_WHILE"){
            this.WhileSentence();
            this.SentencesList();
        }
        else if(this.preanalisis.type === "WR_DO"){
            this.DoWhileSentence();
            this.SentencesList();
        }
        else {
            // Epsilon
        }
    }

    DeclarationSentence(){
        this.Type();
        this.VariablesDeclaration();
    }

    VariablesDeclaration(){
        this.Parea("ID");
        this.IDList();
        this.OptAssignment();
        this.Parea("S_SEMICOLON");
    }

    IDList(){
        if(this.preanalisis.type === "S_COMMA"){
            this.Parea("S_COMMA");
            this.Parea("ID");
            this.IDList();
        }
        else{
            // Epsilon
        }
    }

    OptAssignment(){
        if(this.preanalisis.type === "S_EQUALS"){
            this.Parea("S_EQUALS");
            this.Expression();
        }
        else{
            // Epsilon
        }
    }

    AssignmentOrCallSentence(){
        this.Parea("ID");
        this.OptAorCall();
        this.Parea("S_SEMICOLON");
    }

    OptAorCall(){
        if(this.preanalisis.type === "S_EQUALS"){
            this.Parea("S_EQUALS");
            this.Expression();            
        }
        else if(this.preanalisis.type === "S_OPEN_PARENTHESIS"){
            this.Parea("S_OPEN_PARENTHESIS");
            this.ParameterList();
            this.Parea("S_CLOSE_PARENTHESIS");            
        }        
    }

    PrintSentence(){
        this.Parea("WR_CONSOLE");
        this.Parea("S_POINT");
        this.Parea("WR_WRITE");
        this.Parea("S_OPEN_PARENTHESIS");
        this.Expression();
        this.Parea("S_CLOSE_PARENTHESIS");
        this.Parea("S_SEMICOLON");
    }

    IfElseSentence(){
        this.Parea("WR_IF");
        this.Parea("S_OPEN_PARENTHESIS");
        this.Expression();
        this.Parea("S_CLOSE_PARENTHESIS");
        this.Parea("S_OPEN_KEY");

        this.SentencesList();

        this.Parea("S_CLOSE_KEY");
        
        this.OptElse();

    }

    OptElse(){
        if(this.preanalisis.type === "WR_ELSE"){
            this.Parea("WR_ELSE");
            this.OptElseIf();
            this.Parea("S_OPEN_KEY");

            this.SentencesList();

            this.Parea("S_CLOSE_KEY");
        }
        else{
            // Epsilon
        }
    }

    OptElseIf(){
        if(this.preanalisis.type === "WR_IF"){
            this.Parea("WR_IF");
            this.Parea("S_OPEN_PARENTHESIS");
            this.Expression();
            this.Parea("S_CLOSE_PARENTHESIS");            
        }
        else{
            // Epsilon
        }
    }

    SwitchSentence(){
        this.Parea("WR_SWITCH");
        this.Parea("S_OPEN_PARENTHESIS");
        this.Expression();
        this.Parea("S_CLOSE_PARENTHESIS");
        this.Parea("S_OPEN_KEY");

        this.CaseList();
        this.OptDefault();

        this.Parea("S_CLOSE_KEY");
    }

    CaseList(){
        if(this.preanalisis.type === "WR_CASE"){
            this.Parea("WR_CASE");
            this.Expression();
            this.Parea("S_TWO_POINTS");

            this.SentencesList();

            this.Parea("WR_BREAK");
            this.Parea("S_SEMICOLON");

            this.CaseList();
        }
        else{
            // Epsilon
        }
    }

    OptDefault(){
        if(this.preanalisis.type === "WR_DEFAULT"){
            this.Parea("WR_DEFAULT");
            this.Parea("S_TWO_POINTS");
            
            this.SentencesList();

            this.Parea("WR_BREAK");
            this.Parea("S_SEMICOLON");            
        }
        else{
            // Epsilon
        }
    }

    ForSentence(){
        this.Parea("WR_FOR");
        this.Parea("S_OPEN_PARENTHESIS");
        this.OptType();
        this.AssignmentFor();
        this.Expression();
        this.Parea("S_SEMICOLON");
        this.Expression();
        this.OptIncDec();
        this.Parea("S_CLOSE_PARENTHESIS");
        this.Parea("S_OPEN_KEY");

        this.SentencesList();

        this.Parea("S_CLOSE_KEY");
    }

    OptType(){
        if(this.preanalisis.type === "WR_INT" || this.preanalisis.type === "WR_DOUBLE"|| this.preanalisis.type === "WR_CHAR" ||
        this.preanalisis.type === "WR_STRING" || this.preanalisis.type === "WR_BOOL" || this.preanalisis.type === "WR_VOID"){
            this.Type();
        }
        else{
            // Epsilon
        }
    }

    AssignmentFor(){
        this.Parea("ID");
        this.Parea("S_EQUALS");
        this.Expression();
        this.Parea("S_SEMICOLON");
    }

    OptIncDec(){
        if(this.preanalisis.type === "S_INCREMENT"){
            this.Parea("INCREMENT");
        }
        else if(this.preanalisis.type === "S_DECREMENT"){
            this.Parea("DECREMENT");
        }
        else{
            // Epsilon
        }
    }

    WhileSentence(){
        this.Parea("WR_WHILE");
        this.Parea("S_OPEN_PARENTHESIS");
        this.Expression();
        this.Parea("S_CLOSE_PARENTHESIS");
        this.Parea("S_OPEN_KEY");

        this.SentencesList();

        this.Parea("S_CLOSE_KEY");
    }

    DoWhileSentence(){
        this.Parea("WR_DO");
        this.Parea("S_OPEN_KEY");

        this.SentencesList();

        this.Parea("S_CLOSE_KEY");
        this.Parea("WR_WHILE");
        this.Parea("S_OPEN_PARENTHESIS");
        this.Expression();
        this.Parea("S_CLOSE_PARENTHESIS");
        this.Parea("S_OPEN_KEY");
        this.Parea("S_SEMICOLON");
    }

    ParameterListCall(){
        if(this.preanalisis.type === "INTEGER" || this.preanalisis.type === "DECIMAL" || this.preanalisis.type === "STRING" ||
        this.preanalisis.type === "ID" || this.preanalisis.type === "WR_TRUE" || this.preanalisis.type === "WR_FALSE"){
            this.Expression();
            this.PList();
        }
        else{
            // Epsilon
        }
    }

    PList(){
        if(this.preanalisis.type === "S_COMMA"){
            this.Parea("S_COMMA");
            this.Expression();
            this.PList();
        }
        else{
            // Epsilon
        }
    }

    Expression(){
        this.E();
        this.OptComparisonSymbol();
    }

    OptComparisonSymbol(){
        if(this.preanalisis.type === "S_EQUALS_EQUALS"){
            this.Parea("S_EQUALS_EQUALS");
            this.E();
        }
        else if(this.preanalisis.type === "S_MAJOR"){
            this.Parea("S_MAJOR");
            this.E();
        }
        else if(this.preanalisis.type === "S_LESS"){
            this.Parea("S_LESS");
            this.E();
        }
        else if(this.preanalisis.type === "S_MAJOR_EQUALS"){
            this.Parea("S_MAJOR_EQUALS");
            this.E();
        }
        else if(this.preanalisis.type === "S_LESS_EQUALS"){
            this.Parea("S_LESS_EQUALS");
            this.E();
        }
        else if(this.preanalisis.type === "S_DIFFERENT"){
            this.Parea("S_DIFFERENT");
            this.E();
        }
        else{
            // Epsilon
        }
    }

    E(){
        this.T();
        this.EP();
    }

    EP(){
        if(this.preanalisis.type === "S_PLUS"){
            this.Parea("S_PLUS");
            this.T();
            this.EP();
        }
        else if(this.preanalisis.type === "S_MINUS"){
            this.Parea("S_MINUS");
            this.T();
            this.EP();
        }
        else{
            // Epsilon
        }
    }

    T(){
        this.F();
        this.TP();
    }

    TP(){
        if(this.preanalisis.type === "S_PRODUCT"){
            this.Parea("S_PRODUCT");
            this.F();
        }
        else if(this.preanalisis.type === "S_DIVISION"){
            this.Parea("S_DIVISION");
            this.F();
        }
        else{
            // Epsilon
        }
    }

    F(){
        if(this.preanalisis.type === "INTEGER"){
            this.Parea("INTEGER");
        }
        else if(this.preanalisis.type === "DECIMAL"){
            this.Parea("DECIMAL");
        }
        else if(this.preanalisis.type === "NORMAL_STRING" || this.preanalisis.type === "HTML_STRING"){
            this.preanalisis.type = "STRING";
            this.Parea("STRING")
        }
        else if(this.preanalisis.type === "ID"){
            this.Parea("ID");
            this.OptUseFunction();
        }
        else if(this.preanalisis.type === "WR_TRUE"){
            this.Parea("WR_TRUE");
        }
        else if(this.preanalisis.type === "WR_FALSE"){
            this.Parea("WR_FALSE");
        }
        else{
            // Error
            this.Parea("VALORES");
        }
    }

    OptUseFunction(){
        if(this.preanalisis.type === "S_OPEN_PARENTHESIS"){
            this.Parea("S_OPEN_PARENTHESIS");
            this.ParameterListCall();
            this.Parea("S_CLOSE_PARENTHESIS");
        }
        else{
            // Epsilon
        }
    }
}
