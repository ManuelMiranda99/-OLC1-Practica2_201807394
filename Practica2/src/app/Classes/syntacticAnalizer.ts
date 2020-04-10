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
    // Flags
    flagFunction: boolean = false;
    flagMethod: boolean = false;

    traductor: ToPython = new ToPython();

    constructor(){
        
    }

    PassComments(){
        while(this.preanalisis.type === "ONE_LINE_COMMENT" || this.preanalisis.type === "MULTILINE_COMMENT"){
            this.traductor.TraduceComment(this.preanalisis.lexeme, this.preanalisis.type, this.tabs);
            this.index++;
            this.preanalisis = this.tokenList[this.index];
        }
    }

    AddFunctionOrMethod(){
        if(this.flagFunction){
            this.SentencesListFunction();
        }
        else if(this.flagMethod){
            this.SentencesListMethod();
        }
    }

    Parea(_tokenType: string){
        this.PassComments();
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
                console.log("Se esperaba [" + _tokenType + "] en lugar de: [" + this.preanalisis.type + "] en linea " + this.preanalisis.row);
                this.errorsList.push("Se esperaba [" + _tokenType + "] en lugar de: [" + this.preanalisis.type + "]");
                this.sintacticError = true;
                this.errorF = true;
            }            
            if(this.preanalisis.type != "LAST"){
                if(this.preanalisis.type != _tokenType){
                    // Sintactic Error
                    console.log("Error sintactico");
                    this.errorsList.push("Se esperaba [" + _tokenType + "] en lugar de: [" + this.preanalisis.type + "]");
                    this.sintacticError = true;
                    this.errorF = true;
                }
                this.index++;
                this.preanalisis = this.tokenList[this.index];
                this.PassComments();
            }

        }
    }

    Start(_tokenList: Array<Token>): Array<string>{

        this.index = 0;
        this.tokenList = _tokenList;

        this.tokenList.push(new Token("LAST", "LAST", "GG", "GG"));

        this.preanalisis = this.tokenList[this.index];

        this.PassComments();

        this.tabs = -1;

        this.Parea("WR_CLASS");
        this.Parea("ID");
        this.Parea("S_OPEN_KEY");
        
        this.InsideClass();

        this.Parea("S_CLOSE_KEY");

        this.Parea("LAST");

        return this.errorsList;
    }

    InsideClass(){
        if(this.preanalisis.type === "WR_INT" || this.preanalisis.type === "WR_DOUBLE"|| this.preanalisis.type === "WR_CHAR" ||
        this.preanalisis.type === "WR_STRING" || this.preanalisis.type === "WR_BOOL"){
            this.Type();
            this.Parea("ID");
            this.FunctionOrNot();
            this.InsideClass();
        }
        else if(this.preanalisis.type === "WR_VOID"){
            this.Parea("WR_VOID");
            this.MainOrNot();
            this.InsideClass();
        }
        else{
            // Epsilon
        }
    }

    FunctionOrNot(){
        if(this.preanalisis.type === "S_OPEN_PARENTHESIS"){
            this.Parea("S_OPEN_PARENTHESIS");
            this.Parameter();
            this.Parea("S_CLOSE_PARENTHESIS");
            this.Parea("S_OPEN_KEY");

            this.flagFunction = true;

            this.SentencesList();
            this.SentencesListFunction();

            this.flagFunction = false;

            this.Parea("S_CLOSE_KEY");            
        }
        else{
            this.IDList();
            this.OptAssignment();
            this.Parea("S_SEMICOLON");            
        }
    }

    SentencesListFunction(){
        if(this.preanalisis.type === "WR_RETURN"){
            this.ReturnFunction();
            this.SentencesList();
            this.SentencesListFunction();
        }
        else{
            // Epsilon
        }
    }

    ReturnFunction(){
        this.Parea("WR_RETURN");
        this.Expression();
        this.Parea("S_SEMICOLON");
    }

    MainOrNot(){
        if(this.preanalisis.type === "WR_MAIN"){
            this.Parea("WR_MAIN");
            this.Parea("S_OPEN_PARENTHESIS");
            this.Parea("S_CLOSE_PARENTHESIS");
            this.Parea("S_OPEN_KEY");
            
            this.SentencesList();

            this.Parea("S_CLOSE_KEY");
        }
        else{
            this.Parea("ID");
            this.Parea("S_OPEN_PARENTHESIS");
            this.Parameter();
            this.Parea("S_CLOSE_PARENTHESIS");
            this.Parea("S_OPEN_KEY");

            this.flagMethod = true;

            this.SentencesList();
            this.SentencesListMethod();

            this.flagMethod = false;

            this.Parea("S_CLOSE_KEY");
        }
    }

    SentencesListMethod(){
        if(this.preanalisis.type === "WR_RETURN"){
            this.ReturnMethod();
            this.SentencesList();
            this.SentencesListMethod();
        }
        else{
            // Epsilon
        }
    }

    ReturnMethod(){
        this.Parea("WR_RETURN");
        this.Parea("S_SEMICOLON");
    }

    SentencesListLoops(){
        if(this.preanalisis.type === "WR_BREAK"){
            this.Parea("WR_BREAK");
            this.Parea("S_SEMICOLON");
        }
        else if(this.preanalisis.type === "WR_CONTINUE"){
            this.Parea("WR_CONTINUE");
            this.Parea("S_SEMICOLON");
        }
        else{
            // Epsilon
        }
    }

    SentencesListSwitch(){
        if(this.preanalisis.type === "WR_BREAK"){
            this.Parea("WR_BREAK");
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
        else{
            // Error
        }
    }

    Parameter(){
        if(this.preanalisis.type === "WR_INT" || this.preanalisis.type === "WR_DOUBLE"|| this.preanalisis.type === "WR_CHAR" ||
        this.preanalisis.type === "WR_STRING" || this.preanalisis.type === "WR_BOOL"){
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
        this.tabs++;
        if(this.preanalisis.type === "WR_INT" || this.preanalisis.type === "WR_DOUBLE"|| this.preanalisis.type === "WR_CHAR" ||
        this.preanalisis.type === "WR_STRING" || this.preanalisis.type === "WR_BOOL"){
            this.DeclarationSentence();
            this.tabs--;
            this.SentencesList();
        }
        else if(this.preanalisis.type === "ID"){
            this.AssignmentOrCallSentence();
            this.tabs--;
            this.SentencesList();
        }
        else if(this.preanalisis.type === "WR_CONSOLE"){
            this.PrintSentence();
            this.tabs--;
            this.SentencesList();
        }
        else if(this.preanalisis.type === "WR_IF"){
            this.IfElseSentence();
            this.tabs--;
            this.SentencesList();
        }
        else if(this.preanalisis.type === "WR_SWITCH"){
            this.SwitchSentence();
            this.tabs--;
            this.SentencesList();
        }
        else if(this.preanalisis.type === "WR_FOR"){
            this.ForSentence();
            this.tabs--;
            this.SentencesList();
        }
        else if(this.preanalisis.type === "WR_WHILE"){
            this.WhileSentence();
            this.tabs--;
            this.SentencesList();
        }
        else if(this.preanalisis.type === "WR_DO"){
            this.DoWhileSentence();
            this.tabs--;
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
        this.Impression();
        this.Parea("S_CLOSE_PARENTHESIS");
        this.Parea("S_SEMICOLON");
    }

    impressionList: Array<string> = new Array<string>();
    Impression(){
        this.impressionList = [];
        if(this.preanalisis.type === "INTEGER" || this.preanalisis.type === "DECIMAL" || this.preanalisis.type === "STRING" || this.preanalisis.type === "HTML_STRING" || this.preanalisis.type === "NORMAL_STRING" ||
        this.preanalisis.type === "ID" || this.preanalisis.type === "WR_TRUE" || this.preanalisis.type === "WR_FALSE" || this.preanalisis.type === "S_OPEN_PARENTHESIS"){
            this.Expression();
            this.traductor.TraducePrint(this.impressionList, this.tabs);
        }
        else{
            // Print without expression
            this.traductor.TraducePrint2(this.tabs);
        }
    }

    IfElseSentence(){
        this.Parea("WR_IF");
        this.Parea("S_OPEN_PARENTHESIS");
        this.Expression();
        this.Parea("S_CLOSE_PARENTHESIS");
        this.Parea("S_OPEN_KEY");

        this.SentencesList();

        this.AddFunctionOrMethod();

        this.tabs--;

        this.Parea("S_CLOSE_KEY");
        
        this.OptElse();

    }

    OptElse(){
        if(this.preanalisis.type === "WR_ELSE"){
            this.Parea("WR_ELSE");
            this.OptElseIf();
            this.Parea("S_OPEN_KEY");

            this.SentencesList();

            this.AddFunctionOrMethod();

            this.tabs--;

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

            this.AddFunctionOrMethod();

            this.SentencesListSwitch();

            this.tabs--;

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

            this.AddFunctionOrMethod();

            this.SentencesListSwitch();

            this.tabs--;

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

        this.AddFunctionOrMethod();

        this.SentencesListLoops();

        this.tabs--;

        this.Parea("S_CLOSE_KEY");
    }

    OptType(){
        if(this.preanalisis.type === "WR_INT" || this.preanalisis.type === "WR_DOUBLE"|| this.preanalisis.type === "WR_CHAR" ||
        this.preanalisis.type === "WR_STRING" || this.preanalisis.type === "WR_BOOL"){
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

        this.AddFunctionOrMethod();

        this.SentencesListLoops();

        this.tabs--;

        this.Parea("S_CLOSE_KEY");
    }

    DoWhileSentence(){
        this.Parea("WR_DO");
        this.Parea("S_OPEN_KEY");

        this.SentencesList();

        this.AddFunctionOrMethod();

        this.SentencesListLoops();

        this.tabs--;

        this.Parea("S_CLOSE_KEY");
        this.Parea("WR_WHILE");
        this.Parea("S_OPEN_PARENTHESIS");
        this.Expression();
        this.Parea("S_CLOSE_PARENTHESIS");
        this.Parea("S_OPEN_KEY");
        this.Parea("S_SEMICOLON");
    }

    ParameterListCall(){
        if(this.preanalisis.type === "INTEGER" || this.preanalisis.type === "DECIMAL" || this.preanalisis.type === "STRING" || this.preanalisis.type === "HTML_STRING" || this.preanalisis.type === "NORMAL_STRING" ||
        this.preanalisis.type === "ID" || this.preanalisis.type === "WR_TRUE" || this.preanalisis.type === "WR_FALSE" || this.preanalisis.type === "S_OPEN_PARENTHESIS"){
            this.Expression();
            this.PList();
        }
        else{
            // Epsilon
        }
    }

    PList(){
        if(this.preanalisis.type === "S_COMMA"){
            this.impressionList.push(this.preanalisis.lexeme);
            this.Parea("S_COMMA");
            this.Expression();
            this.PList();
        }
        else{
            // Epsilon
        }
    }

    Expression(){
        this.OptNot();
        this.E();
        this.OptComparisonSymbol();
        this.AndOrOpt();
    }

    OptNot(){
        if(this.preanalisis.type === "S_NOT"){
            this.impressionList.push(this.preanalisis.lexeme);
            this.Parea("S_NOT");
            this.OptNot();
        }
        else{
            // Epsilon
        }
    }

    AndOrOpt(){
        if(this.preanalisis.type === "S_AND"){
            this.Parea("S_AND");
            this.Expression();
        }
        else if(this.preanalisis.type === "S_OR"){
            this.Parea("S_OR");
            this.Expression();
        }
        else{
            // Epsilon
        }
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
            this.impressionList.push(this.preanalisis.lexeme);
            this.Parea("S_PLUS");
            this.T();
            this.EP();
        }
        else if(this.preanalisis.type === "S_MINUS"){
            this.impressionList.push(this.preanalisis.lexeme);
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
            this.impressionList.push(this.preanalisis.lexeme);
            this.Parea("S_PRODUCT");
            this.F();
        }
        else if(this.preanalisis.type === "S_DIVISION"){
            this.impressionList.push(this.preanalisis.lexeme);
            this.Parea("S_DIVISION");
            this.F();
        }
        else{
            // Epsilon
        }
    }

    F(){
        this.OptNot();
        this.FF();
    }

    FF(){
        if(this.preanalisis.type === "INTEGER"){
            this.impressionList.push(this.preanalisis.lexeme);
            this.Parea("INTEGER");
        }
        else if(this.preanalisis.type === "DECIMAL"){
            this.impressionList.push(this.preanalisis.lexeme);
            this.Parea("DECIMAL");
        }
        else if(this.preanalisis.type === "NORMAL_STRING" || this.preanalisis.type === "HTML_STRING"){
            this.impressionList.push(this.preanalisis.lexeme);
            this.preanalisis.type = "STRING";
            this.Parea("STRING")
        }
        else if(this.preanalisis.type === "ID"){
            this.impressionList.push(this.preanalisis.lexeme);
            this.Parea("ID");
            this.OptUseFunction();
        }
        else if(this.preanalisis.type === "WR_TRUE"){
            this.impressionList.push(this.preanalisis.lexeme);
            this.Parea("WR_TRUE");
        }
        else if(this.preanalisis.type === "WR_FALSE"){
            this.impressionList.push(this.preanalisis.lexeme);
            this.Parea("WR_FALSE");
        }
        else if(this.preanalisis.type === "S_OPEN_PARENTHESIS"){
            this.impressionList.push(this.preanalisis.lexeme);
            this.Parea("S_OPEN_PARENTHESIS");
            this.Expression();
            this.impressionList.push(this.preanalisis.lexeme);
            this.Parea("S_CLOSE_PARENTHESIS");
        }
        else{
            // Error
            this.Parea("VALORES");
        }
    }

    OptUseFunction(){
        if(this.preanalisis.type === "S_OPEN_PARENTHESIS"){
            this.impressionList.push(this.preanalisis.lexeme);
            this.Parea("S_OPEN_PARENTHESIS");
            this.ParameterListCall();
            this.impressionList.push(this.preanalisis.lexeme);
            this.Parea("S_CLOSE_PARENTHESIS");
        }
        else{
            // Epsilon
        }
    }
}
