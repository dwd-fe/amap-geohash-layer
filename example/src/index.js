import React, { Component } from 'react';
import ReactDOM from 'react-dom';
// eslint-disable-next-line
import GeohashLayer from '../../src'
import './index.css';

class App extends Component {
  componentDidMount() {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src =
      "//webapi.amap.com/maps?v=1.4.8&key=d31b7fd120ebd92bd7aee6cca547fb2b&callback=__amap_init_callback";
    document.querySelector("body").appendChild(script);
    window.__amap_init_callback = () => {
      window.__amap_init_callback = null;
      const map = new window.AMap.Map("app", { zoom: 15 });
      const geohashLayer = new GeohashLayer({ map, strokeOpacity: 1, strokeColor: 'red' })
      geohashLayer.render()
    };
  }
  render() {
    return (
      <div id="app"></div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
