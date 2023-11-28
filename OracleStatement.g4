grammar OracleStatement;

// 描述 Oracle SQL 中 SELECT 语句的语法结构
// ?表示可选
select_statement
    : SELECT (DISTINCT | UNIQUE | ALL)? selected_list from_clause where_clause?
    ;

selected_list
    : ASTERISK
    | select_list_elements (COMMA select_list_elements)*
    ;

from_clause
    : FROM table_ref_list
    ;

where_clause
    : WHERE expression
    ;

select_list_elements
    : tableview_name '.' ASTERISK
    | expression column_alias?
    ;

column_alias
    : AS? (identifier | quoted_string)
    | AS
    ;

quoted_string
    : variable_name
    | CHAR_STRING
    //| CHAR_STRING_PERL
    | NATIONAL_CHAR_STRING_LIT
    ;

variable_name
    : (INTRODUCER char_set_name)? id_expression ('.' id_expression)?
    ;

table_ref_list
    : table_ref (COMMA table_ref)*
    ;

table_ref
    : tableview_name
    ;

expression
    : relational_expression
    ;

relational_expression
    : relational_expression relational_operator relational_expression
    | compound_expression
    ;

compound_expression
    : general_element_part
    | numeric
    | quoted_string
    ;

numeric
    : UNSIGNED_INTEGER
    | APPROXIMATE_NUM_LIT
    ;

general_element_part
    : (INTRODUCER char_set_name)? id_expression ('.' id_expression)*
    ;

relational_operator
    : '='
    | (NOT_EQUAL_OP | '<' '>' | '!' '=' | '^' '=')
    | ('<' | '>') '='?
    ;

tableview_name
    : identifier ('.' id_expression)?
    ;

identifier
    : (INTRODUCER char_set_name)? id_expression
    ;

char_set_name
    : id_expression ('.' id_expression)*
    ;

id_expression
    : regular_id
    | DELIMITED_ID
    ;

regular_id
    : REGULAR_ID
    ;

AS:              'AS';
SELECT:          'SELECT';
DISTINCT:        'DISTINCT';
UNIQUE:          'UNIQUE';
ALL:             'ALL';
ASTERISK:        '*';
COMMA:           ',';
FROM:            'FROM';
WHERE:           'WHERE';
NOT_EQUAL_OP:    '!='
            |    '<>'
            |    '^='
            |    '~='
            ;
INTRODUCER:      '_';
DELIMITED_ID:    '"' (~('"' | '\r' | '\n') | '"' '"')+ '"' ;
REGULAR_ID: '$$'? (SIMPLE_LETTER | '\u4E00'..'\u9FA5'|'\uF900'..'\uFA2D') (SIMPLE_LETTER | '\u4E00'..'\u9FA5'|'\uF900'..'\uFA2D' | '$' | '_' | '#'| [0-9])*;
SPACES: [ \t\r\n]+ -> channel(HIDDEN);
UNSIGNED_INTEGER:    [0-9]+;
APPROXIMATE_NUM_LIT: FLOAT_FRAGMENT ('E' ('+'|'-')? (FLOAT_FRAGMENT | [0-9]+))? ('D' | 'F')?;
NATIONAL_CHAR_STRING_LIT: 'N' '\'' (~('\'' | '\r' | '\n' ) | '\'' '\'' | NEWLINE)* '\'';

CHAR_STRING: '\''  (~('\'' | '\r' | '\n') | '\'' '\'' | NEWLINE)* '\'';

fragment SIMPLE_LETTER  : [A-Za-z];
fragment FLOAT_FRAGMENT : UNSIGNED_INTEGER* '.'? UNSIGNED_INTEGER+;
fragment NEWLINE        : '\r'? '\n';
