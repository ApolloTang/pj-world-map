import d3 from 'd3';

const w_svg = 3000;
const h_svg = 1800;

var viewBoxMaxX = w_svg;
var viewBoxMaxY = h_svg;

function zoom(_selection) {
   _selection.attr("transform", "translate("
       + d3.event.translate
       + ")scale(" + d3.event.scale + ")");
}

export default function(node) {
    var el = d3.select(node)

    var svgContainer = el.append('svg');
    var featureColl = svgContainer.append('g').classed('featureCollection', true);
    var toolTip = el.append('div').text('tool tip');

    featureColl.call(
        d3.behavior.zoom()
        .translate([0, 0])
        .scale(1)
        .scaleExtent([1, 14])
        .on("zoom", function(){zoom(featureColl)})
    );

    svgContainer
        .attr('class', 'd3-world-map')
        .attr('width', '100%').attr('height', '100%')
        .attr('viewBox', '0 0 ' + viewBoxMaxX + ' ' + viewBoxMaxY);

    const translation_h = w_svg/2;
    const translation_v = h_svg/2 * 1.1;
    var aProjection = d3.geo.mercator().scale(480).translate([translation_h,translation_v]);
    var geoPath = d3.geo.path().projection(aProjection);

    d3.json("/data/world.geojson", createMap);

    function createMap(countries) {
        featureColl.selectAll("path").data(countries.features)
            .enter()
            .append("path")
            .attr("d", geoPath)
            .attr("class", "countries")
            // .each(function(item, i){ console.log(i, item.id, item.properties.name) })
            // .on('mouseover', function(item, i){ console.log(i, item.id, item.properties.name) })
    }
}

