import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface ProjectProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export function ProjectProgressRing({ 
  progress, 
  size = 60, 
  strokeWidth = 6, 
  color = '#06b6d4' 
}: ProjectProgressRingProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const radius = size / 2;
    const innerRadius = radius - strokeWidth;
    
    const g = svg.append('g')
      .attr('transform', `translate(${radius}, ${radius})`);

    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .startAngle(0);

    // Background track
    g.append('path')
      .datum({ endAngle: 2 * Math.PI })
      .style('fill', '#1e293b') // slate-800
      .attr('d', arc as any);

    // Progress bar
    const progressArc = arc.endAngle((progress / 100) * 2 * Math.PI);
    
    g.append('path')
      .datum({ endAngle: 0 })
      .style('fill', color)
      .attr('d', arc as any)
      .transition()
      .duration(1000)
      .attrTween('d', function(d: any) {
        const interpolate = d3.interpolate(d.endAngle, (progress / 100) * 2 * Math.PI);
        return function(t) {
          d.endAngle = interpolate(t);
          return arc(d) as string;
        };
      });

    // Percentage text
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('class', 'font-mono font-bold text-[10px]')
      .style('fill', '#fff')
      .text(`${Math.round(progress)}%`);

    // Intensity glow transition
    const glowScale = d3.scaleLinear()
      .domain([0, 100])
      .range([2, 10]);

    const opacityScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0.1, 0.6]);

    svg.transition()
      .duration(1000)
      .style('filter', `drop-shadow(0 0 ${glowScale(progress)}px ${color}${Math.round(opacityScale(progress) * 255).toString(16).padStart(2, '0')})`);

  }, [progress, size, strokeWidth, color]);

  return (
    <svg ref={svgRef} width={size} height={size} />
  );
}
