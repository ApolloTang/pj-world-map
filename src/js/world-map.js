import d3 from 'd3';
import dimensions from './dimensions';



function addOptimizedEventListener(nativeEventType, optimizedEventType, cb, obj) {
    const throttle = function(_nativeEventType, _optimizedEventType, _obj) {
        // ref: https://developer.mozilla.org/en-US/docs/Web/Events/resize
        _obj = _obj || window;
        var running = false;
        var internalCb = function(evt) {
            if (running) { return; }
            running = true;
            requestAnimationFrame(function() {
                _obj.dispatchEvent( new CustomEvent( _optimizedEventType, { 'detail': evt }) );
                running = false;
            });
        };
        _obj.addEventListener(_nativeEventType, internalCb);
        var _removeInternalHandler = function() {
            _obj.removeEventListener(_nativeEventType, internalCb);
        }
        return _removeInternalHandler;
    } // end throttle

    obj = obj || window;
    var removeInternalHandler = throttle(nativeEventType, optimizedEventType, obj);
    obj.addEventListener(optimizedEventType, cb);

    var removeHandler = function() {
        obj.removeEventListener(optimizedEventType, cb);
        removeInternalHandler();
        return 'eventHandler "' + optimizedEventType + '" removed on '+obj;
    }
    return removeHandler;
}

export default class WorldMap {
    getSelectionsAndNodes(node_container) {
        const __d = this.__d;

        const container = d3.select(node_container);

        const svg = container.append('svg')
            .attr('width', __d.svg.w).attr('height', __d.h)
            .attr('viewBox', '0 0 ' + __d.viewBox.maxW + ' ' + __d.viewBox.maxH);

        const stageWrap = svg
            .append('g').classed('stageWrap', true)
            .attr('transform', 'translate(' + this.__d.margin.left + ',' + this.__d.margin.top + ')');

        const stageWrapBg = stageWrap.append('rect')
            .attr('class', 'wrap-background')
            .attr('width', __d.stageWrap.w)
            .attr('height', __d.stageWrap.h)
            .attr('fill', '#dddddd');

        const stage = stageWrap.append('g')
            .classed('stage', true)
            .attr('transform', 'translate(' + __d.padding.left + ',' + __d.padding.top + ')');

        const stageBg = stage.append('rect')
            .attr('class', 'stageBg')
            .attr('width', __d.stage.w)
            .attr('height', __d.stage.h)
            .attr('fill', 'transparent');

        const featureColl = stage.append('g')
            .classed('featureCollection', true);

        const toolTip = container.append('div').classed('map-tool-tip', true).text('tool tip');

        return {
            selections: {
                container,
                svg,
                featureColl,
                stageWrap,
                stageWrapBg,
                stage,
                stageBg,
                featureColl,
                toolTip
            },
            nodes: {
                container: node_container,
                svg: svg.node(),
                toolTip: toolTip.node(),
            }
        }
    }

    updatePositionAndSize() {
        const container_node = this.__s.container.node();

        const boundingClient_container = container_node.getBoundingClientRect();
        console.log('boundingClient_container', boundingClient_container);

        const boundingDoc_container = {
            top: boundingClient_container.top + scrollOffset.y,
            left: boundingClient_container.left + scrollOffset.x
        };
        console.log('boundingDoc_container', boundingDoc_container);
        const scrollOffset = getScrollOffsets();
        console.log('scrollOffset', scrollOffset);
    }

    updateToolTipPositions() {
    }

    addListener() {
        const that = this;

        this.__removeEventHandlers.optimizedResize = addOptimizedEventListener("resize", "optimizedResize", function(evt) {
            const resizeEvent = evt.detail;
            console.log("Resource conscious resize: ", resizeEvent);
            // that.updatePositionAndSize();
        }, window);

        this.__removeEventHandlers.optimizedMousemove = addOptimizedEventListener("mousemove", "optimizedMousemove", function(evt) {
            const mouseEvent = evt.detail;
            const coord_client = {
                x:mouseEvent.clientX,
                y:mouseEvent.clientY,
            }
            console.log("Resource conscious mousemove:", mouseEvent, coord_client);
        }, this.__n.svg);

        this.__removeEventHandlers.optimizedScroll = addOptimizedEventListener("scroll", "optimizedScroll", function(evt) {
            const scrollEvent = evt.detail;
            const getOffsets = function() {
                // Return the current scrollbar offsets as the x and y properties
                if (window.pageXOffset != null) return {x: window.pageXOffset, y:window.pageYOffset};
            }
            console.log("Resource conscious scroll: ", scrollEvent, getOffsets());
            //     that.updatePositionAndSize();
        }, window);

        // __s.svg.node().addEventListener('mousemove',function(evt){
        //     const coord_client = {
        //         x:evt.clientX,
        //         y:evt.clientY,
        //     }
        //     n_toolTip.style.left = `${coord_client.x}px`;
        //     n_toolTip.style.top = `${coord_client.y}px`;
        // }, false);
    }

    removeListener() {
        console.log(this.__removeEventHandlers.optimizedMousemove() );
        console.log(this.__removeEventHandlers.optimizedResize() );
        console.log(this.__removeEventHandlers.optimizedScroll() );
    }

    destructor(){
        this.removeListener();
    }

    constructor(node_container) {
        window.w = this;

        //configuration
        const __d = this.__d = dimensions;

        // generate common use selections and nodes
        const selectionsAndNodes = this.getSelectionsAndNodes(node_container);
        const __s = this.__s = selectionsAndNodes.selections;
        const __n = this.__n = selectionsAndNodes.nodes;

        this.__removeEventHandlers = {};
        this.addListener();

        // __s.stage.call( // must bind zoom to the svg not to the group, see: // http://bl.ocks.org/cpdean/7a71e687dd5a80f6fd57
        __s.svg.call(
            d3.behavior.zoom()
            .translate([0, 0])
            .scale(1)
            .scaleExtent([1, 14])
            .on('zoom', ()=>{
                __s.stage.attr('transform', 'translate('+d3.event.translate+')scale('+d3.event.scale+')');
            })
        );

        const n_toolTip = __n.toolTip; // __s.toolTip.node();
        n_toolTip.style.position = 'absolute';

        // __s.svg.node().addEventListener('mousemove',function(evt){
        //     const coord_client = {
        //         x:evt.clientX,
        //         y:evt.clientY,
        //     }
        //     n_toolTip.style.left = `${coord_client.x}px`;
        //     n_toolTip.style.top = `${coord_client.y}px`;
        // }, false);

        // __s.stage.on('mousemove', function(e){
        //     var svgP = d3.mouse(this);
        //     var svgX = svgP[0];
        //     var svgY = svgP[1];
        //     const coord_client = getClientCoordinate({x:svgX, y:svgY});
        //     n_toolTip.style.left = `${coord_client.x}px`;
        //     n_toolTip.style.top = `${coord_client.y}px`;
        // });


        function getClientCoordinate(coord_svg) {
            var svgNode = __s.svg.node();
            var targetArea = __s.featureColl.node();
            var m = targetArea.getScreenCTM();
            var svgP = svgNode.createSVGPoint();
            svgP.x = coord_svg.x;
            svgP.y = coord_svg.y;
            var coord_client = svgP.matrixTransform(m);
            var clientX = coord_client.x;
            var clientY = coord_client.y;
            return { 'x': clientX, 'y': clientY};
        }

        // const onMouseEnter = function() {
        //     console.log('mouse Enter')
        // }
        //
        // const onMouseLeave = function() {
        //     console.log('mouse Leave')
        // }
        // featureColl.on('mouseenter', onMouseEnter);
        // featureColl.on('mouseleave', onMouseLeave);

        const translation_h = __d.stage.w/2;
        const translation_v = __d.stage.h/2 * 1.1;
        const projection = d3.geo.mercator().scale(480).translate([translation_h,translation_v]);
        const geoPath = d3.geo.path().projection(projection);

        let myInterval = void 0;
        d3.json("/data/world.geojson", createMap);
        function createMap(countries) {
            __s.featureColl.selectAll("path").data(countries.features)
                .enter()
                .append("path")
                .attr("d", geoPath)
                .attr("class", "countries")
                // .each(function(item, i){ console.log(i, item.id, item.properties.name) })
                .on('mouseenter', function(d, i){
                    const selection_this = d3.select(this);
                    selection_this.classed('mouse-over', true);
                    const thisCentroid = geoPath.centroid(d);
                    const coord_client = getClientCoordinate({x:thisCentroid[0], y:thisCentroid[1]});
                    n_toolTip.style.display = `block`;
                    n_toolTip.style.left = `${coord_client.x}px`;
                    n_toolTip.style.top = `${coord_client.y}px`;
                    n_toolTip.innerHTML = d.properties.name ;
                })
                .on('mouseleave', function(item, i){
                    const selection_this = d3.select(this);
                    selection_this.classed('mouse-over', false);
                    n_toolTip.style.display = `none`;
                })
        }
    }
}

