import '../styles/GraphVisualization.css';
import React, { useRef, useEffect, useState } from 'react';
import cytoscape from 'cytoscape';

const GraphVisualization = ({ data }) => {
  const cyRef = useRef(null);
  const containerRef = useRef(null);
  const [selectedNodeContent, setSelectedNodeContent] = useState(''); 
  const [searchLabel, setSearchLabel] = useState('');

  useEffect(() => {
    if (!data || !data.nodes || !data.edges) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements: [...data.nodes, ...data.edges],
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            'background-color': '#6B46C1',
            color: '#ffffff',
            'font-size': '12px',
            'text-valign': 'center',
            'text-halign': 'center',
            'text-wrap': 'wrap',
            'text-max-width': '40px',
            'width': '50px',
            'height': '50px',
          },
        },
        {
          selector: 'edge',
          style: {
            label: 'data(label)',
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
            'line-color': '#9F7AEA',
            'font-size': '10px',
          },
        },
        {
          selector: 'node.highlight',
          style: {
            'background-color': '#FFD700',
            'border-width': '3px',
            'border-color': '#FF4500',
          },
        },
      ],
      layout: {
        name: 'cose',
        animate: true,
      },
    });

    // 点击节点显示完整内容
    cy.on('tap', 'node', (event) => {
      const node = event.target;
      const fullLabel = node.data('fullLabel');
      setSelectedNodeContent(fullLabel);
    });

    cyRef.current = cy;

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [data]);

  // 搜索节点并高亮
  const searchNode = () => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.elements().removeClass('highlight');
  // 部分匹配
    const nodes = cy.nodes().filter((ele) =>
      ele.data('label').toLowerCase().includes(searchLabel.toLowerCase()) // 部分匹配
    );

    if (nodes.length > 0) {
      cy.center(nodes);
      nodes.addClass('highlight');
    } else {
      alert('No matching node found!');
    }
  };

  return (
    <div className="graph-visualization-container">
      <div className="graph-search">
        <input
          type="text"
          value={searchLabel}
          onChange={(e) => setSearchLabel(e.target.value)}
          placeholder="Enter node label"
        />
        <button onClick={searchNode}>Search</button>
      </div>
      <div ref={containerRef} className="graph-container" />
      {selectedNodeContent && (
        <div className="node-content">
          <h4>Node Details:</h4>
          <p>{selectedNodeContent}</p>
        </div>
      )}
    </div>
  );
};

export default GraphVisualization;
