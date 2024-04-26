import {useEffect, useRef} from "react";
import * as d3 from "d3";

/**
 * Component for displaying a histogram
 * @param array The array of values that will be displayed.
 * @param widthProp The width of the histogram
 * @param heightProp The height of the histogram
 * @param binsProp The number of bins the histogram will have
 * @param maxValue The maximum value of the array. Used to cut of the histogram at that value
 * @returns {JSX.Element}
 * @constructor
 */
const Histogram = ({array, widthProp, heightProp, binsProp, minCutoff, maxCutoff}) => {
    const d3Container = useRef(null);

    /**
     * UseEffect to for creating the histogram svg
     */
    useEffect(() => {
        if (array && d3Container.current) {
            const svg = d3.select(d3Container.current);

            svg.selectAll("*").remove();

            const margin = {top: 20, right: 20, bottom: 50, left: 70},
                width = widthProp - margin.left - margin.right,
                height = heightProp - margin.top - margin.bottom;

            const x = d3.scaleLinear()
                .domain([minCutoff, maxCutoff])
                .range([0, width])

            const bins = d3.histogram()
                .domain(x.domain())
                .thresholds(x.ticks(binsProp))
                (array);

            const y = d3.scaleLinear()
                .domain([0, d3.max(bins, d => d.length)]).nice()
                .range([height, 0]);

            const g = svg.append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);


            g.selectAll("rect")
                .data(bins)
                .enter().append("rect")
                .attr("x", d => x(d.x0) + 1)
                .attr("y", d => y(d.length))
                .attr("width", d => x(d.x1) - x(d.x0))
                .attr("height", d => height - y(d.length))
                .attr("fill", d => `hsl(${d.x0}, 100%, 50%)`);

            // X-axis label
            g.append("text")
                .attr("transform", `translate(${width / 2}, ${height + margin.top + 20})`)
                .style("text-anchor", "middle")
                .text("Hue value");

            // Y-axis label
            g.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("Pixel count");

            g.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x));

            // Add the y-axis
            g.append("g")
                .call(d3.axisLeft(y));
        }
    }, [array, binsProp, heightProp, maxCutoff, minCutoff, widthProp]);

    return (
        <svg
            className={"d3-component"}
            width={widthProp}
            height={heightProp}
            ref={d3Container}/>
    )

}

export default Histogram;