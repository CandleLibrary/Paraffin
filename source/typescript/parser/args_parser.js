
    import { ParserFactoryNew as ParserFactory } from "@candlelib/hydrocarbon";

    const recognizer_initializer = (()=>{
        var lookup_table = new Uint8Array( 382976 )
var sequence_lookup = new Uint8Array( 8 )
var TokenSymbol = 1
var TokenIdentifier = 2
var TokenSpace = 4
var TokenNewLine = 8
var TokenNumber = 16
var TokenIdentifierUnicode = 32|TokenIdentifier
var TokenFullNumber = 128|TokenNumber
var UNICODE_ID_CONTINUE = 32
var UNICODE_ID_START = 64
var NULL_STATE = 0
var STATE_ALLOW_SKIP = 1
var STATE_ALLOW_OUTPUT = 2
function compare(data, data_offset, sequence_offset, byte_length){
    var i = data_offset;
    var j = sequence_offset;
    var len = j+byte_length;
    for(  ; j<len ; i++, j ++ ) 
    if( ( data.input[i]!=sequence_lookup[j] ) )return j -sequence_offset;;
    return byte_length
}
function cmpr_set (l , data, sequence_offset, byte_length, token_length){
    if( ( byte_length )==compare( data, l.byte_offset, sequence_offset, byte_length ) ){
        l.byte_length = byte_length;
        l.token_length = token_length;
        return true
    };
    return false
}
function getUTF8ByteLengthFromCodePoint (code_point ){
    if( ( code_point )==0 )return 1
; else if( ( code_point &0x7F )==code_point ){
        return 1
    } else if( ( code_point &0x7FF )==code_point ){
        return 2
    } else if( ( code_point &0xFFFF )==code_point ){
        return 3
    } else {
        return 4
    }
}
function utf8ToCodePoint (l , data){
    var buffer = data.input;
    var index = l.byte_offset +l.byte_length;
    var a = buffer[index];
    var flag = 14;
    if( a &0x80 ){
        flag = a &0xF0;
        var b = buffer[index + 1];
        if( flag &0xE0 ){
            flag = a &0xF8;
            var c = buffer[index + 2];
            if( ( flag )==0xF0 ){
                return ( ( a &0x7 )<<18 )|( ( b &0x3F )<<12 )|( ( c &0x3F )<<6 )|( buffer[index + 3]&0x3F )
            } else if( ( flag )==0xE0 ){
                return ( ( a &0xF )<<12 )|( ( b &0x3F )<<6 )|( c &0x3F )
            }
        } else if( ( flag )==0xC ){
            return ( ( a &0x1F )<<6 )|b &0x3F
        }
    } else return a;
    return 0
}
function getTypeAt (code_point ){
    return ( lookup_table[code_point]&0x1F )
}
class Lexer {
    constructor(){
        this.byte_offset = 0;
        this.byte_length = 0;
        this.token_length = 0;
        this.token_offset = 0;
        this.prev_token_offset = 0;
        this.type = 0;
        this.line = 0;
        this.current_byte = 0
    };
    isDiscrete(data, assert_class, offset = 0, USE_UNICODE = false){
        var type = 0;
        offset  += this.byte_offset;
        if( ( offset >=data.input_len ) )return true;;
        var current_byte = data.input[offset];
        if( ( !USE_UNICODE ||current_byte  < 128 ) ){
            type = getTypeAt( current_byte )
        } else type = getTypeAt( utf8ToCodePoint( offset, data ) );
        return ( type &assert_class )==0
    };
    setToken(type, byte_length, token_length){
        this.type = type;
        this.byte_length = byte_length;
        this.token_length = token_length
    };
    getType (USE_UNICODE, data){
        if( this.END( data ) )return 0;;
        if( ( this.type )==0 )if( ( !( USE_UNICODE )||this.current_byte  < 128 ) )this.type = getTypeAt( this.current_byte ); else {
            var index = this.byte_offset;
            this.type = getTypeAt( utf8ToCodePoint( this, data ) )
        };;
        return this.type
    };
    isSym (USE_UNICODE, data){
        return ( !this.END( data ) )&&this.getType( USE_UNICODE, data )==TokenSymbol
    };
    isNL (){
        return ( this.current_byte )==10||( this.current_byte )==13

    };
    isSP (USE_UNICODE, data){
        return ( this.current_byte )==32||USE_UNICODE &&( TokenSpace )==this.getType( USE_UNICODE, data )
    };
    isNum (data){
        if( ( this.type )==0||( this.type )==TokenNumber ){
            if( this.getType( false, data )==TokenNumber ){
                var l = data.input_len;
                var off = this.byte_offset;
                while( ( off++<l )&&47<data.input[off]&&data.input[off]<58 ) {
                        this.byte_length +=1;
                        this.token_length  += 1
                    };
                this.type = TokenFullNumber;
                return true
            } else return false
        } else return ( this.type )==TokenFullNumber

    };
    isUniID (data){
        if( ( ( this.type )==0||( this.type )==TokenIdentifier ) ){
            if( ( this.getType( true, data )==TokenIdentifier ) ){
                var l = data.input_len;
                var off = this.byte_offset;
                var prev_byte_len = this.byte_length;
                while( ( ( off +this.byte_length )<l )&&( ( UNICODE_ID_START |UNICODE_ID_CONTINUE )&lookup_table[utf8ToCodePoint( this, data )] )>0 ) {
                        this.byte_length +=1;
                        prev_byte_len = this.byte_length;
                        this.token_length  += 1
                    };
                this.byte_length = prev_byte_len;
                this.type = TokenIdentifierUnicode;
                return true
            } else return false
        } else return ( this.type )==TokenIdentifierUnicode
    };
    copy(){
        var destination = new Lexer(  );
        destination.byte_offset = this.byte_offset;
        destination.byte_length = this.byte_length;
        destination.token_length = this.token_length;
        destination.token_offset = this.token_offset;
        destination.prev_token_offset = this.prev_token_offset;
        destination.line = this.line;
        destination.byte_length = this.byte_length;
        destination.current_byte = this.current_byte;
        return destination

    };
    sync(source){
        this.byte_offset = source.byte_offset;
        this.byte_length = source.byte_length;
        this.token_length = source.token_length;
        this.token_offset = source.token_offset;
        this.prev_token_offset = source.prev_token_offset;
        this.line = source.line;
        this.type = source.type;
        this.current_byte = source.current_byte;
        return this

    };
    slice(source){
        this.byte_length = this.byte_offset -source.byte_offset;
        this.token_length = this.token_offset -source.token_offset;
        this.byte_offset = source.byte_offset;
        this.token_offset = source.token_offset;
        this.line = source.line;
        return this
    };
    next(data){
        this.byte_offset +=this.byte_length;
        this.token_offset  += this.token_length;
        if( ( data.input_len <this.byte_offset ) ){
            this.type = 0;
            this.byte_length = 0;
            this.token_length = 0
        } else {
            this.current_byte = data.input[this.byte_offset];
            if( ( this.current_byte )==10 )this.line  += 1;;
            this.type = 0;
            this.byte_length = 1;
            this.token_length = 1
        };
        return this

    };
    END(data){
        return this.byte_offset >=data.input_len

    }
}
class ParserData{
    constructor(input_len, rules_len, error_len){
        this.state = createState( 1 );
        this.prop = 0;
        this.valid = false;
        this.stack_ptr = 0;
        this.input_ptr = 0;
        this.rules_ptr = 0;
        this.error_ptr = 0;
        this.input_len = input_len;
        this.rules_len = rules_len;
        this.error_len = error_len;
        this.debug_len = 0;
        this.origin_fork = 0;
        this.origin = 0;
        this.alternate = 0;
        this.lexer =new Lexer(  );
        this.input =new Uint8Array( input_len );
        this.rules =new Uint16Array( rules_len );
        this.error =new Uint8Array( error_len );
        this.stash =new Uint32Array( 256 );
        this.stack =new Array(  )
    }
}
class ForkData{
    constructor(ptr, valid, depth, byte_offset, byte_length, line){
        this.byte_offset = byte_offset;
        this.byte_length = byte_length;
        this.line = line;
        this.ptr = ptr;
        this.valid = valid;
        this.depth = depth;
        this.command_offset = 0;
        this.command_block =new Uint16Array( 64 )
    }
}
function fork(data){
    var fork = new ParserData( data.input_len, data.rules_len, data.error_len  - data.error_ptr
 );
    var i = 0;
    for(  ; i <data.stack_ptr ; i++ ) 
    {
        fork.stash[i] = data.stash[i];
        fork.stack[i] = data.stack[i]
    };
    fork.stack_ptr = data.stack_ptr;
    fork.input_ptr = data.input_ptr;
    fork.origin_fork = data.rules_ptr +data.origin_fork;
    fork.origin = data;
    fork.lexer = data.lexer.copy(  );
    fork.state = data.state;
    fork.prop = data.prop;
    fork.input = data.input;
    while( ( data.alternate ) ) {
            data = data.alternate
        };
    data.alternate = fork;
    return fork
}
function init_data(input_len, rules_len, error_len){
    var parser_data = new ParserData( input_len, rules_len, error_len );
    return parser_data

}
function assert_ascii(l, a, b, c, d){
    var ascii = l.current_byte;
    if( ascii <32 )return ( ( a &( 1<<ascii ) )!=0 ); else if( ascii <64 )return ( ( b &( 1<<( ascii -32 ) ) )!=0 ); else if( ascii <96 )return ( ( c &( 1<<( ascii -64 ) ) )!=0 ); else if( ascii <128 )return ( ( d &( 1<<( ascii -96 ) ) )!=0 );;
    return false
}
function add_reduce(state, data, sym_len, body, DNP = false){
    if( isOutputEnabled( state ) ){
        var total = body +sym_len;
        if( ( total )==0 )return;;
        if( body >0xFF||sym_len >0x1F ){
            var low = ( 1<<2 )|( body &0xFFF8 );
            var high = sym_len;
            set_action( low, data );
            set_action( high, data )
        } else {
            var low = ( ( sym_len &0x1F )<<3 )|( ( body &0xFF )<<8 );
            set_action( low, data )
        }
    }
}
function add_shift(l, data, tok_len){
    if( tok_len <0 )return;;
    if( tok_len >0x1FFF ){
        var low = 1|( 1<<2 )|( ( tok_len >>13 )&0xFFF8 );
        var high = ( tok_len &0xFFFF );
        set_action( low, data );
        set_action( high, data )
    } else {
        var low = 1|( ( tok_len <<3 )&0xFFF8 );
        set_action( low, data )
    }
}
function add_skip(l, data, skip_delta){
    if( skip_delta <1 )return;;
    if( skip_delta >0x1FFF ){
        var low = 2|( 1<<2 )|( ( skip_delta >>13 )&0xFFF8 );
        var high = ( skip_delta &0xFFFF );
        set_action( low, data );
        set_action( high, data )
    } else {
        var low = 2|( ( skip_delta <<3 )&0xFFF8 );
        set_action( low, data )
    }
}
function set_error(val, data){
    if( ( data.error_ptr >data.error_len ) )return;;
    data.error[data.error_ptr ++] = val
}
function set_action(val, data){
    if( ( data.rules_ptr >data.rules_len ) )return;;
    data.rules[data.rules_ptr ++] = val
}
function createState(ENABLE_STACK_OUTPUT){
    return STATE_ALLOW_SKIP |( ENABLE_STACK_OUTPUT <<1 )
}
function hasStateFailed(state){
    var IS_STATE_VALID = 1;
    return 0==( state &IS_STATE_VALID )
}
function mark(val, data){
    return action_ptr 
}
function isOutputEnabled(state){
    return NULL_STATE !=( state &STATE_ALLOW_OUTPUT )
}
function reset(mark, origin, advanced, state){
    action_ptr = mark;
    advanced.sync( origin );
    return state

}
function consume(l, data, state){
    if( isOutputEnabled( state ) )add_shift( l, data, l.token_length );;
    l.next( data );
    return true
}
function assertSuccess(l, data, condition){
    if( ( condition ||hasStateFailed( state ) ) )return fail( l, state ); else return state

}
function debug_add_header(data, number_of_items, delta_char_offset, peek_start, peek_end, fork_start, fork_end){
    if( ( data.debug_ptr +1>=data.debug_len ) )return;;
    var local_pointer = data.debug_ptr;
    if( ( delta_char_offset >62 ) ){
        data.debug[local_pointer + 1] = delta_char_offset;
        delta_char_offset = 63;
        data.debug_ptr ++
    };
    data.debug[local_pointer] = ( ( number_of_items &&2 )|( delta_char_offset <<6 )|( ( peek_start &1 )<<12 )|( ( peek_end &1 )<<13 )|( ( fork_start &1 )<<14 )|( ( fork_end &1 )<<15 ) );
    data.debug_ptr ++
}
function pushFN(data, _fn_ref){
    data.stack[++ data.stack_ptr] = _fn_ref
}
function init_table(){
    return lookup_table
}
var data_stack = new Array(  )
function run(data){
    data_stack.length = 0;
    data_stack.push( data );
    var ACTIVE = true;
    while( ( ACTIVE ) ) {
            for( var data of data_stack )
            {
                ACTIVE = stepKernel( data, 0 )
            }
        }
}
function stepKernel(data, stack_base){
    var ptr = data.stack_ptr;
    var _fn = data.stack[ptr];
    var stash = data.stash[ptr];
    data.stack_ptr --;
    var result = _fn( data.lexer, data, data.state, data.prod, stash );
    data.stash[ptr] = result;
    data.prod = result;
    if( ( result<0||data.stack_ptr <stack_base ) ){
        data.valid = data.lexer.END( data );
        return false
    };
    return true
}
function get_fork_information(){
    var i = 0;
    var fork_data = Array(  );
    for( var data of data_stack )
    {
        var fork = new ForkData( ( i++ ), ( data.valid ), ( data.origin_fork +data.rules_ptr ), data.lexer.byte_offset, data.lexer.byte_length, data.lexer.line
 );
        fork_data.push( fork )
    };
    return fork_data
}
function block64Consume(data, block, offset, block_offset, limit){
    var containing_data = data;
    var end = containing_data.origin_fork +data.rules_ptr;
    while( ( containing_data.origin_fork >offset ) ) {
            end = containing_data.origin_fork;
            containing_data = containing_data.origin
        };
    var start = containing_data.origin_fork;
    offset  -= start;
    end  -= start;
    var ptr = offset;
    if( ( ptr >=end ) )return limit -block_offset;;
    while( ( block_offset <limit ) ) {
            block[block_offset ++] = containing_data.rules[ptr ++];
            if( ( ptr >=end ) )return block64Consume( data, block, ptr  + start, block_offset, limit );
        };
    return 0
}
function get_next_command_block(fork){
    var remainder = block64Consume( data_stack[fork.ptr], fork.command_block, fork.command_offset, 0, 64 );
    fork.command_offset  += 64 - remainder;
    if( ( remainder >0 ) )fork.command_block[64 - remainder] = 0;;
    return fork.command_block
}
function recognizer(data, input_byte_length, production){
    data.input_len = input_byte_length;
    data.lexer.next( data );
    dispatch( data, production );
    run( data )
}
function branch_0356fba5a2048e8e(l, data, state, prod, puid){
    puid |=1;
    pushFN( data, branch_c87f7ff160b07dfe );
    pushFN( data, $default_productions__string );
    return puid
}
function branch_04e73647ea79fece(l, data, state, prod, puid){
    pushFN( data, $default_productions__js_id_symbols_goto );
    return 9
}
function branch_057a75aa199702ae(l, data, state, prod, puid){
    return 0
}
function branch_08b1c55dbc43c34a(l, data, state, prod, puid){
    return 14
}
function branch_096c2a72305a0df6(l, data, state, prod, puid){
    return 3
}
function branch_0ad1e6a5a87f13a2(l, data, state, prod, puid){
    return 4
}
function branch_0e62af7fb471140d(l, data, state, prod, puid){
    puid |=32;
    consume( l, data, state );
    puid  |= 64;
    if( ( ( ( l.isSP( true, data ) )&&consume( l, data, state ) ) ) ){
        add_reduce( state, data, 2, 8 );
        return prod
    }
}
function branch_149c2f5c6c6b23ab(l, data, state, prod, puid){
    '"-------------INDIRECT-------------------"';
    pushFN( data, $default_productions__string_token_goto );
    return 11
}
function branch_1814f5f1aa277ddf(l, data, state, prod, puid){
    add_reduce( state, data, 2, 7 );
    return prod
}
function branch_21216942ec5e27b8(l, data, state, prod, puid){
    add_reduce( state, data, 3, 2 );
    return 3
}
function branch_25109eca79eb5cad(l, data, state, prod, puid){
    add_reduce( state, data, 1, 16 );
    pushFN( data, $args_group_0_0__list_0_goto );
    return 16
}
function branch_281211993c7e1b75(l, data, state, prod, puid){
    puid |=1;
    consume( l, data, state );
    add_reduce( state, data, 2, 7 );
    return prod
}
function branch_2865e3977f1719b6(l, data, state, prod, puid){
    add_reduce( state, data, 1, 6 );
    return 5
}
function branch_2901b52e2521b827(l, data, state, prod, puid){
    puid |=1;
    consume( l, data, state );
    puid  |= 2;
    pushFN( data, branch_48aa55b18aa2a236 );
    pushFN( data, $default_productions__string_token );
    return puid
}
function branch_2a7bb3a5a2863aa2(l, data, state, prod, puid){
    puid |=4;
    consume( l, data, state );
    puid  |= 2;
    pushFN( data, branch_5d04c4268c1e7bdd );
    pushFN( data, $default_productions__string_token );
    return puid
}
function branch_2c2c0de56372a037(l, data, state, prod, puid){
    add_reduce( state, data, 3, 2 );
    return prod
}
function branch_36888232e35300e0(l, data, state, prod, puid){
    puid |=4;
    pushFN( data, branch_2c2c0de56372a037 );
    pushFN( data, $arg_initials_group_2_0_ );
    return puid
}
function branch_3710d0ab2756e52d(l, data, state, prod, puid){
    puid |=4;
    consume( l, data, state );
    add_reduce( state, data, 1, 10 );
    return prod
}
function branch_3824178b99f2c682(l, data, state, prod, puid){
    return 6
}
function branch_3f6db385f45324d1(l, data, state, prod, puid){
    add_reduce( state, data, 1, 10 );
    pushFN( data, $default_productions__string_token_goto );
    return 11
}
function branch_48aa55b18aa2a236(l, data, state, prod, puid){
    skip_d4bd762c514693b7( l/*[ ws ]*/, data, state );
    puid  |= 1;
    if( ( ( ( l.current_byte ==34 )&&consume( l, data, state ) ) ) ){
        add_reduce( state, data, 3, 9 );
        return prod
    }
}
function branch_4f4396ac766faa55(l, data, state, prod, puid){
    puid |=64;
    consume( l, data, state );
    add_reduce( state, data, 3, 7 );
    return prod
}
function branch_54c2f2072553d6bd(l, data, state, prod, puid){
    add_reduce( state, data, 3, 4 );
    return prod
}
function branch_581367b6e15dde12(l, data, state, prod, puid){
    skip_d4bd762c514693b7( l/*[ ws ]*/, data, state );
    if( ( sym_map_13d6153cb43b3c82( l, data )==1 ) ){
        if( ( sym_map_50ad0f3e75423fc9( l, data )==1 ) ){
            add_reduce( state, data, 2, 3 );
            return 3
        }
    } else if( ( assert_ascii( l, 0x0, 0x20000084, 0x0, 0x0 )||l.isUniID( data )||l.isNum( data )||l.isSym( true, data ) ) ){
        pushFN( data, branch_096c2a72305a0df6 );
        return branch_36888232e35300e0( l, data, state, prod, 2 )
    }
}
function branch_5d04c4268c1e7bdd(l, data, state, prod, puid){
    skip_d4bd762c514693b7( l/*[ ws ]*/, data, state );
    puid  |= 4;
    if( ( ( ( l.current_byte ==39 )&&consume( l, data, state ) ) ) ){
        add_reduce( state, data, 3, 9 );
        return prod
    }
}
function branch_5e4a22deb529ce66(l, data, state, prod, puid){
    puid |=1;
    consume( l, data, state );
    skip_d4bd762c514693b7( l/*[ ws ]*/, data, state );
    puid  |= 2;
    pushFN( data, branch_64353b1b8fafd369 );
    pushFN( data, $val );
    return puid
}
function branch_5e9e2918be2ae5dc(l, data, state, prod, puid){
    return 7
}
function branch_600f3867b8c7fa88(l, data, state, prod, puid){
    add_reduce( state, data, 1, 1 );
    return 1
}
function branch_64353b1b8fafd369(l, data, state, prod, puid){
    add_reduce( state, data, 2, 14 );
    return prod
}
function branch_6ac1bf37076b5eba(l, data, state, prod, puid){
    puid |=8;
    consume( l, data, state );
    add_reduce( state, data, 1, 10 );
    return prod
}
function branch_6fa5324a654a2147(l, data, state, prod, puid){
    if( ( l.END( data ) ) ){
        pushFN( data, branch_5e9e2918be2ae5dc );
        return branch_93038eabf7da2d5e( l, data, state, prod, 4 )
    } else if( ( l.isSP( true, data ) ) ){
        pushFN( data, branch_5e9e2918be2ae5dc );
        return branch_4f4396ac766faa55( l, data, state, prod, 4 )
    }
}
function branch_74b2b31ef7f339b6(l, data, state, prod, puid){
    puid |=2;
    consume( l, data, state );
    puid  |= 64;
    if( ( ( ( l.isSP( true, data ) )&&consume( l, data, state ) ) ) ){
        add_reduce( state, data, 2, 8 );
        return prod
    }
}
function branch_783ea69d609b3f74(l, data, state, prod, puid){
    '"-------------INDIRECT-------------------"';
    pushFN( data, $val_list_1_goto );
    return 15
}
function branch_7a91bf042d9062e9(l, data, state, prod, puid){
    puid |=16;
    consume( l, data, state );
    skip_d4bd762c514693b7( l/*[ ws ]*/, data, state );
    puid  |= 8;
    if( ( ( ( l.END( data ) )&&consume( l, data, state ) ) ) ){
        add_reduce( state, data, 2, 8 );
        return prod
    }
}
function branch_89ffd58318273ba6(l, data, state, prod, puid){
    '"-------------INDIRECT-------------------"';
    pushFN( data, $args_group_0_0__list_0_goto );
    return 16
}
function branch_8d9df987b86a8587(l, data, state, prod, puid){
    add_reduce( state, data, 2, 17 );
    return prod
}
function branch_90fc2b73b49088ce(l, data, state, prod, puid){
    puid |=8;
    consume( l, data, state );
    return prod
}
function branch_93038eabf7da2d5e(l, data, state, prod, puid){
    puid |=8;
    consume( l, data, state );
    add_reduce( state, data, 3, 7 );
    return prod
}
function branch_97d546b3446dcbb8(l, data, state, prod, puid){
    puid |=4;
    consume( l, data, state );
    return prod
}
function branch_9a6f2084257d78a1(l, data, state, prod, puid){
    puid |=1;
    consume( l, data, state );
    add_reduce( state, data, 1, 10 );
    return prod
}
function branch_a22590ec25240743(l, data, state, prod, puid){
    puid |=16;
    consume( l, data, state );
    add_reduce( state, data, 2, 7 );
    return prod
}
function branch_a25b83c36b7add7b(l, data, state, prod, puid){
    puid |=2;
    consume( l, data, state );
    add_reduce( state, data, 2, 7 );
    return prod
}
function branch_a6f895bee949a22b(l, data, state, prod, puid){
    skip_d4bd762c514693b7( l/*[ ws ]*/, data, state );
    if( ( sym_map_13d6153cb43b3c82( l, data )==1 ) ){
        if( ( sym_map_50ad0f3e75423fc9( l, data )==1 ) ){
            add_reduce( state, data, 2, 5 );
            return 4
        }
    } else if( ( assert_ascii( l, 0x0, 0x20000084, 0x0, 0x0 )||l.isUniID( data )||l.isNum( data )||l.isSym( true, data ) ) ){
        pushFN( data, branch_0ad1e6a5a87f13a2 );
        return branch_c1a4fa666b9ae07d( l, data, state, prod, 2 )
    }
}
function branch_b43d464283be97f2(l, data, state, prod, puid){
    puid |=2;
    consume( l, data, state );
    return prod
}
function branch_b4be9c594153d66a(l, data, state, prod, puid){
    puid |=4;
    consume( l, data, state );
    add_reduce( state, data, 2, 7 );
    return prod
}
function branch_c0adf09f8cf4b2d3(l, data, state, prod, puid){
    '"-------------INDIRECT-------------------"';
    pushFN( data, $default_productions__js_id_symbols_goto );
    return 9
}
function branch_c1a4fa666b9ae07d(l, data, state, prod, puid){
    puid |=4;
    pushFN( data, branch_54c2f2072553d6bd );
    pushFN( data, $arg_initials_group_2_0_ );
    return puid
}
function branch_c7ffadaa2b6a73a7(l, data, state, prod, puid){
    return 10
}
function branch_c87f7ff160b07dfe(l, data, state, prod, puid){
    return prod
}
function branch_cc1fa0f935a4b2a7(l, data, state, prod, puid){
    return 2
}
function branch_cfcf9dd78812b64e(l, data, state, prod, puid){
    puid |=1;
    pushFN( data, branch_1814f5f1aa277ddf );
    pushFN( data, $default_productions__string_value );
    return puid
}
function branch_d36e5b6f625cb4e9(l, data, state, prod, puid){
    puid |=16;
    consume( l, data, state );
    puid  |= 64;
    if( ( ( ( l.isSP( true, data ) )&&consume( l, data, state ) ) ) ){
        add_reduce( state, data, 2, 8 );
        return prod
    }
}
function branch_d68374c2f0a3324c(l, data, state, prod, puid){
    puid |=2;
    consume( l, data, state );
    skip_d4bd762c514693b7( l/*[ ws ]*/, data, state );
    puid  |= 8;
    if( ( ( ( l.END( data ) )&&consume( l, data, state ) ) ) ){
        add_reduce( state, data, 2, 8 );
        return prod
    }
}
function branch_e112493ba3c39913(l, data, state, prod, puid){
    puid |=1;
    pushFN( data, branch_8d9df987b86a8587 );
    pushFN( data, $arg );
    return puid
}
function branch_e42800f38ed25c54(l, data, state, prod, puid){
    add_reduce( state, data, 3, 4 );
    return 4
}
function branch_ed71b24da95d00cf(l, data, state, prod, puid){
    puid |=32;
    consume( l, data, state );
    skip_d4bd762c514693b7( l/*[ ws ]*/, data, state );
    puid  |= 8;
    if( ( ( ( l.END( data ) )&&consume( l, data, state ) ) ) ){
        add_reduce( state, data, 2, 8 );
        return prod
    }
}
function branch_edc46cfe2f2f664d(l, data, state, prod, puid){
    puid |=8;
    consume( l, data, state );
    add_reduce( state, data, 2, 7 );
    return prod
}
function branch_ee77d57dfde7356b(l, data, state, prod, puid){
    add_reduce( state, data, 1, 15 );
    return prod
}
function branch_f4d9c95abdde6fca(l, data, state, prod, puid){
    puid |=2;
    pushFN( data, branch_ee77d57dfde7356b );
    pushFN( data, $val );
    return puid
}
function branch_fac6f1f8dfe375e9(l, data, state, prod, puid){
    add_reduce( state, data, 1, 13 );
    return 13
}
function branch_fc85758b6191ce78(l, data, state, prod, puid){
    pushFN( data, $val_list_1_goto );
    return 15
}
function skip_d4bd762c514693b7(l, data, state){
    if( ( ( state )==NULL_STATE ) )return;;
    var off = l.token_offset;
    while( 1 ) {
            if( ( !( l.isSP( true, data ) ) ) ){
                break
            };
            l.next( data )
        };
    if( isOutputEnabled( state ) )add_skip( l, data, l.token_offset  - off );
}
function sym_map_13d6153cb43b3c82(l, data){
    if( data.input[l.byte_offset  + 0]==45 ){
        if( data.input[l.byte_offset  + 1]==45 ){
            l.setToken( TokenSymbol, 2, 2 );
            return 1
        };
        l.setToken( TokenSymbol, 1, 1 );
        return 1
    } else if( data.input[l.byte_offset  + 0]==61 ){
        l.setToken( TokenSymbol, 1, 1 );
        return 0
    } else if( data.input[l.byte_offset  + 0]==34 ){
        l.setToken( TokenSymbol, 1, 1 );
        return 0
    } else if( data.input[l.byte_offset  + 0]==39 ){
        l.setToken( TokenSymbol, 1, 1 );
        return 0
    };
    if( ( l.isSym( true, data ) ) ){
        return 0
    } else if( ( l.isNum( data ) ) ){
        return 0
    } else if( ( l.isUniID( data ) ) ){
        return 0
    };
    return 1
}
function sym_map_241caa7038281af6(l, data){
    ;if( ( l.isNL(  ) ) ){
        return 0
    } else if( ( l.isNum( data ) ) ){
        return 1
    } else if( ( l.isUniID( data ) ) ){
        return 2
    } else if( ( l.isSym( true, data ) ) ){
        return 3
    } else if( ( l.isSP( true, data ) ) ){
        return 4
    };
    return -1
}
function sym_map_284344e6e575ca3d(l, data){
    if( data.input[l.byte_offset  + 0]==92 ){
        l.setToken( TokenSymbol, 1, 1 );
        return 3
    };
    if( ( l.isNum( data ) ) ){
        return 0
    } else if( ( l.isUniID( data ) ) ){
        return 1
    } else if( ( l.isSP( true, data ) ) ){
        return 2
    } else if( ( l.isSym( true, data ) ) ){
        return 4
    };
    return -1
}
function sym_map_50ad0f3e75423fc9(l, data){
    if( data.input[l.byte_offset  + 0]==45 ){
        if( data.input[l.byte_offset  + 1]==45 ){
            l.setToken( TokenSymbol, 2, 2 );
            return 1;
            l.setToken( TokenSymbol, 2, 2 );
            return 1
        };
        l.setToken( TokenSymbol, 1, 1 );
        return 1;
        l.setToken( TokenSymbol, 1, 1 );
        return 1
    } else if( data.input[l.byte_offset  + 0]==34 ){
        l.setToken( TokenSymbol, 1, 1 );
        return 1;
        l.setToken( TokenSymbol, 1, 1 );
        return 1
    } else if( data.input[l.byte_offset  + 0]==39 ){
        l.setToken( TokenSymbol, 1, 1 );
        return 1;
        l.setToken( TokenSymbol, 1, 1 );
        return 1
    };
    if( ( l.END( data ) ) ){
        return 1
    } else if( ( l.isSym( true, data ) ) ){
        return 1
    } else if( ( l.isNum( data ) ) ){
        return 1
    } else if( ( l.isUniID( data ) ) ){
        return 1
    } else if( ( l.END( data ) ) ){
        return 1
    } else if( ( l.isSym( true, data ) ) ){
        return 1
    } else if( ( l.isNum( data ) ) ){
        return 1
    } else if( ( l.isUniID( data ) ) ){
        return 1
    };
    return 1
}
function sym_map_b2a984ed7d7011fe(l, data){
    if( data.input[l.byte_offset  + 0]==45 ){
        if( data.input[l.byte_offset  + 1]==45 ){
            l.setToken( TokenSymbol, 2, 2 );
            return 1
        };
        l.setToken( TokenSymbol, 1, 1 );
        return 1
    } else if( data.input[l.byte_offset  + 0]==34 ){
        l.setToken( TokenSymbol, 1, 1 );
        return 1
    } else if( data.input[l.byte_offset  + 0]==39 ){
        l.setToken( TokenSymbol, 1, 1 );
        return 1
    };
    if( ( l.isSym( true, data ) ) ){
        return 1
    } else if( ( l.isNum( data ) ) ){
        return 1
    } else if( ( l.isUniID( data ) ) ){
        return 1
    };
    l.setToken( TokenSymbol, 0, 0 );
    return 0
}
function sym_map_f9a873d3548d2061(l, data){
    if( data.input[l.byte_offset  + 0]==45 ){
        if( data.input[l.byte_offset  + 1]==45 ){
            l.setToken( TokenSymbol, 2, 2 );
            return 1
        };
        l.setToken( TokenSymbol, 1, 1 );
        return 0
    } else if( data.input[l.byte_offset  + 0]==34 ){
        l.setToken( TokenSymbol, 1, 1 );
        return 2
    } else if( data.input[l.byte_offset  + 0]==39 ){
        l.setToken( TokenSymbol, 1, 1 );
        return 2
    };
    if( ( l.isSym( true, data ) ) ){
        return 2
    } else if( ( l.isNum( data ) ) ){
        return 2
    } else if( ( l.isUniID( data ) ) ){
        return 2
    };
    return -1
}
function tk_bf3fcd3e3870b531(l, data){
    if( l.current_byte ==95||l.current_byte  == 36 || l.isUniID( data ) ){
        var stack_ptr = data.stack_ptr;
        var input_ptr = data.input_ptr;
        var state = data.state;
        var copy = l.copy(  );
        pushFN( data, $default_productions__js_id_symbols );
        data.state = NULL_STATE;
        var ACTIVE = true;
        while( ( ACTIVE ) ) {
                ACTIVE = stepKernel( data, stack_ptr  + 1 )
            };
        data.state = state;
        if( data.prod ==9 ){
            data.stack_ptr = stack_ptr;
            data.input_ptr = input_ptr;
            l.slice( copy );
            return true
        } else {
            l.sync( copy );
            data.stack_ptr = stack_ptr;
            data.input_ptr = input_ptr;
            return false
        }
    };
    return false
}
function $start(l, data, state, prod, puid){
    puid |=1;
    pushFN( data, branch_057a75aa199702ae );
    pushFN( data, $args );
    return puid;
    return -1
}
function $start_reducer(l, data, state, prod, puid){
    return 0

}
function $args(l, data, state, prod, puid){
    puid |=1;
    pushFN( data, branch_600f3867b8c7fa88 );
    pushFN( data, $args_group_0_0_ );
    return puid;
    return -1
}
function $args_reducer(l, data, state, prod, puid){
    if( 1==puid ){
        add_reduce( state, data, 1, 1 )
    };
    return 1

}
function $arg(l, data, state, prod, puid){
    switch(sym_map_f9a873d3548d2061( l, data )){
        case 0: 
        {
            puid |=1;
            pushFN( data, branch_cc1fa0f935a4b2a7 );
            pushFN( data, $arg_initials );
            return puid
        }
        case 1: 
        {
            puid |=2;
            pushFN( data, branch_cc1fa0f935a4b2a7 );
            pushFN( data, $arg_key_val );
            return puid
        }
        case 2: 
        {
            puid |=4;
            pushFN( data, branch_cc1fa0f935a4b2a7 );
            pushFN( data, $naked_arg );
            return puid
        }
        default: 
        break
    };
    return -1
}
function $arg_reducer(l, data, state, prod, puid){
    return 2

}
function $arg_initials(l, data, state, prod, puid){
    if( ( l.current_byte ==45 ) ){
        consume( l, data, state );
        puid  |= 1;
        skip_d4bd762c514693b7( l/*[ ws ]*/, data, state );
        pushFN( data, branch_581367b6e15dde12 );
        pushFN( data, $default_productions__js_identifier );
        puid  |= 2;
        return puid
    };
    return -1
}
function $arg_initials_reducer(l, data, state, prod, puid){
    if( 7==puid ){
        add_reduce( state, data, 3, 2 )
    } else if( 3==puid ){
        add_reduce( state, data, 2, 3 )
    } else if( 3==puid ){
        add_reduce( state, data, 2, 3 )
    };
    return 3

}
function $arg_key_val(l, data, state, prod, puid){
    if( ( cmpr_set( l, data, 0, 2, 2 ) ) ){
        consume( l, data, state );
        puid  |= 1;
        skip_d4bd762c514693b7( l/*[ ws ]*/, data, state );
        pushFN( data, branch_a6f895bee949a22b );
        pushFN( data, $key );
        puid  |= 2;
        return puid
    };
    return -1
}
function $arg_key_val_reducer(l, data, state, prod, puid){
    if( 7==puid ){
        add_reduce( state, data, 3, 4 )
    } else if( 3==puid ){
        add_reduce( state, data, 2, 5 )
    } else if( 3==puid ){
        add_reduce( state, data, 2, 5 )
    };
    return 4

}
function $naked_arg(l, data, state, prod, puid){
    puid |=1;
    pushFN( data, branch_2865e3977f1719b6 );
    pushFN( data, $val );
    return puid;
    return -1
}
function $naked_arg_reducer(l, data, state, prod, puid){
    if( 1==puid ){
        add_reduce( state, data, 1, 6 )
    };
    return 5

}
function $key(l, data, state, prod, puid){
    puid |=1;
    pushFN( data, branch_3824178b99f2c682 );
    pushFN( data, $default_productions__js_identifier );
    return puid;
    return -1
}
function $key_reducer(l, data, state, prod, puid){
    return 6

}
function $val(l, data, state, prod, puid){
    if( ( l.current_byte ==34||l.current_byte  == 39 ) ){
        pushFN( data, branch_5e9e2918be2ae5dc );
        return branch_0356fba5a2048e8e( l, data, state, prod, 1 )
    } else if( ( l.isSym( true, data ) ) ){
        var pk = l.copy(  );
        pk.next( data );
        if( ( pk.isUniID( data )||pk.isNum( data )||pk.isSym( true, data ) ) ){
            consume( l, data, state );
            puid  |= 2;
            '"-"';
            skip_d4bd762c514693b7( l/*[ ws ]*/, data, state );
            pushFN( data, branch_6fa5324a654a2147 );
            pushFN( data, $val_list_1 );
            puid  |= 4;
            return puid
        } else if( ( pk.END( data ) ) ){
            pushFN( data, branch_5e9e2918be2ae5dc );
            return branch_d68374c2f0a3324c( l, data, state, prod, 2 )
        } else if( ( pk.isSP( true, data ) ) ){
            pushFN( data, branch_5e9e2918be2ae5dc );
            return branch_74b2b31ef7f339b6( l, data, state, prod, 2 )
        }
    } else if( ( l.isNum( data ) ) ){
        var pk = l.copy(  );
        pk.next( data );
        if( ( pk.isUniID( data )||pk.isNum( data )||pk.isSym( true, data ) ) ){
            consume( l, data, state );
            puid  |= 16;
            '"-"';
            skip_d4bd762c514693b7( l/*[ ws ]*/, data, state );
            pushFN( data, branch_6fa5324a654a2147 );
            pushFN( data, $val_list_1 );
            puid  |= 4;
            return puid
        } else if( ( pk.END( data ) ) ){
            pushFN( data, branch_5e9e2918be2ae5dc );
            return branch_7a91bf042d9062e9( l, data, state, prod, 16 )
        } else if( ( pk.isSP( true, data ) ) ){
            pushFN( data, branch_5e9e2918be2ae5dc );
            return branch_d36e5b6f625cb4e9( l, data, state, prod, 16 )
        }
    } else if( ( l.isUniID( data ) ) ){
        var pk = l.copy(  );
        pk.next( data );
        if( ( pk.isUniID( data )||pk.isNum( data )||pk.isSym( true, data ) ) ){
            consume( l, data, state );
            puid  |= 32;
            '"-"';
            skip_d4bd762c514693b7( l/*[ ws ]*/, data, state );
            pushFN( data, branch_6fa5324a654a2147 );
            pushFN( data, $val_list_1 );
            puid  |= 4;
            return puid
        } else if( ( pk.END( data ) ) ){
            pushFN( data, branch_5e9e2918be2ae5dc );
            return branch_ed71b24da95d00cf( l, data, state, prod, 32 )
        } else if( ( pk.isSP( true, data ) ) ){
            pushFN( data, branch_5e9e2918be2ae5dc );
            return branch_0e62af7fb471140d( l, data, state, prod, 32 )
        }
    };
    return -1
}
function $val_reducer(l, data, state, prod, puid){
    if( 14==puid ){
        add_reduce( state, data, 3, 7 )
    } else if( 28==puid ){
        add_reduce( state, data, 3, 7 )
    } else if( 44==puid ){
        add_reduce( state, data, 3, 7 )
    } else if( 70==puid ){
        add_reduce( state, data, 3, 7 )
    } else if( 84==puid ){
        add_reduce( state, data, 3, 7 )
    } else if( 100==puid ){
        add_reduce( state, data, 3, 7 )
    } else if( 10==puid ){
        add_reduce( state, data, 2, 8 )
    } else if( 24==puid ){
        add_reduce( state, data, 2, 8 )
    } else if( 40==puid ){
        add_reduce( state, data, 2, 8 )
    } else if( 66==puid ){
        add_reduce( state, data, 2, 8 )
    } else if( 80==puid ){
        add_reduce( state, data, 2, 8 )
    } else if( 96==puid ){
        add_reduce( state, data, 2, 8 )
    };
    return 7

}
function $default_productions__js_identifier(l, data, state, prod, puid){
    if( ( tk_bf3fcd3e3870b531( l, data ) ) ){
        consume( l, data, state );
        puid  |= 1;
        return 8
    };
    return -1
}
function $default_productions__js_identifier_reducer(l, data, state, prod, puid){
    return 8

}
function $default_productions__js_id_symbols(l, data, state, prod, puid){
    if( ( l.isUniID( data ) ) ){
        pushFN( data, branch_04e73647ea79fece );
        return branch_b43d464283be97f2( l, data, state, prod, 2 )
    } else if( ( l.current_byte ==95 ) ){
        pushFN( data, branch_04e73647ea79fece );
        return branch_97d546b3446dcbb8( l, data, state, prod, 4 )
    } else if( ( l.current_byte ==36 ) ){
        pushFN( data, branch_04e73647ea79fece );
        return branch_90fc2b73b49088ce( l, data, state, prod, 8 )
    };
    return -1
}
function $default_productions__js_id_symbols_goto(l, data, state, prod, puid){
    while( 1 ) {
            switch(prod){
                case 9: 
                {
                    skip_d4bd762c514693b7( l/*[ ws ]*/, data, state );
                    if( ( l.isUniID( data ) ) ){
                        var pk = l.copy(  );
                        skip_d4bd762c514693b7( pk.next( data ), data, STATE_ALLOW_SKIP );
                        if( ( cmpr_set( pk, data, 0, 2, 2 )||assert_ascii( pk, 0x0, 0x20002094, 0x80000000, 0x0 )||pk.isUniID( data )||pk.isNum( data )||pk.isSym( true, data ) ) ){
                            pushFN( data, branch_c0adf09f8cf4b2d3 );
                            return branch_a25b83c36b7add7b( l, data, state, prod, 1 )
                        }
                    } else if( ( l.isNum( data ) ) ){
                        var pk = l.copy(  );
                        skip_d4bd762c514693b7( pk.next( data ), data, STATE_ALLOW_SKIP );
                        if( ( cmpr_set( pk, data, 0, 2, 2 )||assert_ascii( pk, 0x0, 0x20002094, 0x80000000, 0x0 )||pk.isUniID( data )||pk.isNum( data )||pk.isSym( true, data ) ) ){
                            pushFN( data, branch_c0adf09f8cf4b2d3 );
                            return branch_a22590ec25240743( l, data, state, prod, 1 )
                        }
                    } else if( ( l.current_byte ==95 ) ){
                        pushFN( data, branch_c0adf09f8cf4b2d3 );
                        return branch_b4be9c594153d66a( l, data, state, prod, 1 )
                    } else if( ( l.current_byte ==36 ) ){
                        pushFN( data, branch_c0adf09f8cf4b2d3 );
                        return branch_edc46cfe2f2f664d( l, data, state, prod, 1 )
                    }
                }
            };
            break
        };
    return ( prod ==9 )?prod :1
}
function $default_productions__js_id_symbols_reducer(l, data, state, prod, puid){
    if( 3==puid ){
        add_reduce( state, data, 2, 7 )
    } else if( 5==puid ){
        add_reduce( state, data, 2, 7 )
    } else if( 9==puid ){
        add_reduce( state, data, 2, 7 )
    } else if( 17==puid ){
        add_reduce( state, data, 2, 7 )
    };
    return 9

}
function $default_productions__string(l, data, state, prod, puid){
    if( ( l.current_byte ==34 ) ){
        pushFN( data, branch_c7ffadaa2b6a73a7 );
        return branch_2901b52e2521b827( l, data, state, prod, 1 )
    } else if( ( l.current_byte ==39 ) ){
        pushFN( data, branch_c7ffadaa2b6a73a7 );
        return branch_2a7bb3a5a2863aa2( l, data, state, prod, 4 )
    };
    return -1
}
function $default_productions__string_reducer(l, data, state, prod, puid){
    if( 3==puid ){
        add_reduce( state, data, 3, 9 )
    } else if( 6==puid ){
        add_reduce( state, data, 3, 9 )
    };
    return 10

}
function $default_productions__string_token(l, data, state, prod, puid){
    puid |=1;
    pushFN( data, branch_3f6db385f45324d1 );
    pushFN( data, $default_productions__string_value );
    return puid;
    return -1
}
function $default_productions__string_token_goto(l, data, state, prod, puid){
    if( ( l.current_byte ==34||l.current_byte  == 39 ) )return 11;;
    if( ( l.current_byte ==92||l.isUniID( data ) || l.isNum( data ) || l.isSym( true, data ) || l.isSP( true, data ) ) ){
        pushFN( data, branch_149c2f5c6c6b23ab );
        return branch_cfcf9dd78812b64e( l, data, state, prod, 2 )
    };
    return ( prod ==11 )?prod :1
}
function $default_productions__string_token_reducer(l, data, state, prod, puid){
    if( 1==puid ){
        add_reduce( state, data, 1, 10 )
    } else if( 3==puid ){
        add_reduce( state, data, 2, 7 )
    };
    return 11

}
function $default_productions__string_value(l, data, state, prod, puid){
    switch(sym_map_284344e6e575ca3d( l, data )){
        case 0: 
        {
            puid |=8;
            consume( l, data, state );
            add_reduce( state, data, 1, 10 );
            pushFN( data, $default_productions__string_value_goto );
            return 12
        }
        case 1: 
        {
            puid |=16;
            consume( l, data, state );
            add_reduce( state, data, 1, 10 );
            pushFN( data, $default_productions__string_value_goto );
            return 12
        }
        case 2: 
        {
            puid |=64;
            consume( l, data, state );
            add_reduce( state, data, 1, 10 );
            pushFN( data, $default_productions__string_value_goto );
            return 12
        }
        case 3: 
        {
            var pk = l.copy(  );
            pk.next( data );
            switch(sym_map_241caa7038281af6( pk, data )){
                case 0: 
                {
                    puid |=1;
                    consume( l, data, state );
                    skip_d4bd762c514693b7( l/*[ ws ]*/, data, state );
                    puid  |= 2;
                    if( ( ( ( l.isNL(  ) )&&consume( l, data, state ) ) ) ){
                        add_reduce( state, data, 2, 11 );
                        pushFN( data, $default_productions__string_value_goto );
                        return 12
                    }
                }
                case 1: 
                {
                    puid |=1;
                    consume( l, data, state );
                    skip_d4bd762c514693b7( l/*[ ws ]*/, data, state );
                    puid  |= 8;
                    if( ( ( ( l.isNum( data ) )&&consume( l, data, state ) ) ) ){
                        add_reduce( state, data, 2, 11 );
                        pushFN( data, $default_productions__string_value_goto );
                        return 12
                    }
                }
                case 2: 
                {
                    puid |=1;
                    consume( l, data, state );
                    skip_d4bd762c514693b7( l/*[ ws ]*/, data, state );
                    puid  |= 16;
                    if( ( ( ( l.isUniID( data ) )&&consume( l, data, state ) ) ) ){
                        add_reduce( state, data, 2, 11 );
                        pushFN( data, $default_productions__string_value_goto );
                        return 12
                    }
                }
                case 3: 
                {
                    puid |=1;
                    consume( l, data, state );
                    skip_d4bd762c514693b7( l/*[ ws ]*/, data, state );
                    puid  |= 32;
                    if( ( ( ( l.isSym( true, data ) )&&consume( l, data, state ) ) ) ){
                        add_reduce( state, data, 2, 11 );
                        pushFN( data, $default_productions__string_value_goto );
                        return 12
                    }
                }
                case 4: 
                {
                    puid |=1;
                    consume( l, data, state );
                    puid  |= 64;
                    if( ( ( ( l.isSP( true, data ) )&&consume( l, data, state ) ) ) ){
                        add_reduce( state, data, 2, 11 );
                        pushFN( data, $default_productions__string_value_goto );
                        return 12
                    }
                }
                default: 
                break
            }
        }
        case 4: 
        {
            puid |=32;
            consume( l, data, state );
            add_reduce( state, data, 1, 10 );
            pushFN( data, $default_productions__string_value_goto );
            return 12
        }
        default: 
        break
    };
    return -1
}
function $default_productions__string_value_goto(l, data, state, prod, puid){
    while( 1 ) {
            switch(prod){
                case 12: 
                {
                    if( ( l.current_byte ==34||l.current_byte  == 39 ) )return 12;;
                    switch(sym_map_284344e6e575ca3d( l, data )){
                        case 0: 
                        {
                            puid |=8;
                            consume( l, data, state );
                            add_reduce( state, data, 2, 7 );
                            pushFN( data, $default_productions__string_value_goto );
                            return 12
                        }
                        case 1: 
                        {
                            puid |=16;
                            consume( l, data, state );
                            add_reduce( state, data, 2, 7 );
                            pushFN( data, $default_productions__string_value_goto );
                            return 12
                        }
                        case 2: 
                        {
                            puid |=64;
                            consume( l, data, state );
                            add_reduce( state, data, 2, 7 );
                            pushFN( data, $default_productions__string_value_goto );
                            return 12
                        }
                        case 3: 
                        {
                            var pk = l.copy(  );
                            pk.next( data );
                            switch(sym_map_241caa7038281af6( pk, data )){
                                case 0: 
                                {
                                    puid |=1;
                                    consume( l, data, state );
                                    skip_d4bd762c514693b7( l/*[ ws ]*/, data, state );
                                    puid  |= 2;
                                    if( ( ( ( l.isNL(  ) )&&consume( l, data, state ) ) ) ){
                                        add_reduce( state, data, 3, 12 );
                                        pushFN( data, $default_productions__string_value_goto );
                                        return 12
                                    }
                                }
                                case 1: 
                                {
                                    puid |=1;
                                    consume( l, data, state );
                                    skip_d4bd762c514693b7( l/*[ ws ]*/, data, state );
                                    puid  |= 8;
                                    if( ( ( ( l.isNum( data ) )&&consume( l, data, state ) ) ) ){
                                        add_reduce( state, data, 3, 12 );
                                        pushFN( data, $default_productions__string_value_goto );
                                        return 12
                                    }
                                }
                                case 2: 
                                {
                                    puid |=1;
                                    consume( l, data, state );
                                    skip_d4bd762c514693b7( l/*[ ws ]*/, data, state );
                                    puid  |= 16;
                                    if( ( ( ( l.isUniID( data ) )&&consume( l, data, state ) ) ) ){
                                        add_reduce( state, data, 3, 12 );
                                        pushFN( data, $default_productions__string_value_goto );
                                        return 12
                                    }
                                }
                                case 3: 
                                {
                                    puid |=1;
                                    consume( l, data, state );
                                    skip_d4bd762c514693b7( l/*[ ws ]*/, data, state );
                                    puid  |= 32;
                                    if( ( ( ( l.isSym( true, data ) )&&consume( l, data, state ) ) ) ){
                                        add_reduce( state, data, 3, 12 );
                                        pushFN( data, $default_productions__string_value_goto );
                                        return 12
                                    }
                                }
                                case 4: 
                                {
                                    puid |=1;
                                    consume( l, data, state );
                                    puid  |= 64;
                                    if( ( ( ( l.isSP( true, data ) )&&consume( l, data, state ) ) ) ){
                                        add_reduce( state, data, 3, 12 );
                                        pushFN( data, $default_productions__string_value_goto );
                                        return 12
                                    }
                                }
                                default: 
                                break
                            }
                        }
                        case 4: 
                        {
                            puid |=32;
                            consume( l, data, state );
                            add_reduce( state, data, 2, 7 );
                            pushFN( data, $default_productions__string_value_goto );
                            return 12
                        }
                        default: 
                        break
                    }
                }
            };
            break
        };
    return ( prod ==12 )?prod :1
}
function $default_productions__string_value_reducer(l, data, state, prod, puid){
    if( 3==puid ){
        add_reduce( state, data, 2, 11 )
    } else if( 7==puid ){
        add_reduce( state, data, 3, 12 )
    } else if( 8==puid ){
        add_reduce( state, data, 1, 10 )
    } else if( 16==puid ){
        add_reduce( state, data, 1, 10 )
    } else if( 32==puid ){
        add_reduce( state, data, 1, 10 )
    } else if( 64==puid ){
        add_reduce( state, data, 1, 10 )
    } else if( 9==puid ){
        add_reduce( state, data, 2, 11 )
    } else if( 17==puid ){
        add_reduce( state, data, 2, 11 )
    } else if( 33==puid ){
        add_reduce( state, data, 2, 11 )
    } else if( 65==puid ){
        add_reduce( state, data, 2, 11 )
    } else if( 12==puid ){
        add_reduce( state, data, 2, 7 )
    } else if( 20==puid ){
        add_reduce( state, data, 2, 7 )
    } else if( 36==puid ){
        add_reduce( state, data, 2, 7 )
    } else if( 68==puid ){
        add_reduce( state, data, 2, 7 )
    } else if( 13==puid ){
        add_reduce( state, data, 3, 12 )
    } else if( 21==puid ){
        add_reduce( state, data, 3, 12 )
    } else if( 37==puid ){
        add_reduce( state, data, 3, 12 )
    } else if( 69==puid ){
        add_reduce( state, data, 3, 12 )
    };
    return 12

}
function $args_group_0_0_(l, data, state, prod, puid){
    switch(sym_map_b2a984ed7d7011fe( l, data )){
        case 0: 
        {
            puid |=2;
            consume( l, data, state );
            return 13
        }
        case 1: 
        {
            puid |=1;
            pushFN( data, branch_fac6f1f8dfe375e9 );
            pushFN( data, $args_group_0_0__list_0 );
            return puid
        }
        default: 
        break
    };
    return -1
}
function $args_group_0_0__reducer(l, data, state, prod, puid){
    if( 1==puid ){
        add_reduce( state, data, 1, 13 )
    };
    return 13

}
function $arg_initials_group_2_0_(l, data, state, prod, puid){
    if( ( l.current_byte ==61 ) ){
        pushFN( data, branch_08b1c55dbc43c34a );
        return branch_5e4a22deb529ce66( l, data, state, prod, 1 )
    } else if( ( l.current_byte ==34||l.current_byte  == 39 || l.isUniID( data ) || l.isNum( data ) || l.isSym( true, data ) ) ){
        pushFN( data, branch_08b1c55dbc43c34a );
        return branch_f4d9c95abdde6fca( l, data, state, prod, 2 )
    };
    return -1
}
function $arg_initials_group_2_0__reducer(l, data, state, prod, puid){
    if( 3==puid ){
        add_reduce( state, data, 2, 14 )
    } else if( 2==puid ){
        add_reduce( state, data, 1, 15 )
    };
    return 14

}
function $val_list_1(l, data, state, prod, puid){
    if( ( l.isSym( true, data ) ) ){
        pushFN( data, branch_fc85758b6191ce78 );
        return branch_9a6f2084257d78a1( l, data, state, prod, 1 )
    } else if( ( l.isNum( data ) ) ){
        pushFN( data, branch_fc85758b6191ce78 );
        return branch_3710d0ab2756e52d( l, data, state, prod, 4 )
    } else if( ( l.isUniID( data ) ) ){
        pushFN( data, branch_fc85758b6191ce78 );
        return branch_6ac1bf37076b5eba( l, data, state, prod, 8 )
    };
    return -1
}
function $val_list_1_goto(l, data, state, prod, puid){
    if( ( l.isSP( true, data ) ) )return 15;;
    if( ( l.isSym( true, data ) ) ){
        pushFN( data, branch_783ea69d609b3f74 );
        return branch_281211993c7e1b75( l, data, state, prod, 2 )
    } else if( ( l.isNum( data ) ) ){
        pushFN( data, branch_783ea69d609b3f74 );
        return branch_b4be9c594153d66a( l, data, state, prod, 2 )
    } else if( ( l.isUniID( data ) ) ){
        pushFN( data, branch_783ea69d609b3f74 );
        return branch_edc46cfe2f2f664d( l, data, state, prod, 2 )
    };
    return ( prod ==15 )?prod :1
}
function $val_list_1_reducer(l, data, state, prod, puid){
    if( 1==puid ){
        add_reduce( state, data, 1, 10 )
    } else if( 3==puid ){
        add_reduce( state, data, 2, 7 )
    } else if( 4==puid ){
        add_reduce( state, data, 1, 10 )
    } else if( 8==puid ){
        add_reduce( state, data, 1, 10 )
    } else if( 6==puid ){
        add_reduce( state, data, 2, 7 )
    } else if( 10==puid ){
        add_reduce( state, data, 2, 7 )
    };
    return 15

}
function $args_group_0_0__list_0(l, data, state, prod, puid){
    puid |=1;
    pushFN( data, branch_25109eca79eb5cad );
    pushFN( data, $arg );
    return puid;
    return -1
}
function $args_group_0_0__list_0_goto(l, data, state, prod, puid){
    while( 1 ) {
            switch(prod){
                case 16: 
                {
                    skip_d4bd762c514693b7( l/*[ ws ]*/, data, state );
                    if( ( cmpr_set( l, data, 0, 2, 2 )||assert_ascii( l, 0x0, 0x2084, 0x0, 0x0 )||l.isUniID( data )||l.isNum( data )||l.isSym( true, data ) ) ){
                        pushFN( data, branch_89ffd58318273ba6 );
                        return branch_e112493ba3c39913( l, data, state, prod, 2 )
                    }
                }
            };
            break
        };
    return ( prod ==16 )?prod :1
}
function $args_group_0_0__list_0_reducer(l, data, state, prod, puid){
    if( 1==puid ){
        add_reduce( state, data, 1, 16 )
    } else if( 3==puid ){
        add_reduce( state, data, 2, 17 )
    };
    return 16

}
function dispatch(data, production_index){
    switch(production_index ){
        case 0: 
        {
            skip_d4bd762c514693b7( data.lexer/*[ ws ]*/, data, 16777215 );
            data.stack[0] = $start;
            data.stash[0] = 0;
            return
        }
        case 1: 
        {
            skip_d4bd762c514693b7( data.lexer/*[ ws ]*/, data, 16777215 );
            data.stack[0] = $args;
            data.stash[0] = 0;
            return
        }
        case 2: 
        {
            skip_d4bd762c514693b7( data.lexer/*[ ws ]*/, data, 16777215 );
            data.stack[0] = $arg;
            data.stash[0] = 0;
            return
        }
        case 3: 
        {
            skip_d4bd762c514693b7( data.lexer/*[ ws ]*/, data, 16777215 );
            data.stack[0] = $arg_initials;
            data.stash[0] = 0;
            return
        }
        case 4: 
        {
            skip_d4bd762c514693b7( data.lexer/*[ ws ]*/, data, 16777215 );
            data.stack[0] = $arg_key_val;
            data.stash[0] = 0;
            return
        }
        case 5: 
        {
            skip_d4bd762c514693b7( data.lexer/*[ ws ]*/, data, 16777215 );
            data.stack[0] = $naked_arg;
            data.stash[0] = 0;
            return
        }
        case 6: 
        {
            skip_d4bd762c514693b7( data.lexer/*[ ws ]*/, data, 16777215 );
            data.stack[0] = $key;
            data.stash[0] = 0;
            return
        }
        case 7: 
        {
            skip_d4bd762c514693b7( data.lexer/*[ ws ]*/, data, 16777215 );
            data.stack[0] = $val;
            data.stash[0] = 0;
            return
        }
        case 8: 
        {
            skip_d4bd762c514693b7( data.lexer/*[ ws ]*/, data, 16777215 );
            data.stack[0] = $default_productions__js_identifier;
            data.stash[0] = 0;
            return
        }
        case 9: 
        {
            skip_d4bd762c514693b7( data.lexer/*[ ws ]*/, data, 16777215 );
            data.stack[0] = $default_productions__js_id_symbols;
            data.stash[0] = 0;
            return
        }
        case 10: 
        {
            skip_d4bd762c514693b7( data.lexer/*[ ws ]*/, data, 16777215 );
            data.stack[0] = $default_productions__string;
            data.stash[0] = 0;
            return
        }
        case 11: 
        {
            skip_d4bd762c514693b7( data.lexer/*[ ws ]*/, data, 16777215 );
            data.stack[0] = $default_productions__string_token;
            data.stash[0] = 0;
            return
        }
        case 12: 
        {
            skip_d4bd762c514693b7( data.lexer/*[ ws ]*/, data, 16777215 );
            data.stack[0] = $default_productions__string_value;
            data.stash[0] = 0;
            return
        }
        case 13: 
        {
            skip_d4bd762c514693b7( data.lexer/*[ ws ]*/, data, 16777215 );
            data.stack[0] = $args_group_0_0_;
            data.stash[0] = 0;
            return
        }
        case 14: 
        {
            skip_d4bd762c514693b7( data.lexer/*[ ws ]*/, data, 16777215 );
            data.stack[0] = $arg_initials_group_2_0_;
            data.stash[0] = 0;
            return
        }
        case 15: 
        {
            skip_d4bd762c514693b7( data.lexer/*[ ws ]*/, data, 16777215 );
            data.stack[0] = $val_list_1;
            data.stash[0] = 0;
            return
        }
        case 16: 
        {
            skip_d4bd762c514693b7( data.lexer/*[ ws ]*/, data, 16777215 );
            data.stack[0] = $args_group_0_0__list_0;
            data.stash[0] = 0;
            return
        }
    }
};
        sequence_lookup = [45,45,95,36,34,39,92,61];

        return {
            get_next_command_block, 
            sequence_lookup, 
            lookup_table, 
            run, 
            dispatch, 
            init_table,
            init_data, 
            delete_data:_=>_,
            recognizer,
            get_fork_information
        };
    });

    const reduce_functions = [(e,sym)=>sym[sym.length-1], (env, sym, pos)=>((Object.assign(Object.fromEntries(sym[0].map(([key,val,hyphens],i)=>[key,{index:i,val:val,hyphens:hyphens}])),{__array__:sym[0]})))/*0*/
,(env, sym, pos)=>(sym[1].split("").flatMap((v,i,r)=>{if(i==r.length-1&&sym[2])if(!!(typeof env.data[v]=="string"?env.data[env.data[v]]:env.data[v])||(sym[2].e)){return {key:v,val:sym[2].v,hyphens:1};}else return [{key:v,val:true,hyphens:1},{key:sym[2].v,val:null,hyphens:0}];return {key:v,val:true,hyphens:1};}))/*1*/
,(env, sym, pos)=>(sym[1].split("").flatMap((v,i,r)=>{if(i==r.length-1&&null)if(!!(typeof env.data[v]=="string"?env.data[env.data[v]]:env.data[v])||(null.e)){return {key:v,val:null.v,hyphens:1};}else return [{key:v,val:true,hyphens:1},{key:null.v,val:null,hyphens:0}];return {key:v,val:true,hyphens:1};}))/*2*/
,(env, sym, pos)=>((sym[2])?(!!(typeof env.data[sym[1]]=="string"?env.data[env.data[sym[1]]]:env.data[sym[1]])||sym[2].e)?{key:sym[1],val:sym[2].v,hyphens:2}:[{key:sym[1],val:true,hyphens:2},{key:sym[2].v,val:null,hyphens:0}]:{key:sym[1],hyphens:2})/*3*/
,(env, sym, pos)=>((null)?(!!(typeof env.data[sym[1]]=="string"?env.data[env.data[sym[1]]]:env.data[sym[1]])||null.e)?{key:sym[1],hyphens:2}:[{key:sym[1],val:true,hyphens:2},{key:null.v,val:null,hyphens:0}]:{key:sym[1],hyphens:2})/*4*/
,(env, sym, pos)=>({key:sym[0],val:null,hyphens:0})/*5*/
,(env, sym, pos)=>(sym[0]+sym[1])/*6*/
,(env, sym, pos)=>(sym[0])/*7*/
,(env, sym, pos)=>(sym[1])/*8*/
,(env, sym, pos)=>(sym[0]+"")/*9*/
,(env, sym, pos)=>(sym[1]+"")/*10*/
,(env, sym, pos)=>(sym[0]+sym[2])/*11*/
,(env, sym, pos)=>(sym[0].flat().map(({key,val,hyphens})=>[key,val,hyphens]))/*12*/
,(env, sym, pos)=>({e:!!sym[0],v:sym[1]})/*13*/
,(env, sym, pos)=>({e:!!null,v:sym[0]})/*14*/
,(env, sym, pos)=>([sym[0]])/*15*/
,(env, sym, pos)=>(sym[0].concat(sym[1]))/*16*/];

    export default ParserFactory(reduce_functions, undefined, recognizer_initializer);
    