import React, { Component } from 'react';
import * as d3 from 'd3';

import { connect } from 'react-redux';
import { fetchData } from '../actions/index';

class App extends Component {
  constructor(props){
    super(props);
    this.createBarChart = this.createBarChart.bind(this);
    this.props.fetchData();
    if (this.props.data) {
      this.createBarChart();
    }
   }

   componentDidUpdate() {
      this.createBarChart();
   }

   createBarChart() {
     const { data, description } = this.props;

     var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

     const margin = {
       top: 30,
       right: 50,
       bottom: 30,
       left: 50
     };

     const w = 1000;
     const h = 500;
     const padding = 20;

     const minDate = new Date(data[0][0]);
     const maxDate = new Date(data[274][0]);

     const xScale = d3.scaleTime()
                      .domain([minDate, maxDate])
                      .range([margin.left, w - margin.right]);

     const yScale = d3.scaleLinear()
                      .domain([0, d3.max(data, d => { return d[1] })])
                      .range([h - margin.bottom, margin.top]);

     const colorScale = d3.scaleLinear()
                          .domain([0, d3.max(data, d => { return d[1] })])
                          .range([0, 255]);

     const xAxis = d3.axisBottom(xScale)
                     .ticks(d3.timeYear.every(5));

     const yAxis = d3.axisLeft(yScale);

     const div = d3.select('body')
                   .append('div')
                   .attr('class', 'tooltip')
                   .style('opacity', 0);

     const svg = d3.select('.chart')
                   .append('svg')
                   .attr('width', w)
                   .attr('height', h);

     svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', (d, i) => {
          return xScale(new Date(d[0]));
        })
        .attr('y', d => {
          return yScale(d[1]);
        })
        .attr('width', Math.round(w / data.length))
        .attr('height', d => {
          return h - margin.bottom - yScale(d[1]);
        })
        .attr('fill', d => {
          return `rgb(50, 50, ${Math.floor(colorScale(d[1]))})`;
        })
        .on('mouseover', function(d) {
          const xPosition = parseFloat(d3.select(this).attr('x')) + (Math.round(w / data.length) / 2);

          const yPosition = parseFloat(d3.select(this).attr('y')) + (h - yScale(d[1])) / 2;

          const currentTime = new Date(d[0]);
          const year = currentTime.getFullYear();
          const month = months[currentTime.getMonth()];

          div.style('opacity', 0.9)
             .html(`<strong>$${d[1]} Billion</strong><br>${year} - ${month}`)
             .style('left', `${xPosition}px`)
             .style('top', `${yPosition}px`);
        });

     svg.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0, ${h - margin.bottom})`)
        .call(xAxis);

     svg.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(yAxis);

     svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', - margin.top)
        .attr('y', margin.left + padding)
        .style('text-anchor', 'end')
        .text('Gross Domestic Product, USA');

     d3.select('.notes')
       .append('text')
       .text(description);

   }

  render() {
    return(
      <div>
        <div className='chart'></div>
        <div className='notes'></div>
      </div>
    )
  }
}

function mapStateToProps({ data }) {
  return {
    description: data.description,
    data: data.data
  };
}

export default connect(mapStateToProps, { fetchData })(App);
