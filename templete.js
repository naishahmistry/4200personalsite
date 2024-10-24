// Load the data
const iris = d3.csv('iris.csv');

// Once the data is loaded, proceed with plotting
iris.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;
    });

    // Define the dimensions and margins for the SVG
    let 
    width = 600,
    height = 400;

    let margin = {
    top: 30,
    bottom: 50,
    left: 50,
    right: 30
    };

    // Create the SVG container
    let svg = d3.select('#scatterplot')
                .append('svg')
                .attr('width', width)    
                .attr('height', height) 
                .style('background', 'white');

    // Set up scales for x and y axes
    // d3.min(data, d => d.bill_length_mm)-5
    let yScale = d3.scaleLinear()
                .domain([d3.min(data, d => d.PetalWidth) - 0.2, d3.max(data, d => d.PetalWidth) + 0.2])
                .range([height - margin.bottom, margin.top]);

    let xScale = d3.scaleLinear()
                .domain([d3.min(data, d => d.PetalLength) - 0.5, d3.max(data, d => d.PetalLength) + 0.5])
                .range([margin.left, width - margin.right]);

    const colorScale = d3.scaleOrdinal()
                .domain(data.map(d => d.Species))
                .range(d3.schemeCategory10);

    // Add scales
    let yAxis = svg.append('g')     
                .call(d3.axisLeft(yScale))   
                .attr('transform', `translate(${margin.left}, 0)`);  

    let xAxis = svg.append('g')
                .call(d3.axisBottom(xScale))
                .attr('transform', `translate(0, ${height - margin.bottom})`);  
    
    // Add circles for each data point
    let circle = svg.selectAll('circle')
                    .data(data)
                    .enter()
                    .append('circle')
                    .attr('cx', d => xScale(d.PetalLength))
                    .attr('cy', d => yScale(d.PetalWidth))
                    .attr('fill', d => colorScale(d.Species)) 
                    .attr('r', 5);
        
    // Add x-axis label
    svg.append('text')
        .attr('x', (width / 2) + 15)
        .attr('y', height - 15)
        .text('Petal Length')
        .style('text-anchor', 'middle');
        
    // Add y-axis label
    svg.append('text')
        .attr('x', - (height / 2) + 25)   
        .attr('y', 20)
        .text('Petal Width')
        .style('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)');  

    // Add legend
    const legend = svg.selectAll('.legend')
                        .data(colorScale.domain())
                        .enter().append('g')
                        .attr('class', 'legend')
                        .attr('transform', (d, i) => 'translate(75,' + (i * 20 + 50) + ')');

    legend.append('circle')         
            .attr('r', 5)             
            .style('fill', colorScale);

    legend.append('text')
            .attr('x', 10)    
            .attr('y', 5)   
            .text(d => d);      

});

iris.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
    });
    
    // Define the dimensions and margins for the SVG
    let 
    width = 600,
    height = 400;

    let margin = {
    top: 30,
    bottom: 50,
    left: 50,
    right: 30
    };

    // Create the SVG container
    let svg = d3.select('#boxplot')
                .append('svg')
                .attr('width', width)    
                .attr('height', height) 
                .style('background', 'white');    

    // Set up scales for x and y axes
    let yScale = d3.scaleLinear() 
                .domain([d3.min(data, d => d.PetalLength), d3.max(data, d => d.PetalLength)]) 
                .range([height - margin.bottom, margin.top]);

    let xScale = d3.scaleBand()
                .domain(data.map(d => d.Species))
                .range([margin.left, width - margin.right])
                .padding(0.5);
    
    // Add scales     
    let yAxis = svg.append('g')
                .call(d3.axisLeft().scale(yScale))
                .attr('transform', `translate(${margin.left},0)`);

    let xAxis  = svg.append('g')
                .call(d3.axisBottom().scale(xScale))
                .attr('transform', `translate(0,${height-margin.bottom})`);
    
    // Add x-axis label
    svg.append('text')
        .attr('x', (width / 2) + 10)
        .attr('y', height - 15)
        .text('Species')
        .style('text-anchor', 'middle');
        
    // Add y-axis label
    svg.append('text')
        .attr('x', - (height / 2) + 15)   
        .attr('y', 15)
        .text('Petal Length')
        .style('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)');  

    // Create a function to find q1, median, and q3
    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.PetalLength).sort(d3.ascending);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.median(values);
        const q3 = d3.quantile(values, 0.75);
        return {q1, median, q3};
    };

    // Calculates quartiles and median for each species
    const quartilesBySpecies = d3.rollup(data, rollupFunction, d => d.Species);

    quartilesBySpecies.forEach((quartiles, Species) => {
        // Calculates where the boxplot should be with respect to the x-axis and the width of the boxplot
        const x = xScale(Species);
        const boxWidth = xScale.bandwidth();

        // Get values from quartiles input
        const {q1, median, q3} = quartiles;

        // Draw vertical lines
        svg.append('line')
            .attr('x1', x + (boxWidth / 2))
            .attr('x2', x + (boxWidth / 2))
            .attr('y1', yScale(q1 - (1.5 * (q3 - q1))))
            .attr('y2', yScale(q3 + (1.5 * (q3 - q1))))
            .attr('stroke', 'black')          
            .attr('stroke-width', 2);   
            
        // Draw box
        svg.append('rect')
            .attr('x', x)    
            .attr('y', yScale(q3))          
            .attr('width', boxWidth)        
            .attr('height', yScale(q1) - yScale(q3)) 
            .attr('fill', 'green');

        // Draw median line
        svg.append('line')
            .attr('x1', x)
            .attr('x2', x + boxWidth)
            .attr('y1', yScale(median))
            .attr('y2', yScale(median))
            .attr('stroke', 'black')          
            .attr('stroke-width', 2);    
        
    });
});