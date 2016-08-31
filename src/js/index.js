require('babel-polyfill');
import wordMap from  './world-map.js';

const worldMapContainer = document.getElementById('world-map');

wordMap(worldMapContainer);
