import d3 from 'd3';

const w_svg = 3000;
const h_svg = 2000;

var viewBoxMaxX = w_svg;
var viewBoxMaxY = h_svg;
var selection = {};

var el = d3.select('#world-map')

var svgContainer = el
    .select('svg')
    .attr('class', 'd3')
    .attr('width', '100%').attr('height', '100%')
    .attr('viewBox', '0 0 ' + viewBoxMaxX + ' ' + viewBoxMaxY);
selection.svg = svgContainer;

d3.json("/data/world.geojson", createMap);

        function createMap(countries) {
            var aProjection = d3.geo.mercator().scale(480).translate([w_svg/2,h_svg/2]);
            var geoPath = d3.geo.path().projection(aProjection);
            d3.select("svg").selectAll("path").data(countries.features)
                .enter()
                .append("path")
                .attr("d", geoPath)
                .attr("class", "countries")
                .each(function(item, i){ console.log(i, item.id, item.properties.name) })
                .on('mouseover', function(item, i){ console.log(i, item.id, item.properties.name) })
        }

    // Export a named variable,
    export var var_a = {a:'module-file-a -> var_a'};

    // Export a named function:
    export function fn_a() {
        console.log('module-file-a -> fn_a()');
    }

// - - - - - - - - - - - - - - - - - - - -

    // Export the default variable/function:
    //      You can only have one default, if you have more than
    //      one, only first one is exported the rest is ignore

    var var_b;
    export default var_b = {a:'module-filea -> default var_b'};

    export default function fn_b() { }

