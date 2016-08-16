require('babel-polyfill');

import { fn_a, var_a as var_a_newName } from './module-file-a';
import newName from  './module-file-a';

// fn_a();
// console.log(var_a_newName);
// console.log(typeof newName);
const a=() =>{
    const b = {a:'a'}
    const c = {...b};
    console.log('hello');
    console.log('xxxrbyebuildDir', c);
}

a();
