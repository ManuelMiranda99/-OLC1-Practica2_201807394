
export class Token{
    
    /*TokenType = {
        Reserved Words
            WR_CLASS: 'class',
            WR_VOID: 'void',
            WR_MAIN: 'main',
            WR_CONSOLE: 'Console',
            WR_WRITE: 'Write',
            WR_IF: 'if',
            WR_ELSE: 'else',
            WR_SWITCH: 'switch',
            WR_CASE: 'case',
            WR_BREAK: 'break',
            WR_DEFAULT: 'default',
            WR_DO: 'do',
            WR_WHILE: 'while',
            WR_FOR: 'for',
            WR_RETURN: 'return',
            WR_CONTINUE: 'continue',
            WR_TRUE: 'true',
            WR_FALSE: 'false',        
                Types 
            WR_INT: 'int',
            WR_DOUBLE: 'double',
            WR_CHAR: 'char',
            WR_BOOL: 'bool',
            WR_STRING: 'string',
                End of Types 
        End of Reserved Words
        Symbols
            S_OPEN_KEY: '{',
            S_CLOSE_KEY: '}',
            S_OPEN_PARENTHESIS: '(',
            S_CLOSE_PARENTHESIS: ')',
            S_COMMA: ',',
            S_SEMICOLON: ';',
            S_POINT: '.',
            S_TWO_POINTS: ':',        
            S_EQUALS: '=',
            S_PLUS: '+',
            S_MINUS: '-',
            S_PRODUCT: '*',
            S_DIVISION: '/',
            S_NOT: '!',
            S_AND: '&&'
            S_OR: '||'
            INCREMENT_OR_DECREMENT: 'Incremento o Decremento',
            S_INCREMENT: '++',
            S_DECREMENT: '--',
                Condition Symbols
            CONDITION: 'Condicion',
            S_EQUALS_EQUALS: '==',
            S_MAJOR: '>',
            S_LESS: '<',
            S_MAJOR_EQUALS: '>=',
            S_LESS_EQUALS: '<=',
            S_DIFFERENT: '!=',        
        End of Symbols
        INTEGER: 'Entero',
        DECIMAL: 'Decimal',
        STRING: 'String',
        NORMAL_STRING,
        HTML_STRING
        ID: 'ID',
        COMMENT: 'Comment',
        ONE_LINE_COMMENT,
        MULTILINE_COMMENT
        UNKNOWN: 'Desconocido',
        LAST: 'Ultimo',

        BegginingOfTAG
        ContentOfTag
        EndOfTag
        WR_STYLE
    };*/

    type: string;
    lexeme: string;
    row: string;
    column: string;

    constructor(_type: string, _lexeme: string, _row: string, _column: string){
        if(_type == "ID"){
            switch(_lexeme){
                case "class":
                    this.type = "WR_CLASS";
                    break;
                case "void":
                    this.type = "WR_VOID"
                    break;
                case "main":
                    this.type = "WR_MAIN";
                    break;
                case "Console":
                    this.type = "WR_CONSOLE";
                    break;
                case "Write":
                    this.type = "WR_WRITE"
                    break;
                case "if":
                    this.type = "WR_IF";
                    break;
                case "else":
                    this.type = "WR_ELSE";
                    break;
                case "switch":
                    this.type = "WR_SWITCH";
                    break;
                case "case":
                    this.type = "WR_CASE";
                    break;
                case "break":
                    this.type = "WR_BREAK";
                    break;
                case "default":
                    this.type = "WR_DEFAULT";
                    break;
                case "do":
                    this.type = "WR_DO";
                    break;
                case "while":
                    this.type = "WR_WHILE";
                    break;
                case "for":
                    this.type = "WR_FOR";
                    break;
                case "return":
                    this.type = "WR_RETURN";
                    break;
                case "continue":
                    this.type = "WR_CONTINUE";
                    break;
                case "true":
                    this.type = "WR_TRUE";
                    break;
                case "false":
                    this.type = "WR_FALSE";
                    break;
                /* Types */
                case "int":
                    this.type = "WR_INT";
                    break;
                case "double":
                    this.type = "WR_DOUBLE";
                    break;
                case "char":
                    this.type = "WR_CHAR";
                    break;
                case "bool":
                    this.type = "WR_BOOL";
                    break;
                case "string":
                case "String":
                    this.type = "WR_STRING";
                    break;
                default:
                    this.type = "ID";
                    break;
            }
        }else{
            this.type = _type;
        }
        this.lexeme = _lexeme;
        this.row = _row;
        this.column = _column;
    }
}
