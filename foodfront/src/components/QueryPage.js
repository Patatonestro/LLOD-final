import React, { useState, useEffect, useRef } from 'react';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/eclipse.css';
import CodeMirror from 'codemirror';
import 'codemirror/mode/python/python';
import '../styles/QueryPage.css';
import GraphVisualization from './GraphVisualization';

const QueryPage = () => {
  const [query, setQuery] = useState('');
  const [dataView, setDataView] = useState('data');
  const [graphData, setGraphData] = useState(null);
  const [graphVisualizationData, setGraphVisualizationData] = useState(''); // 图谱数据
  const [isExpanded, setIsExpanded] = useState(false);
  const editorRef = useRef(null);
  const codeMirrorInstance = useRef(null);

  useEffect(() => {
    codeMirrorInstance.current = CodeMirror(editorRef.current, {
      value: query,
      mode: 'python',
      theme: 'eclipse',
      lineNumbers: true,
      lineWrapping: true,
    });

    codeMirrorInstance.current.on('change', (instance) => {
      setQuery(instance.getValue());
    });

    return () => {
      if (codeMirrorInstance.current) {
        const editorParent = codeMirrorInstance.current.getWrapperElement().parentNode;
        if (editorParent) {
          editorParent.removeChild(codeMirrorInstance.current.getWrapperElement());
        }
        codeMirrorInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handle = document.querySelector('.resize-handle');
    if (!handle) return;

    const dataPanel = document.querySelector('.data-panel');
    const graphPanel = document.querySelector('.graph-panel');
    const container = document.querySelector('.results-container');

    if (!dataPanel || !graphPanel || !container) return;

    let isResizing = false;

    const startResizing = () => {
      isResizing = true;
      document.addEventListener('mousemove', resize);
      document.addEventListener('mouseup', stopResizing);
    };

    const resize = (e) => {
      if (!isResizing) return;
      const containerWidth = container.offsetWidth;
      const newWidth = (e.clientX / containerWidth) * 100;
      dataPanel.style.flex = `${newWidth}`;
      graphPanel.style.flex = `${100 - newWidth}`;
    };

    const stopResizing = () => {
      isResizing = false;
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResizing);
    };

    handle.addEventListener('mousedown', startResizing);

    return () => {
      handle.removeEventListener('mousedown', startResizing);
    };
  }, []);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSubmit = async () => {
    try {
        const [sparqlResponse, graphResponse] = await Promise.all([
            fetch('/api/sparql/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            }),
            fetch('/api/graph/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            }),
        ]);

        // SPARQL 
        const sparqlResult = await sparqlResponse.json();
        if (sparqlResult.error) {
            console.error('SPARQL Query Error:', sparqlResult.error);
        } else {
            console.log('SPARQL Result:', sparqlResult);
            setGraphData(sparqlResult); 
        }
        // 图谱
        const graphResult = await graphResponse.json();
        if (graphResult.error) {
            console.error('Graph Query Error:', graphResult.error);
            return;
          }
        const transformToCytoscapeData = (data) => ({
          nodes: data.nodes.map((node) => ({
            data: { id: node.id, label: node.label },
          })),
          edges: data.edges.map((edge) => ({
            data: { source: edge.source, target: edge.target, label: edge.label },
          })),
        });
    
        // 验证+转换格式
        const validateGraphData = (data) => {
          const nodeIds = data.nodes.map((node) => node.id);
          const invalidEdges = data.edges.filter(
            (edge) => !nodeIds.includes(edge.source) || !nodeIds.includes(edge.target)
          );
    
          if (invalidEdges.length > 0) {
            console.error('Invalid edges detected:', invalidEdges);
          }
    
          return data;
        };
    
        const validatedGraphData = validateGraphData(graphResult);
        const cytoscapeData = transformToCytoscapeData(validatedGraphData);
    
        console.log('Validated and Transformed Graph Data:', cytoscapeData);
    
        // 转数据，Cytoscape 渲染
        setGraphVisualizationData(cytoscapeData);
    
      } catch (error) {
        console.error('Error during graph processing:', error);
      }
    };

  const transformToGraph = (sparqlResults) => {
    const nodes = [];
    const edges = [];

    if (sparqlResults && sparqlResults.results) {
      sparqlResults.results.bindings.forEach((binding) => {
        const subject = binding.subject.value;
        const predicate = binding.predicate.value;
        const object = binding.object.value;

        if (!nodes.find((node) => node.data.id === subject)) {
          nodes.push({ data: { id: subject, label: subject } });
        }
        if (!nodes.find((node) => node.data.id === object)) {
          nodes.push({ data: { id: object, label: object } });
        }

        edges.push({ data: { source: subject, target: object, label: predicate } });
      });
    }

    return { nodes, edges };
  };

  return (
    <div className="query-page">
      <div className="query-container">
        <div
          ref={editorRef}
          className={`code-editor ${isExpanded ? 'expanded' : ''}`}
        />
        <button className="expand-btn" onClick={toggleExpand}>
          {isExpanded ? '▲' : '▼'}
        </button>
        <button className="submit-btn" onClick={handleSubmit}>
          Submit
        </button>
      </div>

     <div className="results-container">
        <div className="data-panel">
          <h3>Query Results</h3>
          {graphData ? (
            <pre>{JSON.stringify(graphData, null, 2)}</pre>
          ) : (
            <p>No data available</p>
          )}
        </div>
        <div className="resize-handle"></div>
        <div className="graph-panel">
          <h3>Graph Visualization</h3>
          <GraphVisualization data={graphVisualizationData} />
        </div>
      </div>
    </div>
  );
};

export default QueryPage;
