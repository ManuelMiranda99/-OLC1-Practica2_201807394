import { Token } from './Token';
import { ToPython } from './ToPython';
import { Errors } from './Errors';
import { Dictionary } from './Dictionary';
import { Symbol } from './Symbol';

export class SyntacticAnalyzer{

    // List of tokens, errors, htmlTexts and Symbols
    tokenList: Array<Token> = new Array<Token>();
    errorsList: Array<Errors> = new Array<Errors>();
    htmlList: Array<string> = new Array<string>();
    dictionary: Dictionary;

    // "Flags" for loops and switch
    switchList: Array<number> = new Array<number>();
    loopList: Array<number> = new Array<number>();

    // Variables used for the sintactic analize
    index: number = 0;
    tabs: number = 0;
    preanalisis: Token;
    sintacticError: boolean = false;
    errorF: boolean = false;
    
    // Flags
    flagFunction: boolean = false;
    flagMethod: boolean = false;
    htmlFlag: boolean = false;

    traductor: ToPython;

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
        if(this.switchList.length > 0){
            this.SentencesListSwitch();
        }
        if(this.loopList.length > 0){
            this.SentencesListLoops();
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
                this.errorsList.push(new Errors("Sintactico", 0, "Se esperaba [" + _tokenType + "] en lugar de: [" + this.preanalisis.type + "]", this.preanalisis.row, this.preanalisis.column));
                this.sintacticError = true;
                this.errorF = true;
            }            
            if(this.preanalisis.type != "LAST"){
                if(this.preanalisis.type != _tokenType){
                    // Sintactic Error                    
                    this.sintacticError = true;
                    this.errorF = true;
                }
                this.index++;
                this.preanalisis = this.tokenList[this.index];
                this.PassComments();
            }

        }
    }

    Start(_tokenList: Array<Token>): Array<Errors>{

        this.traductor = new ToPython();
        this.index = 0;
        this.errorsList = [];
        this.tokenList = _tokenList;

        this.htmlList = [];
        this.dictionary = new Dictionary("");

        this.loopList = [];
        this.switchList = [];

        this.tokenList.push(new Token("LAST", "LAST", "GG", "GG"));

        if(this.tokenList.length > 5){
            this.preanalisis = this.tokenList[this.index];

            this.PassComments();

            this.tabs = 0;

            this.Parea("WR_CLASS");
            this.Parea("ID");
            this.Parea("S_OPEN_KEY");
            
            this.InsideClass();

            this.Parea("S_CLOSE_KEY");

            this.Parea("LAST");
        }

        

        return this.errorsList;
    }
    
    type: string;
    nameF:string;
    InsideClass(){
        if(this.preanalisis.type === "WR_INT" || this.preanalisis.type === "WR_DOUBLE"|| this.preanalisis.type === "WR_CHAR" ||
        this.preanalisis.type === "WR_STRING" || this.preanalisis.type === "WR_BOOL"){
            this.type = this.preanalisis.lexeme;            
            this.Type();
            this.idsDeclaration = [];
            this.idsDeclaration.push(this.preanalisis.lexeme);

            this.nameF = this.preanalisis.lexeme;

            this.Parea("ID");
            this.FunctionOrNot();            
            this.InsideClass();
        }
        else if(this.preanalisis.type === "WR_VOID"){
            this.Parea("WR_VOID");
            this.MainOrNot();
            this.tabs--;
            this.InsideClass();
        }
        else{
            // Epsilon
        }
    }

    auxParams: string = "";
    FunctionOrNot(){
        if(this.preanalisis.type === "S_OPEN_PARENTHESIS"){
            this.Parea("S_OPEN_PARENTHESIS");
            this.auxParams = "";
            this.Parameter();
            this.Parea("S_CLOSE_PARENTHESIS");
            this.Parea("S_OPEN_KEY");

            this.traductor.TraduceMethFunc(this.nameF, this.auxParams, this.tabs);

            this.flagFunction = true;

            this.SentencesList();
            this.SentencesListFunction();

            this.flagFunction = false;
            this.tabs--;
            this.Parea("S_CLOSE_KEY");            
        }
        else{
            this.IDList();
            this.OptAssignment();

            for(let variable of this.idsDeclaration){
                this.traductor.TraduceDecOrAssigOfVariable(variable, this.declarationValue, this.tabs);
                this.dictionary.InsertNewSymbol(new Symbol(variable, this.type, this.declarationValue, this.preanalisis.row, this.preanalisis.column));
            }

            this.Parea("S_SEMICOLON");            
        }
    }

    SentencesListFunction(){
        if(this.preanalisis.type === "WR_RETURN"){
            this.declarationValue = "";
            this.ReturnFunction();
            this.traductor.TraduceReturn(this.declarationValue, this.tabs);
            this.tabs--;
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

            this.traductor.TraduceBegginigOfMain(this.tabs);
            let auxTabs = this.tabs;
            
            this.SentencesList();

            this.traductor.TraduceEndOfMain(auxTabs);

            this.Parea("S_CLOSE_KEY");
        }
        else{
            let auxID = this.preanalisis.lexeme;
            this.Parea("ID");
            this.Parea("S_OPEN_PARENTHESIS");
            this.auxParams = "";
            this.Parameter();
            this.Parea("S_CLOSE_PARENTHESIS");
            this.Parea("S_OPEN_KEY");

            this.traductor.TraduceMethFunc(auxID, this.auxParams, this.tabs);

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
            this.tabs--;
            this.SentencesList();
            this.SentencesListMethod();
        }
        else{
            // Epsilon
        }
    }

    ReturnMethod(){
        this.Parea("WR_RETURN");
        this.traductor.TraduceReturn("", this.tabs);
        this.Parea("S_SEMICOLON");
    }

    SentencesListLoops(){
        if(this.preanalisis.type === "WR_BREAK"){
            this.traductor.TraduceBreak(this.tabs);
            this.Parea("WR_BREAK");
            this.Parea("S_SEMICOLON");
        }
        else if(this.preanalisis.type === "WR_CONTINUE"){
            this.traductor.TraduceContinue(this.tabs);
            this.Parea("WR_CONTINUE");
            this.Parea("S_SEMICOLON");
        }
        else{
            // Epsilon
        }
    }

    SentencesListSwitch(){
        if(this.preanalisis.type === "WR_BREAK"){
            this.traductor.TraduceBreak(this.tabs);
            this.Parea("WR_BREAK");
            this.Parea("S_SEMICOLON");
        }
        else{
            // Epsilon
        }
    }

    Type(){
        if(this.preanalisis.type === "WR_INT"){
            this.declarationValue = "0";
            this.Parea("WR_INT");
        }
        else if(this.preanalisis.type === "WR_DOUBLE"){
            this.declarationValue = "0.0";
            this.Parea("WR_DOUBLE");
        }
        else if(this.preanalisis.type === "WR_CHAR"){
            this.declarationValue = "''";
            this.Parea("WR_CHAR");
        }
        else if(this.preanalisis.type === "WR_STRING"){
            this.declarationValue = "\"\"";
            this.Parea("WR_STRING");
        }
        else if(this.preanalisis.type === "WR_BOOL"){
            this.declarationValue = "false";
            this.Parea("WR_BOOL");
        }
        else{
            // Error
            this.Parea("Tipo_De_Variable");
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
        this.auxParams += this.preanalisis.lexeme;
        this.Parea("ID");
        this.ParameterList();
    }

    

    ParameterList(){
        if(this.preanalisis.type === "S_COMMA"){
            this.auxParams += ", ";
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

    declarationValue: string;
    idsDeclaration: Array<string>;
    DeclarationSentence(){
        
        this.declarationValue = "";
        this.idsDeclaration = [];

        this.type = this.preanalisis.lexeme;
        this.Type();
        this.VariablesDeclaration();
    }

    VariablesDeclaration(){
        this.idsDeclaration.push(this.preanalisis.lexeme);
        this.Parea("ID");
        this.IDList();
        this.OptAssignment();

        for(let variable of this.idsDeclaration){
            this.traductor.TraduceDecOrAssigOfVariable(variable, this.declarationValue, this.tabs);
            this.dictionary.InsertNewSymbol(new Symbol(variable, this.type, this.declarationValue, this.preanalisis.row, this.preanalisis.column));

        }

        this.Parea("S_SEMICOLON");
    }

    IDList(){
        if(this.preanalisis.type === "S_COMMA"){
            this.Parea("S_COMMA");
            this.idsDeclaration.push(this.preanalisis.lexeme);
            this.Parea("ID");
            this.IDList();
        }
        else{
            // Epsilon
        }
    }

    OptAssignment(){
        if(this.preanalisis.type === "S_EQUALS"){
            this.declarationValue = "";
            this.Parea("S_EQUALS");
            this.Expression();
        }
        else{
            // Epsilon
        }
    }

    callF: string;
    AssignmentOrCallSentence(){
        this.callF = this.preanalisis.lexeme;
        
        this.declarationValue = "";
        this.idsDeclaration = [];
        this.idsDeclaration.push(this.preanalisis.lexeme);
        
        this.Parea("ID");
        this.OptAorCall();
        this.Parea("S_SEMICOLON");
    }

    OptAorCall(){
        if(this.preanalisis.type === "S_EQUALS"){
            this.Parea("S_EQUALS");
            this.Expression();
            this.traductor.TraduceDecOrAssigOfVariable(this.idsDeclaration[0], this.declarationValue, this.tabs);
            this.dictionary.InsertNewSymbol(new Symbol(this.idsDeclaration[0], this.type, this.declarationValue, this.preanalisis.row, this.preanalisis.column));
        }
        else if(this.preanalisis.type === "S_OPEN_PARENTHESIS"){
            this.callF += this.preanalisis.lexeme;
            this.Parea("S_OPEN_PARENTHESIS");
            this.ParameterListCall();
            this.callF += this.declarationValue;
            this.callF += this.preanalisis.lexeme;

            this.traductor.TraduceUseFunction(this.callF, this.tabs);

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
        this.preanalisis.type === "ID" || this.preanalisis.type === "WR_TRUE" || this.preanalisis.type === "WR_FALSE" || this.preanalisis.type === "S_OPEN_PARENTHESIS" || this.preanalisis.type === "S_NOT"){
            this.Expression();
            if(this.htmlFlag){
                for(let char of this.impressionList){
                    if(char.includes("'")){
                        this.htmlList.push(char);
                    }
                }
                this.htmlFlag = false;
            }
            this.traductor.TraducePrint(this.impressionList, this.tabs);
        }
        else{
            // Print without expression
            this.traductor.TraducePrint2(this.tabs);
        }
    }

    ifElseCondition: string;
    IfElseSentence(){
        this.ifElseCondition = "if ";
        this.Parea("WR_IF");
        this.Parea("S_OPEN_PARENTHESIS");
        this.Expression();

        this.traductor.TraduceIf(this.ifElseCondition, this.tabs);

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

            this.ElseIfOpt();
        }
        else{
            // Epsilon
        }
    }

    ElseIfOpt(){
        if(this.preanalisis.type === "S_OPEN_KEY"){
            this.ifElseCondition = "else";
            this.Parea("S_OPEN_KEY");

            this.traductor.TraduceIf(this.ifElseCondition, this.tabs);

            this.SentencesList();

            this.AddFunctionOrMethod();

            this.tabs--;

            this.Parea("S_CLOSE_KEY");

        }
        else if(this.preanalisis.type === "WR_IF"){
            this.Parea("WR_IF");
            this.Parea("S_OPEN_PARENTHESIS");

            this.ifElseCondition = "elif ";

            this.Expression();

            this.Parea("S_CLOSE_PARENTHESIS");

            this.Parea("S_OPEN_KEY");

            this.traductor.TraduceIf(this.ifElseCondition, this.tabs);

            this.SentencesList();

            this.AddFunctionOrMethod();

            this.tabs--;

            this.Parea("S_CLOSE_KEY");

            this.OptElse();

        }
        else{
            // ERROR
        }
    }

    SwitchSentence(){
        this.Parea("WR_SWITCH");
        this.Parea("S_OPEN_PARENTHESIS");

        this.declarationValue = "";

        this.Expression();

        this.traductor.TraduceBegginingSwitch(this.tabs, this.declarationValue);
        
        this.Parea("S_CLOSE_PARENTHESIS");
        this.Parea("S_OPEN_KEY");        

        this.tabs++;
        this.tabs++;

        this.CaseList();
        this.OptDefault();

        this.tabs--;

        this.traductor.TraduceEndSwitch(this.tabs);

        this.tabs--;
        

        this.Parea("S_CLOSE_KEY");
    }

    CaseList(){
        if(this.preanalisis.type === "WR_CASE"){
            this.Parea("WR_CASE");

            this.declarationValue = "";

            this.Expression();

            this.traductor.TraduceCase(this.declarationValue, this.tabs)

            this.Parea("S_TWO_POINTS");
            
            this.switchList.push(1);

            this.SentencesList();

            this.AddFunctionOrMethod();

            this.SentencesListSwitch();

            this.switchList.pop();

            this.traductor.TraduceEndCase(this.tabs);

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

            this.traductor.TraduceDefault(this.tabs);

            this.switchList.push(1);
            
            this.SentencesList();

            this.AddFunctionOrMethod();

            this.SentencesListSwitch();

            this.switchList.pop();

            this.traductor.TraduceEndCase(this.tabs);

            this.tabs--;

        }
        else{
            // Epsilon
        }
    }

    idFor: string;
    ForSentence(){
        this.Parea("WR_FOR");
        this.Parea("S_OPEN_PARENTHESIS");

        this.idFor = "";

        this.OptType();

        this.declarationValue = "";

        this.AssignmentFor();
                
        let beginWith = this.declarationValue;

        this.declarationValue = "";

        this.Expression();
        
        let flag = false;
        let endWith = "";
        for(let char of this.declarationValue){
            if(flag && char != "="){
                endWith += char;
            }
            if(char === ">" || char === "<" || char === "="){
                flag = true;
            }
        }        

        this.Parea("S_SEMICOLON");                

        this.declarationValue = "";

        this.Expression();
        
        this.OptIncDec();
        this.Parea("S_CLOSE_PARENTHESIS");
        this.Parea("S_OPEN_KEY");

        if(this.declarationValue.includes("--")){
            this.traductor.TraduceFor(this.idFor, endWith, beginWith, this.tabs);
        }
        else{
            this.traductor.TraduceFor(this.idFor, beginWith, endWith, this.tabs);
        }

        this.loopList.push(1);

        this.SentencesList();

        this.AddFunctionOrMethod();

        this.SentencesListLoops();

        this.loopList.pop();

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
        this.idFor = this.preanalisis.lexeme;
        this.Parea("ID");
        this.Parea("S_EQUALS");
        this.Expression();
        this.Parea("S_SEMICOLON");
    }

    OptIncDec(){
        if(this.preanalisis.type === "S_INCREMENT"){
            this.declarationValue += this.preanalisis.lexeme;
            this.Parea("S_INCREMENT");
        }
        else if(this.preanalisis.type === "S_DECREMENT"){
            this.declarationValue += this.preanalisis.lexeme;
            this.Parea("S_DECREMENT");
        }
        else{
            // Epsilon
        }
    }

    WhileSentence(){
        this.declarationValue = "";
        this.Parea("WR_WHILE");
        this.Parea("S_OPEN_PARENTHESIS");
        this.Expression();
        this.traductor.TraduceWhile(this.declarationValue, this.tabs);
        this.Parea("S_CLOSE_PARENTHESIS");
        this.Parea("S_OPEN_KEY");

        this.loopList.push(1);

        this.SentencesList();

        this.AddFunctionOrMethod();

        this.SentencesListLoops();

        this.loopList.pop();

        this.tabs--;

        this.Parea("S_CLOSE_KEY");
    }

    DoWhileSentence(){
        this.Parea("WR_DO");
        this.Parea("S_OPEN_KEY");
        this.traductor.TraduceBegginigOfDo(this.tabs);

        this.loopList.push(1);

        this.SentencesList();

        this.AddFunctionOrMethod();

        this.SentencesListLoops();

        this.tabs--;

        this.loopList.pop();

        this.Parea("S_CLOSE_KEY");
        this.Parea("WR_WHILE");
        this.Parea("S_OPEN_PARENTHESIS");
        this.declarationValue = "";
        this.Expression();
        this.traductor.TraduceEndOfDo(this.declarationValue, this.tabs);
        this.Parea("S_CLOSE_PARENTHESIS");
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
            this.addThings();            
            this.declarationValue += " ";
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
            this.addThings();
            this.Parea("S_NOT");
            this.OptNot();
        }
        else{
            // Epsilon
        }
    }

    AndOrOpt(){
        if(this.preanalisis.type === "S_AND"){
            this.addThings();
            this.Parea("S_AND");
            this.Expression();
        }
        else if(this.preanalisis.type === "S_OR"){
            this.addThings();
            this.Parea("S_OR");
            this.Expression();
        }
        else{
            // Epsilon
        }
    }

    OptComparisonSymbol(){
        if(this.preanalisis.type === "S_EQUALS_EQUALS"){
            this.addThings();
            this.Parea("S_EQUALS_EQUALS");
            this.E();
        }
        else if(this.preanalisis.type === "S_MAJOR"){
            this.addThings();
            this.Parea("S_MAJOR");
            this.E();
        }
        else if(this.preanalisis.type === "S_LESS"){
            this.addThings();
            this.Parea("S_LESS");
            this.E();
        }
        else if(this.preanalisis.type === "S_MAJOR_EQUALS"){
            this.addThings();
            this.Parea("S_MAJOR_EQUALS");
            this.E();
        }
        else if(this.preanalisis.type === "S_LESS_EQUALS"){
            this.addThings();
            this.Parea("S_LESS_EQUALS");
            this.E();
        }
        else if(this.preanalisis.type === "S_DIFFERENT"){
            this.addThings();
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
            this.addThings();
            this.Parea("S_PLUS");
            this.T();
            this.EP();
        }
        else if(this.preanalisis.type === "S_MINUS"){
            this.addThings();
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
            this.addThings();;
            this.Parea("S_PRODUCT");
            this.F();
            this.TP();
        }
        else if(this.preanalisis.type === "S_DIVISION"){
            this.addThings();
            this.Parea("S_DIVISION");
            this.F();
            this.TP();
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
            this.addThings();
            this.Parea("INTEGER");
        }
        else if(this.preanalisis.type === "DECIMAL"){
            this.addThings();
            this.Parea("DECIMAL");
        }
        else if(this.preanalisis.type === "NORMAL_STRING" || this.preanalisis.type === "HTML_STRING"){
            this.addThings();
            
            if(this.preanalisis.type === "HTML_STRING"){
                this.htmlFlag = true;
            }

            this.preanalisis.type = "STRING";
            this.Parea("STRING")
        }
        else if(this.preanalisis.type === "ID"){
            this.addThings();
            this.Parea("ID");
            this.OptUseFunction();
        }
        else if(this.preanalisis.type === "WR_TRUE"){
            this.addThings();
            
            this.Parea("WR_TRUE");
        }
        else if(this.preanalisis.type === "WR_FALSE"){
            this.addThings();
            this.Parea("WR_FALSE");
        }
        else if(this.preanalisis.type === "S_OPEN_PARENTHESIS"){
            this.addThings();
            this.Parea("S_OPEN_PARENTHESIS");
            this.Expression();
            this.addThings();
            
            this.Parea("S_CLOSE_PARENTHESIS");
        }
        else{
            // Error
            this.Parea("VALORES");
        }
    }

    OptUseFunction(){
        if(this.preanalisis.type === "S_OPEN_PARENTHESIS"){
            this.addThings();
            this.Parea("S_OPEN_PARENTHESIS");
            this.ParameterListCall();
            this.addThings();
            this.Parea("S_CLOSE_PARENTHESIS");
        }
        else{
            // Epsilon
        }
    }

    addThings(){
        this.declarationValue += this.preanalisis.lexeme;
        this.impressionList.push(this.preanalisis.lexeme);
        this.ifElseCondition += this.preanalisis.lexeme;        
    }

    /* -------------------- HTML TO JSON -------------------- */
    PareaHTML(_tokenType: string){
        this.htmlText += this.addTabs(this.htmlTabs) + this.htmlActualTag.lexeme + "\n";
        this.htmlIndex++;
        this.htmlActualTag = this.htmlTAGs[this.htmlIndex];
    }

    htmlTAGs: Array<Token>;
    htmlIndex = 0;
    htmlActualTag: Token;
    htmlText: string = "";
    jsonText: string = "";
    htmlTabs: number = 0;
    StartHTML(_tagList: Array<Token>){

        this.jsonText = "";
        this.htmlText = "";

        this.htmlTAGs = _tagList;
        this.htmlIndex = 0;
        this.htmlTabs = 0;        

        this.htmlActualTag = this.htmlTAGs[this.htmlIndex];

        if(this.htmlTAGs.length >= 8){            
            this.PareaHTML("HTML_TAG");
            this.jsonText += "\"HTML\":{\n";
            this.htmlTabs++;
            this.PareaHTML("HEAD_TAG");
            this.jsonText += this.addTabs(this.htmlTabs) + "\"HEAD\":{\n";
            this.htmlTabs++;
            this.PareaHTML("TITLE_TAG");
            this.jsonText += this.addTabs(this.htmlTabs) + "\"TITLE\":{\n";
            this.htmlTabs++;

            this.TitleSentence();
            
            this.PareaHTML("TITLE_TAG_CLOSE");
            this.jsonText += this.addTabs(this.htmlTabs) + "}\n"
            this.htmlTabs--;
            this.PareaHTML("HEAD_TAG_CLOSE");
            this.jsonText += this.addTabs(this.htmlTabs) + "}\n"

            let style = "";
            if(this.htmlActualTag.lexeme.includes("style")){            
                let flagS = false;
                let count = 0;
                for(let char of this.htmlActualTag.lexeme){
                    if(flagS){
                        if(style.length > 0 && char === "\""){
                            flagS = false;
                        }
                        style += char;
                    }
                    switch(char){
                        case "l":
                            count++;
                            break;
                        case "e":
                            count++;
                            break;
                        case "=":
                            count++;
                            break;
                    }
                    if(!flagS && count === 3){
                        flagS = true;
                    }                    
                }
            }
            this.PareaHTML("BODY_TAG");
            this.jsonText += this.addTabs(this.htmlTabs) + "\"BODY\":{\n";
            if(style.length > 0){
                this.jsonText += this.addTabs(this.htmlTabs + 1) + "\"STYLE\": " + style + ", \n";
            }        

            this.BodySentence();
            this.htmlTabs--;

            this.PareaHTML("BODY_TAG_CLOSE")
            this.jsonText += this.addTabs(this.htmlTabs) + "}\n";        
            this.htmlTabs--;

            this.PareaHTML("HTML_TAG_CLOSE");
            this.jsonText += this.addTabs(this.htmlTabs) + "}\n";        
            this.htmlTabs--;
        }        

    }

    TitleSentence(){
        if(this.htmlActualTag.type === "HTML_TEXT"){
            this.jsonText += this.addTabs(this.htmlTabs) + "\"TEXTO\": "+ this.htmlActualTag.lexeme +"\n";
            this.PareaHTML("HTML_TEXT");  
            this.htmlTabs--;          
        }
        else{
            // Epsilon
        }
    }

    BodySentence(){
        this.htmlTabs++;
        if(this.htmlActualTag.type === "DIV_TAG"){
            let style = "";
            if(this.htmlActualTag.lexeme.includes("style")){            
                let flagS = false;
                let count = 0;
                for(let char of this.htmlActualTag.lexeme){
                    switch(char){
                        case "l":
                            count++;
                            break;
                        case "e":
                            count++;
                            break;
                        case "=":
                            count++;
                            break;
                    }
                    if(!flagS && count === 4){
                        flagS = true;
                    }
                    if(flagS){
                        if(style.length > 0 && char === "\""){
                            flagS = false;
                        }
                        style += char;
                    }
                }
            }
            this.PareaHTML("DIV_TAG");
            this.jsonText += this.addTabs(this.htmlTabs) + "\"DIV\":{\n";
            if(style.length > 0){
                this.jsonText += this.addTabs(this.htmlTabs) + "\"STYLE\": " + style + ", \n";
            }            
            this.BodySentence();
            this.htmlTabs--;
            this.jsonText += this.addTabs(this.htmlTabs) + "}\n";
            this.PareaHTML("DIV_TAG_CLOSE");
            this.htmlTabs--;
            this.BodySentence();
        }
        else if(this.htmlActualTag.type === "BR_TAG"){
            this.PareaHTML("BR_TAG");
            this.jsonText += this.addTabs(this.htmlTabs) + "\"BR\",\n"
            this.htmlTabs--;
            this.BodySentence();
        }
        else if(this.htmlActualTag.type === "P_TAG"){
            this.PareaHTML("P_TAG");
            this.jsonText += this.addTabs(this.htmlTabs) + "\"P\":{\n";
            this.BodySentence();
            this.htmlTabs--;
            this.jsonText += this.addTabs(this.htmlTabs) + "}\n";
            this.PareaHTML("P_TAG_CLOSE");
            this.htmlTabs--;
            this.BodySentence();
        }
        else if(this.htmlActualTag.type === "H_TAG"){            
            this.PareaHTML("H_TAG");
            this.jsonText += this.addTabs(this.htmlTabs) + "\"H\":{\n";
            this.BodySentence();
            this.htmlTabs--;
            this.jsonText += this.addTabs(this.htmlTabs) + "}\n";
            this.PareaHTML("H_TAG_CLOSE");
            this.htmlTabs--;
            this.BodySentence();
        }
        else if(this.htmlActualTag.type === "BUTTON_TAG"){
            this.jsonText += this.addTabs(this.htmlTabs) + "\"BUTTON\":{\n";
            this.PareaHTML("BUTTON_TAG");
            this.BodySentence();
            this.htmlTabs--;
            this.jsonText += this.addTabs(this.htmlTabs) + "}\n";
            this.PareaHTML("BUTTON_TAG_CLOSE");
            this.htmlTabs--;
            this.BodySentence();
        }
        else if(this.htmlActualTag.type === "LABEL_TAG"){
            this.jsonText += this.addTabs(this.htmlTabs) + "\"LABEL\":{\n";
            this.PareaHTML("LABEL_TAG");
            this.BodySentence();
            this.htmlTabs--;
            this.jsonText += this.addTabs(this.htmlTabs) + "}\n";
            this.PareaHTML("LABEL_TAG_CLOSE");
            this.htmlTabs--;
            this.BodySentence();
        }
        else if(this.htmlActualTag.type === "INPUT_TAG"){
            this.jsonText += this.addTabs(this.htmlTabs) + "\"INPUT\",\n";
            this.PareaHTML("INPUT_TAG");
            this.htmlTabs--;
            this.BodySentence();
        }
        else if(this.htmlActualTag.type === "HTML_TEXT"){
            this.jsonText += this.addTabs(this.htmlTabs) + "\"TEXTO\": "+ this.htmlActualTag.lexeme +",\n";
            this.PareaHTML("HTML_TEXT");
            this.htmlTabs--;
            this.BodySentence();
        }
        else{
            // Epsilon
        }
    }

    addTabs(_tabs: number): string{
        let text = "";
        for(let i=0; i < _tabs; i++){
            text += "     ";
        }
        return text;
    }
    /*
BodySentences := 

    | DIV_TAG <BodySentences> DIV_TAG_CLOSE
    | BR_TAG <BodySentences> 
    | P_TAG <BodySentences> P_TAG_CLOSE
    | H_TAG <BodySentences> H_TAG_CLOSE
    | BUTTON_TAG <BodySentences> BUTTON_TAG_CLOSE
    | LABEL_TAG <BodySentences> LABEL_TAG_CLOSE
    | INPUT_TAG <BodySentences>
    | HTML_TEXT <BodySentences>
    | ε
    
    */
}
