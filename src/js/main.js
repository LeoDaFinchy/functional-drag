"use strict";

require('babel-polyfill')

import '../stylesheets/index.sass';
import './utils/colour_console';
import _ from 'lodash';
import fMain from './functional-drag'

function ready(){
  try{
    window.onload = main;
    console.log("Window found, deferring execution");
  } catch ( e ) {
    console.log("No window, executing immediately");
    main();
  }
}

ready();

function main(){
  fMain()
}
