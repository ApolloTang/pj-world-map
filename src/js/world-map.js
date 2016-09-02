import d3 from 'd3';
import dimensions from './dimensions';

const w_svg = 3000;
const h_svg = 1800;

const viewBoxMaxX = w_svg;
const viewBoxMaxY = h_svg;

const margin = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
};
const padding = {
    top: 40,
    right: 75,
    bottom: 100,
    left: 75
};

function zoom(_selection) {
    _selection.attr("transform", "translate("
       + d3.event.translate
       + ")scale(" + d3.event.scale + ")");
}

function getWorker_tranfromation(svgNode, plotArea) {
    const  _getClientCoordinate  = function( { x= null, y = null } ) {

        // const svgNode = selected.svg.node();
        const p_user = svgNode.createSVGPoint();
        p_user.x =  x;
        p_user.y =  y;

        // const plotAreaNode = selected.plotArea.select('.plot-area-background').node();
        const m = plotAreaNode.getScreenCTM();   // Transformation metrix;

        const p_client = p_user.matrixTransform(m);
        return { 'x': p_client.x, 'y': p_client.y};
    }
    return _getClientCoordinate;
};


export default class WorldMap {

    getSelections(node_container) {
        const container = d3.select(node_container);
        const svgContainer = container.append('svg');
        const featureColl = svgContainer.append('g').classed('featureCollection', true);
        const toolTip = container.append('div').classed('map-tool-tip', true).text('tool tip');
        return {
            container,
            svgContainer,
            featureColl,
            toolTip
        }
    }

    constructor(node_container) {
        //configuration
        this.__d = dimensions;

        //d3 selection
        this.__s = this.getSelections(node_container);

        console.log(this.__d)

        console.log(this.__s)

        const node = node_container;
        const el = d3.select(node);
        const svgContainer = el.append('svg');
        const featureColl = svgContainer.append('g').classed('featureCollection', true);
        const toolTip = el.append('div').classed('map-tool-tip', true).text('tool tip');


        // featureColl.call(
            // must bind zoom to the svg ( like bellow)
            // not to the group (above), see:
            // http://bl.ocks.org/cpdean/7a71e687dd5a80f6fd57
        svgContainer.call(
            d3.behavior.zoom()
            .translate([0, 0])
            .scale(1)
            .scaleExtent([1, 14])
            .on("zoom", ()=>{zoom(featureColl)})
        );


        // const onMouseEnter = function() {
        //     console.log('mouse Enter')
        // }
        //
        // const onMouseLeave = function() {
        //     console.log('mouse Leave')
        // }
        // featureColl.on('mouseenter', onMouseEnter);
        // featureColl.on('mouseleave', onMouseLeave);


        featureColl.on('mousemove', function(e){
            var svgP = d3.mouse(this);
            var svgX = svgP[0];
            console.log('  a: x: ', getClientX(svgX).x, ' svg x');
        });

        // const _getClientCoordinate = getWorker_tranfromation(svgContainer.node(),featureColl.node());
        function getClientX(svgX) {
            var svgNode = svgContainer.node();
            // var targetArea = svgNode;
            var targetArea = featureColl.node();
            var m = targetArea.getScreenCTM();
            var svgP = svgNode.createSVGPoint();
            svgP.x = svgX;
            var clientX = svgP.matrixTransform(m);
            return clientX;
        }

        svgContainer
            .attr('class', 'd3-world-map')
            .attr('width', '100%').attr('height', '100%')
            .attr('viewBox', '0 0 ' + viewBoxMaxX + ' ' + viewBoxMaxY);

        const translation_h = w_svg/2;
        const translation_v = h_svg/2 * 1.1;
        const projection = d3.geo.mercator().scale(480).translate([translation_h,translation_v]);
        const geoPath = d3.geo.path().projection(projection);

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
}

