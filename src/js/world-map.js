import d3 from 'd3';

const w_svg = 3000;
const h_svg = 1800;

var viewBoxMaxX = w_svg;
var viewBoxMaxY = h_svg;
var selection = {};


export default function(node) {
    var el = d3.select(node)

    var svgContainer = el
        .select('svg')
        .attr('class', 'd3')
        .attr('width', '100%').attr('height', '100%')
        .attr('viewBox', '0 0 ' + viewBoxMaxX + ' ' + viewBoxMaxY);
    selection.svg = svgContainer;

    d3.json("/data/world.geojson", createMap);
    const translation_h = w_svg/2;
    const translation_v = h_svg/2 * 1.1;
    function createMap(countries) {
        var aProjection = d3.geo.mercator().scale(480).translate([translation_h,translation_v]);
        var geoPath = d3.geo.path().projection(aProjection);
        d3.select("svg").selectAll("path").data(countries.features)
            .enter()
            .append("path")
            .attr("d", geoPath)
            .attr("class", "countries")
            // .each(function(item, i){ console.log(i, item.id, item.properties.name) })
            // .on('mouseover', function(item, i){ console.log(i, item.id, item.properties.name) })
    }
}

