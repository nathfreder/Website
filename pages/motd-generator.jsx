import React, { Component } from 'react';
import Layout from '../components/Layout';
import { Button } from 'react-bootstrap';

export default class extends Component {
  render = () => (
    <Layout title="MOTD Generator">
      <a href="https://motd-generator.mcpe.fun/">
        <Button variant="secondary">
          Open in new tab
        </Button>
      </a>
      <iframe width="100%" height="500px" frameBorder="0" src="https://motd-generator.mcpe.fun/" title="MOTD Generator" />
    </Layout>
  );
}
